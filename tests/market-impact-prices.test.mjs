import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { getRadarSnapshot, normalizeYahooChart, RADAR_INSTRUMENTS } from '../lib/market-impact/market-data.ts';

// Resolve the one runtime TS import while keeping Next's normal extensionless import in source.
const source = readFileSync(new URL('../lib/market-impact/reaction.ts', import.meta.url), 'utf8')
  .replace("from './market-data'", `from '${new URL('../lib/market-impact/market-data.ts', import.meta.url).href}'`)
  .replace("from './indian-instruments'", `from '${new URL('../lib/market-impact/indian-instruments.ts', import.meta.url).href}'`);
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { calculateRadarReaction, validateRadarHistoryInput } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const NOW = Date.parse('2026-10-23T18:00:00Z');
const epoch = (iso) => Date.parse(iso) / 1000;
const payload = (timestamps, closes, meta = {}) => ({ chart: { result: [{ timestamp: timestamps, indicators: { quote: [{ close: closes }] }, meta }], error: null } });
const point = (time, value) => ({ time, value });
const series = (points, interval = '1h') => ({ symbol: 'SPY', name: 'S&P 500 ETF', currency: 'USD', interval, points, provider: 'test', sourceUrl: 'https://finance.yahoo.com/quote/SPY/history/', fetchedAt: new Date(NOW).toISOString(), status: 'historical' });

afterEach(() => mock.restoreAll());

test('normalization keeps timestamp/close alignment across null and invalid data', () => {
  const data = normalizeYahooChart(payload([100, 200, 300, 400, 500, 600], [10, null, 30, Infinity, 0, -5]), NOW);
  assert.deepEqual(data.points, [point('1970-01-01T00:01:40.000Z', 10), point('1970-01-01T00:05:00.000Z', 30)]);
  assert.equal(data.price, null);
  assert.equal(data.quoteAt, null);
});

test('normalization sorts, deduplicates and rejects future timestamps without filling gaps', () => {
  const data = normalizeYahooChart(payload([300, 100, 300, epoch('2026-10-24T00:00:00Z')], [30, 10, 31, 90]), NOW);
  assert.deepEqual(data.points, [point('1970-01-01T00:01:40.000Z', 10), point('1970-01-01T00:05:00.000Z', 31)]);
});

test('price requires the provider quote time and provider error is unavailable', () => {
  assert.equal(normalizeYahooChart(payload([], [], { regularMarketPrice: 45 }), NOW).price, null);
  const result = normalizeYahooChart(payload([], [], { regularMarketPrice: 45, regularMarketTime: epoch('2026-10-23T17:30:00Z') }), NOW);
  assert.equal(result.price, 45);
  assert.equal(result.quoteAt, '2026-10-23T17:30:00.000Z');
  assert.equal(normalizeYahooChart({ chart: { result: null, error: { code: 'Not Found' } } }, NOW), null);
});

test('reaction baseline cannot use a candle that straddles the event', () => {
  const history = calculateRadarReaction(series([
    point('2026-10-23T09:00:00Z', 100),
    point('2026-10-23T10:00:00Z', 200), // Straddles the event, must not become baseline.
    point('2026-10-23T11:00:00Z', 110),
    point('2026-10-23T14:00:00Z', 120),
  ]), '2026-10-23T10:30:00Z', NOW);
  assert.equal(history.anchor.value, 100);
  assert.equal(history.anchor.intervalEnd, '2026-10-23T10:00:00.000Z');
  assert.equal(history.returns[0].observed.time, '2026-10-23T11:00:00Z');
  assert.ok(Math.abs(history.returns[0].changePercent - 10) < 1e-9);
  assert.equal(history.returns[2].status, 'unavailable');
});

test('missing actual event time leaves percentages uncomputed even with observed prices', () => {
  const history = calculateRadarReaction(series([point('2026-10-23T10:00:00Z', 100), point('2026-10-23T12:00:00Z', 120)]), null, NOW);
  assert.equal(history.anchor, null);
  assert.ok(history.returns.every((window) => window.status === 'uncomputed' && window.changePercent === null));
  assert.equal(history.points.length, 2);
});

test('does not compare across a stale baseline or interpolate a market closure', () => {
  const history = calculateRadarReaction(series([point('2026-10-20T14:00:00Z', 100), point('2026-10-23T12:00:00Z', 120)]), '2026-10-23T10:00:00Z', NOW);
  assert.equal(history.anchor, null);
  assert.ok(history.returns.every((window) => window.changePercent === null));
});

test('incomplete bars cannot be returned as observed reactions', () => {
  const history = calculateRadarReaction(series([point('2026-10-23T16:00:00Z', 100), point('2026-10-23T17:30:00Z', 110)]), '2026-10-23T17:00:00Z', NOW);
  assert.equal(history.returns[0].status, 'unavailable');
});

test('history input is allowlisted, timezone explicit and date bounded', () => {
  assert.deepEqual(validateRadarHistoryInput('NSE:NIFTY', null, NOW), { symbol: 'NSE:NIFTY', eventAt: null });
  assert.deepEqual(validateRadarHistoryInput('SPY', null, NOW), { symbol: 'SPY', eventAt: null });
  assert.equal(validateRadarHistoryInput('BTCUSD', '2026-10-22T12:00:00+05:30', NOW).eventAt, '2026-10-22T06:30:00.000Z');
  for (const [symbol, date] of [['../SPY', null], ['NSE:UNSUPPORTED', null], ['SPY', '2026-10-22'], ['SPY', '2026-02-30T00:00:00Z'], ['SPY', '2026-10-24T00:00:00Z'], ['SPY', '2020-01-01T00:00:00Z']]) {
    assert.throws(() => validateRadarHistoryInput(symbol, date, NOW));
  }
});

test('snapshot coalesces concurrent calls, labels proxies and leaves failed instruments empty', async () => {
  mock.method(Date, 'now', () => NOW);
  const provider = mock.method(globalThis, 'fetch', async (url) => {
    const symbol = decodeURIComponent(new URL(url).pathname.split('/').pop());
    if (symbol === 'USO') return Response.json({ error: 'rate limited' }, { status: 429 });
    return Response.json(payload([epoch('2026-10-22T13:30:00Z'), epoch('2026-10-23T13:30:00Z')], [100, 110], { symbol, currency: 'USD', regularMarketPrice: 112, regularMarketTime: epoch('2026-10-23T17:00:00Z'), chartPreviousClose: 90 }));
  });
  const [first, second] = await Promise.all([getRadarSnapshot(), getRadarSnapshot()]);
  assert.equal(provider.mock.callCount(), RADAR_INSTRUMENTS.length);
  assert.deepEqual(first, second);
  const spy = first.quotes.find((quote) => quote.symbol === 'SPY');
  assert.equal(spy.price, 112);
  assert.equal(spy.change, 12); // Previous session 100, not range-start chartPreviousClose 90.
  assert.ok(spy.proxyFor.includes('proxy'));
  const oil = first.quotes.find((quote) => quote.symbol === 'USO');
  assert.equal(oil.status, 'unavailable');
  assert.equal(oil.price, null);
  assert.deepEqual(oil.points, []);
});
