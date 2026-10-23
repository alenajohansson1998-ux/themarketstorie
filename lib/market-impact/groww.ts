import { createHash } from 'node:crypto';
import type { RadarQuote, RadarSnapshot } from './types';
import type { RadarPricePoint, RadarSeries } from './market-data';
import { GROWW_INSTRUMENTS, getGrowwInstrument } from './indian-instruments';
import type { GrowwInstrument } from './indian-instruments';
import { getGrowwAccess, invalidateGrowwAccess } from './groww-auth';

export { GROWW_INSTRUMENTS, getGrowwInstrument } from './indian-instruments';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const PROVIDER = 'Groww';
const BASE_URL = 'https://api.groww.in/v1';
const HISTORY_SOURCE = 'https://groww.in/trade-api/docs/curl/backtesting#get-historical-candle-data';
const MAX_RESPONSE_BYTES = 1_000_000;
const HISTORY_TIME_LIMIT = 'Groww returned candle timestamps without a timezone. They can provide chart context using an explicit IST assumption, but cannot support verified event-time comparisons.';

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function positiveNumber(value: unknown): number | null {
  const number = finiteNumber(value);
  return number !== null && number > 0 ? number : null;
}

function validTime(time: number, now: number): boolean {
  return Number.isFinite(time) && time >= Date.UTC(2000, 0, 1) && time <= now + 5 * 60_000;
}

interface GrowwQuoteData {
  price: number;
  timestamp: string;
  change: number | null;
  changePercent: number | null;
}

/** Quote timestamps are documented in epoch milliseconds; LTP has no timestamp. */
export function normalizeGrowwQuote(value: unknown, now = Date.now()): GrowwQuoteData | null {
  const response = record(value);
  const payload = record(response?.payload);
  if (response?.status !== 'SUCCESS' || !payload) return null;
  const price = positiveNumber(payload.last_price);
  const timestamp = finiteNumber(payload.last_trade_time);
  if (price === null || timestamp === null || !validTime(timestamp, now)) return null;
  return {
    price,
    timestamp: new Date(timestamp).toISOString(),
    // Preserve provider changes. A missing change is not zero and is not derived
    // from an unrelated prior candle or the current session's open.
    change: finiteNumber(payload.day_change),
    changePercent: finiteNumber(payload.day_change_perc),
  };
}

function validCalendar(value: string): boolean {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  return month >= 1 && month <= 12 && day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
    && Number(value.slice(11, 13)) <= 23 && Number(value.slice(14, 16)) <= 59 && Number(value.slice(17, 19)) <= 59;
}

function candleTime(value: unknown, now: number): { time: string; assumedIst: boolean } | null {
  if (typeof value === 'number') {
    const time = value * 1_000;
    return validTime(time, now) ? { time: new Date(time).toISOString(), assumedIst: false } : null;
  }
  if (typeof value !== 'string' || !validCalendar(value)) return null;
  const zoned = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  const zoneless = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?$/.test(value);
  if (!zoned && !zoneless) return null;
  // Never let a deployment host's timezone interpret Indian exchange wall time.
  // Official examples are zoneless; the assumption is disclosed and excluded
  // from event-time reaction comparisons below.
  const time = Date.parse(value.replace(' ', 'T') + (zoneless ? '+05:30' : ''));
  return validTime(time, now) ? { time: new Date(time).toISOString(), assumedIst: zoneless } : null;
}

export function normalizeGrowwCandles(value: unknown, now = Date.now()): { points: RadarPricePoint[]; assumedIst: boolean } | null {
  const response = record(value);
  const payload = record(response?.payload);
  if (response?.status !== 'SUCCESS' || !Array.isArray(payload?.candles)) return null;
  const pointsByTime = new Map<string, number>();
  let assumedIst = false;
  for (const candle of payload.candles.slice(0, 1_000)) {
    if (!Array.isArray(candle)) continue;
    const timestamp = candleTime(candle[0], now);
    const close = positiveNumber(candle[4]);
    if (!timestamp || close === null) continue;
    assumedIst ||= timestamp.assumedIst;
    pointsByTime.set(timestamp.time, close);
  }
  return {
    points: [...pointsByTime].sort(([a], [b]) => a.localeCompare(b)).map(([time, value]) => ({ time, value })),
    assumedIst,
  };
}

