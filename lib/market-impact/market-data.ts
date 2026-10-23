import type { RadarAssetClass, RadarQuote, RadarSnapshot } from './types';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const PROVIDER = 'Yahoo Finance';
const CACHE_TTL = 5 * 60_000;
const MAX_CACHE_ENTRIES = 64;

export interface RadarInstrument {
  symbol: string;
  providerSymbol: string;
  name: string;
  assetClass: RadarAssetClass;
  currency: string;
  proxyFor?: string;
}

// These are tradable proxies, not the index level or the commodity spot price.
export const RADAR_INSTRUMENTS: readonly RadarInstrument[] = [
  { symbol: 'SPY', providerSymbol: 'SPY', name: 'S&P 500 ETF', assetClass: 'Equities', currency: 'USD', proxyFor: 'S&P 500 · SPDR ETF proxy' },
  { symbol: 'QQQ', providerSymbol: 'QQQ', name: 'Nasdaq-100 ETF', assetClass: 'Equities', currency: 'USD', proxyFor: 'Nasdaq-100 · Invesco ETF proxy' },
  { symbol: 'GLD', providerSymbol: 'GLD', name: 'Gold ETF', assetClass: 'Commodities', currency: 'USD', proxyFor: 'Gold · SPDR Gold Shares proxy' },
  { symbol: 'USO', providerSymbol: 'USO', name: 'Oil fund', assetClass: 'Commodities', currency: 'USD', proxyFor: 'WTI oil · US Oil Fund futures-based proxy' },
  { symbol: 'EURUSD', providerSymbol: 'EURUSD=X', name: 'Euro / US dollar', assetClass: 'Currencies', currency: 'USD' },
  { symbol: 'BTCUSD', providerSymbol: 'BTC-USD', name: 'Bitcoin / US dollar', assetClass: 'Crypto', currency: 'USD' },
];

export interface RadarPricePoint {
  /** Provider-reported interval start, not the instant its closing price traded. */
  time: string;
  value: number;
}

export interface RadarSeries {
  symbol: string;
  name: string;
  proxyFor?: string;
  currency: string;
  interval: '1h' | '1d';
  points: RadarPricePoint[];
  provider: string;
  sourceUrl: string;
  fetchedAt: string;
  status: 'historical' | 'unavailable';
  reason?: string;
  limitations?: string[];
}

interface NormalizedChart {
  points: RadarPricePoint[];
  price: number | null;
  quoteAt: string | null;
  previousClose: number | null;
  currency: string | null;
  providerSymbol: string | null;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function positiveNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function epochIso(value: unknown, now: number): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value * 1_000 > now + 5 * 60_000) return null;
  const date = new Date(value * 1_000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Preserve timestamp/close alignment; never fill absent bars or invent a fallback curve. */
export function normalizeYahooChart(payload: unknown, now = Date.now()): NormalizedChart | null {
  const chart = record(record(payload)?.chart);
  if (!chart || chart.error) return null;
  const result = Array.isArray(chart.result) ? record(chart.result[0]) : null;
  if (!result) return null;
  const meta = record(result.meta);
  const indicators = record(result.indicators);
  const quote = Array.isArray(indicators?.quote) ? record(indicators.quote[0]) : null;
  const timestamps = Array.isArray(result.timestamp) ? result.timestamp : [];
  const closes = Array.isArray(quote?.close) ? quote.close : [];
  const pointsByTime = new Map<string, number>();
  timestamps.slice(0, 1_000).forEach((timestamp, index) => {
    const time = epochIso(timestamp, now);
    const value = positiveNumber(closes[index]);
    if (time && value !== null) pointsByTime.set(time, value);
  });
  const points = [...pointsByTime].sort(([a], [b]) => a.localeCompare(b)).map(([time, value]) => ({ time, value }));
  const quoteAt = epochIso(meta?.regularMarketTime, now);
  return {
    points,
    // A price without its provider timestamp is not a valid latest quote.
    price: quoteAt ? positiveNumber(meta?.regularMarketPrice) : null,
    quoteAt,
    previousClose: positiveNumber(meta?.previousClose),
    currency: typeof meta?.currency === 'string' && /^[A-Z]{3,6}$/.test(meta.currency) ? meta.currency : null,
    providerSymbol: typeof meta?.symbol === 'string' ? meta.symbol : null,
  };
}

export function getRadarInstrument(symbol: string): RadarInstrument | undefined {
  return RADAR_INSTRUMENTS.find((instrument) => instrument.symbol === symbol);
}

type CacheEntry = { expiresAt: number; result: NormalizedChart | null };
const chartCache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<NormalizedChart | null>>();
let budgetWindow = 0;
let budgetRequests = 0;

async function fetchChart(instrument: RadarInstrument, query: string): Promise<NormalizedChart | null> {
  const key = `${instrument.symbol}:${query}`;
  const cached = chartCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.result;
  const existing = pending.get(key);
  if (existing) return existing;
  // Bound outbound traffic even when callers request many different event dates.
  if (Date.now() - budgetWindow >= 60_000) { budgetWindow = Date.now(); budgetRequests = 0; }
  if (budgetRequests >= 40 || pending.size >= 8) return null;
  budgetRequests += 1;
  const request = (async () => {
    let result: NormalizedChart | null = null;
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(instrument.providerSymbol)}?${query}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'TheMarketStories/1.0 (market research)' },
        signal: AbortSignal.timeout(7_000),
        next: { revalidate: 300 },
      });
      if (response.ok) {
        const parsed = normalizeYahooChart(await response.json());
        if (parsed && (!parsed.providerSymbol || parsed.providerSymbol.toUpperCase() === instrument.providerSymbol.toUpperCase())) result = parsed;
      }
    } catch {
      // Provider failures remain unavailable; no generated prices are substituted.
    }
    if (chartCache.size >= MAX_CACHE_ENTRIES) chartCache.delete(chartCache.keys().next().value as string);
    chartCache.set(key, { result, expiresAt: Date.now() + (result ? CACHE_TTL : 30_000) });
    return result;
  })();
  pending.set(key, request);
  try { return await request; }
  finally { pending.delete(key); }
}

