import { getRadarInstrument, getRadarSeries } from './market-data';
import { GROWW_INSTRUMENTS } from './indian-instruments';
import type { RadarPricePoint, RadarSeries } from './market-data';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export interface RadarReactionSample extends RadarPricePoint {
  /** Conservative interval boundary, derived from the provider's bar start. */
  intervalEnd: string;
}

export interface RadarReactionWindow {
  label: string;
  horizonHours: number;
  status: 'observed' | 'unavailable' | 'uncomputed';
  baseline: RadarReactionSample | null;
  observed: RadarReactionSample | null;
  changePercent: number | null;
  reason?: string;
}

export interface RadarHistory extends RadarSeries {
  eventAt: string | null;
  anchor: RadarReactionSample | null;
  returns: RadarReactionWindow[];
  limitations: string[];
}

export class RadarHistoryInputError extends Error {
  constructor(message: string) { super(message); this.name = 'RadarHistoryInputError'; }
}

/** An event must have an explicit timezone and a plausible actual occurrence time. */
export function validateRadarHistoryInput(symbol: string, eventAt?: string | null, now = Date.now()): { symbol: string; eventAt: string | null } {
  if (!getRadarInstrument(symbol) && !GROWW_INSTRUMENTS.some(instrument => instrument.symbol === symbol)) throw new RadarHistoryInputError('Choose an instrument from the supported Indian or global market list.');
  if (!eventAt) return { symbol, eventAt: null };
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(eventAt)) {
    throw new RadarHistoryInputError('eventAt must be an ISO timestamp with a timezone.');
  }
  const [year, month, day] = eventAt.slice(0, 10).split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate() || Number(eventAt.slice(11, 13)) > 23 || Number(eventAt.slice(14, 16)) > 59 || (eventAt[16] === ':' && Number(eventAt.slice(17, 19)) > 59)) {
    throw new RadarHistoryInputError('eventAt must be a valid calendar timestamp.');
  }
  const time = Date.parse(eventAt);
  if (!Number.isFinite(time) || time > now || time < now - 365 * DAY) {
    throw new RadarHistoryInputError('eventAt must be within the past 365 days.');
  }
  return { symbol, eventAt: new Date(time).toISOString() };
}

/** Descriptive before/after observations; no estimated prices or causal attribution. */
export function calculateRadarReaction(series: RadarSeries, eventAt: string | null, now = Date.now()): RadarHistory {
  const intervalMs = series.interval === '1h' ? HOUR : DAY;
  const samples: RadarReactionSample[] = series.points
    .filter((point) => Number.isFinite(Date.parse(point.time)) && Number.isFinite(point.value) && point.value > 0)
    .map((point) => ({ ...point, intervalEnd: new Date(Date.parse(point.time) + intervalMs).toISOString() }))
    .filter((point) => Date.parse(point.intervalEnd) <= now)
    .sort((a, b) => a.time.localeCompare(b.time));
  const eventMs = eventAt ? Date.parse(eventAt) : null;
  // Require the entire baseline bar to end before the event. Using its start
  // would otherwise leak a post-event closing price into the baseline.
  const before = eventMs !== null ? samples.filter((point) => Date.parse(point.intervalEnd) <= eventMs) : [];
  const lastBefore = before[before.length - 1] ?? null;
  const maxGap = series.interval === '1h' ? 2 * HOUR : 2 * DAY;
  const anchor = eventMs !== null && lastBefore && eventMs - Date.parse(lastBefore.intervalEnd) <= maxGap ? lastBefore : null;
  const horizons = series.interval === '1h' ? [1, 4, 24] : [24, 48, 72];
  const returns = horizons.map((hours): RadarReactionWindow => {
    const base = { label: `≥${hours}h`, horizonHours: hours, baseline: anchor, observed: null, changePercent: null };
    if (eventMs === null) return { ...base, status: 'uncomputed', reason: 'The actual event time is unverified. Article publication time is not substituted.' };
    if (!anchor) return { ...base, status: 'unavailable', reason: 'No sufficiently recent completed pre-event interval is available.' };
    const target = eventMs + hours * HOUR;
    // Only use wholly post-event bars; a bar straddling the event is not a post-event sample.
    const observed = samples.find((point) => Date.parse(point.time) >= eventMs && Date.parse(point.intervalEnd) >= target);
    if (!observed || Date.parse(observed.intervalEnd) - target > maxGap) {
      return { ...base, status: 'unavailable', reason: target > now ? 'This observation window has not elapsed.' : 'No completed interval near this horizon; markets may be closed or data missing.' };
    }
    return { ...base, status: 'observed', observed, changePercent: (observed.value / anchor.value - 1) * 100 };
  });
  return {
    ...series,
    eventAt,
    anchor,
    returns,
    limitations: [
      ...(series.limitations || []),
      'Observed price changes do not establish that this event caused the move. Other news and market factors may overlap.',
      `Prices are provider-reported ${series.interval === '1h' ? 'hourly' : 'daily'} bar closes. Chart timestamps mark interval starts; comparison boundaries conservatively add one full interval.`,
      'Unadjusted closes measure price change, not total investment return. ETF and futures-fund proxies may differ from the underlying market.',
      'Missing bars, exchange closures and incomplete intervals are not filled or interpolated.',
      ...(eventAt ? [] : ['Historical context only: reaction percentages remain uncomputed until an actual event occurrence time is verified.']),
    ],
  };
}

export async function getRadarHistory(symbol: string, eventAt?: string | null): Promise<RadarHistory> {
  const input = validateRadarHistoryInput(symbol, eventAt);
  const series = input.symbol.startsWith('NSE:')
    ? await (await import('./groww')).getGrowwSeries(input.symbol, input.eventAt)
    : await getRadarSeries(input.symbol, input.eventAt);
  return calculateRadarReaction(series, input.eventAt);
}