interface ResponseData { payload: unknown | null; reason: string | null }
interface CacheEntry extends ResponseData { expiresAt: number }
const cache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<ResponseData>>();
let budgetWindow = 0;
let budgetRequests = 0;
let nextStartAt = 0;
let startGate: Promise<void> = Promise.resolve();

async function readBoundedJson(response: Response): Promise<unknown> {
  if (Number(response.headers.get('content-length')) > MAX_RESPONSE_BYTES) throw new Error('oversized');
  if (!response.body) throw new Error('empty');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new Error('oversized');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function fetchGroww(path: string, params: URLSearchParams, ttl: number, token: string): Promise<ResponseData> {
  // A private fingerprint makes token rotation invalidate cache entries without
  // retaining the credential in a URL, cache key or returned payload.
  const fingerprint = createHash('sha256').update(token).digest('hex').slice(0, 24);
  const key = `${fingerprint}:${path}:${params.toString()}`;
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit;
  const existing = pending.get(key);
  if (existing) return existing;
  const now = Date.now();
  if (now - budgetWindow >= 60_000) { budgetWindow = now; budgetRequests = 0; }
  // This conservative shared budget covers quotes and history, including dates
  // supplied by callers. Pacing stays below Groww's 10 live-data requests/sec.
  if (budgetRequests >= 40 || pending.size >= 20) return { payload: null, reason: 'Groww request budget reached. Try again shortly.' };
  budgetRequests += 1;
  const task = (async (): Promise<ResponseData> => {
    const slot = startGate.then(async () => {
      const waitMs = Math.max(0, nextStartAt - Date.now());
      if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
      // Base the next slot on the actual release, so delayed timers cannot
      // dispatch an accumulated burst when a busy event loop resumes.
      nextStartAt = Date.now() + 180;
    });
    startGate = slot.catch(() => undefined);
    await slot;
    let result: ResponseData = { payload: null, reason: 'Groww did not return usable market data. Try again shortly.' };
    try {
      const response = await fetch(`${BASE_URL}${path}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'X-API-VERSION': '1.0' },
        signal: AbortSignal.timeout(7_000),
        cache: 'no-store',
        redirect: 'error',
      });
      if (response.status === 401 || response.status === 403) {
        invalidateGrowwAccess(token);
        result.reason = 'Groww access expired or was rejected. Reconnect the market-data account.';
      } else if (response.status === 429) {
        result.reason = 'Groww is rate limiting market data. Try again shortly.';
      } else if (response.ok) {
        const payload = await readBoundedJson(response);
        const usable = path === '/live-data/quote'
          ? normalizeGrowwQuote(payload) !== null : normalizeGrowwCandles(payload) !== null;
        if (usable) result = { payload, reason: null };
      }
    } catch {
      // Do not forward upstream messages, response bodies or exception text;
      // those may contain credentials or provider internals.
    }
    if (cache.size >= 64) cache.delete(cache.keys().next().value as string);
    cache.set(key, { ...result, expiresAt: Date.now() + (result.payload ? ttl : 15_000) });
    return result;
  })();
  pending.set(key, task);
  try { return await task; }
  finally { pending.delete(key); }
}

function unavailableQuote(instrument: GrowwInstrument, reason: string): RadarQuote {
  return {
    symbol: instrument.symbol, name: instrument.name, assetClass: 'Equities', currency: instrument.currency,
    market: 'India', exchange: instrument.exchange,
    price: null, change: null, changePercent: null, timestamp: null,
    provider: PROVIDER, sourceUrl: instrument.sourceUrl, status: 'unavailable', points: [], reason,
  };
}

export async function getGrowwSnapshot(): Promise<RadarSnapshot> {
  const { token, reason } = await getGrowwAccess();
  if (!token) return {
    quotes: GROWW_INSTRUMENTS.map((instrument) => unavailableQuote(instrument, reason || 'Groww is not connected. Indian quotes are unavailable.')),
    asOf: new Date().toISOString(),
    providers: [{ name: PROVIDER, status: 'unavailable', detail: reason || 'Groww is not connected. Indian quotes are unavailable.' }],
  };
  const quotes = await Promise.all(GROWW_INSTRUMENTS.map(async (instrument): Promise<RadarQuote> => {
    const [response, series] = await Promise.all([
      fetchGroww('/live-data/quote', new URLSearchParams({ exchange: instrument.exchange, segment: 'CASH', trading_symbol: instrument.tradingSymbol }), 60_000, token),
      getGrowwSeries(instrument.symbol, null),
    ]);
    const quote = normalizeGrowwQuote(response.payload);
    if (!quote) return unavailableQuote(instrument, response.reason ?? 'Groww returned no valid timestamped quote for this instrument.');
    return {
      symbol: instrument.symbol, name: instrument.name, assetClass: 'Equities', currency: instrument.currency,
      market: 'India', exchange: instrument.exchange,
      ...quote,
      provider: PROVIDER, sourceUrl: instrument.sourceUrl,
      status: Date.now() - Date.parse(quote.timestamp) < 36 * HOUR ? 'delayed' : 'historical',
      points: series.points,
    };
  }));
  const available = quotes.filter((quote) => quote.price !== null).length;
  return {
    quotes, asOf: new Date().toISOString(),
    providers: [{ name: PROVIDER, status: available ? 'available' : 'unavailable', detail: available
      ? `${available} of ${GROWW_INSTRUMENTS.length} timestamped NSE quotes available. Quotes are cached for up to 60 seconds; the last trade may be older when markets are closed.`
      : quotes[0]?.reason ?? 'Groww market data is unavailable.' }],
  };
}

/** Allowlisted read-only data. No order, portfolio, login or trading calls. */
export async function getGrowwSeries(symbol: string, eventAt: string | null): Promise<RadarSeries> {
  const instrument = getGrowwInstrument(symbol);
  if (!instrument) throw new Error('Unsupported Groww instrument.');
  const now = Date.now();
  const eventMs = eventAt ? Date.parse(eventAt) : null;
  if (eventAt && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(eventAt)
    || !validCalendar(eventAt) || eventMs === null || !Number.isFinite(eventMs) || eventMs > now || eventMs < now - 365 * DAY)) {
    throw new Error('eventAt must be an explicit-timezone timestamp within the past 365 days.');
  }
  const interval = eventMs !== null && now - eventMs <= 59 * DAY ? '1h' : '1d';
  const base: RadarSeries = {
    symbol: instrument.symbol, name: instrument.name, currency: instrument.currency, interval,
    provider: PROVIDER, sourceUrl: HISTORY_SOURCE, fetchedAt: new Date(now).toISOString(), status: 'unavailable', points: [],
  };
  const access = await getGrowwAccess();
  const token = access.token;
  if (!token) return { ...base, reason: access.reason || 'Groww is not connected. Indian quotes are unavailable.' };
  // A bucketed current boundary keeps repeated context requests cacheable.
  const bucketedNow = Math.floor(now / 300_000) * 300_000;
  const start = eventMs === null ? bucketedNow - 30 * DAY : eventMs - (interval === '1h' ? 4 : 7) * DAY;
  const end = eventMs === null ? bucketedNow : Math.min(bucketedNow, eventMs + 4 * DAY);
  const response = await fetchGroww('/historical/candles', new URLSearchParams({
    exchange: instrument.exchange, segment: 'CASH', groww_symbol: instrument.growwSymbol,
    start_time: String(Math.floor(start / 1_000)), end_time: String(Math.floor(end / 1_000)),
    candle_interval: interval === '1h' ? '1hour' : '1day',
  }), 300_000, token);
  const candles = normalizeGrowwCandles(response.payload, now);
  if (!candles) return { ...base, reason: response.reason ?? 'Groww did not return usable historical candles.' };
  if (eventAt && candles.assumedIst) return { ...base, reason: HISTORY_TIME_LIMIT, limitations: [HISTORY_TIME_LIMIT] };
  const points = candles.points.filter((point) => Date.parse(point.time) >= start && Date.parse(point.time) <= end);
  if (!points.length) return { ...base, reason: 'Groww returned no usable historical observations for this window.' };
  return {
    ...base, status: 'historical', points,
    limitations: [
      ...(candles.assumedIst ? ['Groww candle timestamps omit a timezone. For chart context they are explicitly interpreted as Asia/Kolkata (IST); this is an assumption, not a verified provider guarantee.'] : []),
      'Groww does not specify candle boundary semantics in the current REST reference. Comparisons conservatively treat timestamps as interval starts and require a full completed interval.',
      'Equity prices are in INR; Nifty and Nifty Bank index levels are in points. Missing candles remain missing; prices and curves are not generated.',
    ],
  };
}