function sourceUrl(instrument: RadarInstrument): string {
  return `https://finance.yahoo.com/quote/${encodeURIComponent(instrument.providerSymbol)}/history/`;
}

export async function getRadarSnapshot(): Promise<RadarSnapshot> {
  const quotes = await Promise.all(RADAR_INSTRUMENTS.map(async (instrument): Promise<RadarQuote> => {
    const chart = await fetchChart(instrument, 'range=1mo&interval=1d&includePrePost=false');
    const now = Date.now();
    const price = chart?.price ?? null;
    // For a current session the last daily bar is partial. The preceding bar is
    // the preceding session's close; chartPreviousClose is range-start and unused.
    const lastBar = chart?.points[chart.points.length - 1];
    const quoteTime = chart?.quoteAt ? Date.parse(chart.quoteAt) : null;
    const lastBarTime = lastBar ? Date.parse(lastBar.time) : null;
    const sameSession = quoteTime !== null && lastBarTime !== null && quoteTime >= lastBarTime && quoteTime - lastBarTime < DAY;
    const priorBar = sameSession && chart && chart.points.length > 1 ? chart.points[chart.points.length - 2].value : null;
    const previous = chart?.previousClose ?? priorBar;
    const change = price !== null && previous !== null ? price - previous : null;
    const quoteAt = chart?.quoteAt ?? null;
    return {
      symbol: instrument.symbol,
      name: instrument.name,
      assetClass: instrument.assetClass,
      price,
      change,
      changePercent: change !== null && previous !== null ? change / previous * 100 : null,
      currency: chart?.currency ?? instrument.currency,
      timestamp: quoteAt,
      provider: PROVIDER,
      market: 'Global',
      sourceUrl: sourceUrl(instrument),
      status: !chart || (price === null && !chart.points.length) ? 'unavailable' : quoteAt && now - Date.parse(quoteAt) < 36 * HOUR ? 'delayed' : 'historical',
      points: chart?.points ?? [],
      ...(instrument.proxyFor ? { proxyFor: instrument.proxyFor } : {}),
    };
  }));
  return { quotes, asOf: new Date().toISOString() };
}

/** One bounded provider request, with allowlisted instruments and a short cache. */
export async function getRadarSeries(symbol: string, eventAt: string | null): Promise<RadarSeries> {
  const instrument = getRadarInstrument(symbol);
  if (!instrument) throw new Error('Unsupported instrument.');
  const now = Date.now();
  const eventMs = eventAt ? Date.parse(eventAt) : null;
  const interval = eventMs !== null && now - eventMs <= 59 * DAY ? '1h' : '1d';
  let query = 'range=1mo&interval=1d&includePrePost=false';
  if (eventMs !== null) {
    const period1 = Math.floor((eventMs - (interval === '1h' ? 4 : 7) * DAY) / DAY) * 86_400;
    const period2 = Math.ceil(Math.min(now, eventMs + 4 * DAY) / DAY) * 86_400;
    query = `period1=${period1}&period2=${period2}&interval=${interval === '1h' ? '60m' : '1d'}&includePrePost=false`;
  }
  const chart = await fetchChart(instrument, query);
  return {
    symbol: instrument.symbol,
    name: instrument.name,
    ...(instrument.proxyFor ? { proxyFor: instrument.proxyFor } : {}),
    currency: chart?.currency ?? instrument.currency,
    interval: eventMs === null ? '1d' : interval,
    points: chart?.points ?? [],
    provider: PROVIDER,
    sourceUrl: sourceUrl(instrument),
    fetchedAt: new Date().toISOString(),
    status: chart?.points.length ? 'historical' : 'unavailable',
    ...(!chart?.points.length ? { reason: 'The price provider did not return usable observations for this window.' } : {}),
  };
}
