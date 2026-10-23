import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const NOW = Date.parse('2026-10-23T18:00:00Z');
const originalToken = process.env.GROWW_ACCESS_TOKEN;
const originalKey = process.env.GROWW_API_KEY;
const originalSecret = process.env.GROWW_API_SECRET;
const instrumentUrl = new URL('../lib/market-impact/indian-instruments.ts', import.meta.url).href;
let revision = 0;

async function adapter() {
  const authSource = readFileSync(new URL('../lib/market-impact/groww-auth.ts', import.meta.url), 'utf8');
  const authOutput = ts.transpileModule(`${authSource}\n// isolated auth module ${revision}`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  const authUrl = `data:text/javascript;base64,${Buffer.from(authOutput).toString('base64')}`;
  const source = readFileSync(new URL('../lib/market-impact/groww.ts', import.meta.url), 'utf8')
    .replaceAll("from './indian-instruments'", `from '${instrumentUrl}'`)
    .replace("from './groww-auth'", `from '${authUrl}'`);
  const output = ts.transpileModule(`${source}\n// isolated test module ${revision++}`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
}

const quote = (changes = {}) => ({ status: 'SUCCESS', payload: {
  last_price: 2456.8, last_trade_time: Date.parse('2026-10-23T09:59:00Z'),
  day_change: -12.4, day_change_perc: -0.502, ...changes,
} });
const candle = (time, close) => [time, close, close, close, close, 123, null];
const candles = (rows) => ({ status: 'SUCCESS', payload: { candles: rows } });

beforeEach(() => {
  delete process.env.GROWW_API_KEY;
  delete process.env.GROWW_API_SECRET;
});

afterEach(() => {
  mock.restoreAll();
  if (originalToken === undefined) delete process.env.GROWW_ACCESS_TOKEN;
  else process.env.GROWW_ACCESS_TOKEN = originalToken;
  if (originalKey === undefined) delete process.env.GROWW_API_KEY;
  else process.env.GROWW_API_KEY = originalKey;
  if (originalSecret === undefined) delete process.env.GROWW_API_SECRET;
  else process.env.GROWW_API_SECRET = originalSecret;
});

test('Indian identifiers use NSE CASH trading symbols and current Groww historical symbols', async () => {
  const { GROWW_INSTRUMENTS, getGrowwInstrument } = await adapter();
  assert.deepEqual(GROWW_INSTRUMENTS.map((item) => item.symbol), ['NSE:NIFTY', 'NSE:BANKNIFTY', 'NSE:RELIANCE', 'NSE:TCS', 'NSE:INFY', 'NSE:HDFCBANK']);
  for (const item of GROWW_INSTRUMENTS) {
    assert.equal(item.exchange, 'NSE');
    assert.equal(item.growwSymbol, `NSE-${item.tradingSymbol}`);
    assert.ok(item.sourceUrl.startsWith('https://groww.in/'));
  }
  assert.equal(getGrowwInstrument('../RELIANCE'), undefined);
});

test('quotes require a positive price and documented epoch-millisecond trade time', async () => {
  const { normalizeGrowwQuote } = await adapter();
  const result = normalizeGrowwQuote(quote(), NOW);
  assert.equal(result.timestamp, '2026-10-23T09:59:00.000Z');
  assert.equal(result.change, -12.4);
  assert.equal(result.changePercent, -0.502);
  assert.equal(normalizeGrowwQuote(quote({ day_change: 0, day_change_perc: 0 }), NOW).changePercent, 0);
  assert.equal(normalizeGrowwQuote(quote({ day_change: null, day_change_perc: '1.2' }), NOW).changePercent, null);
  for (const changes of [
    { last_price: 0 }, { last_price: -5 }, { last_price: '100' }, { last_price: Infinity },
    { last_trade_time: undefined }, { last_trade_time: 1792749540 },
    { last_trade_time: Date.parse('2026-10-24T00:00:00Z') },
  ]) assert.equal(normalizeGrowwQuote(quote(changes), NOW), null);
  assert.equal(normalizeGrowwQuote({ status: 'FAILURE', payload: quote().payload }, NOW), null);
});

test('candles retain observed close alignment, gaps and explicit timezone independence', async () => {
  const { normalizeGrowwCandles } = await adapter();
  const result = normalizeGrowwCandles(candles([
    candle('2026-10-23T11:00:00', 110),
    candle('2026-10-23 10:00:00', 100),
    candle('2026-10-23T11:00:00', 111),
    candle('2026-10-23T12:00:00', null),
    candle('2026-02-30T10:00:00', 200),
    candle('2026-10-24T10:00:00', 200),
    candle('2026-10-23T08:00:00Z', 120),
    candle(Date.parse('2026-10-23T09:00:00Z') / 1000, 125),
  ]), NOW);
  assert.equal(result.assumedIst, true);
  assert.deepEqual(result.points, [
    { time: '2026-10-23T04:30:00.000Z', value: 100 },
    { time: '2026-10-23T05:30:00.000Z', value: 111 },
    { time: '2026-10-23T08:00:00.000Z', value: 120 },
    { time: '2026-10-23T09:00:00.000Z', value: 125 },
  ]);
});

test('missing access token makes no network calls and returns no invented data', async () => {
  delete process.env.GROWW_ACCESS_TOKEN;
  const provider = mock.method(globalThis, 'fetch', async () => { throw new Error('unexpected request'); });
  const { getGrowwSnapshot, getGrowwSeries } = await adapter();
  const snapshot = await getGrowwSnapshot();
  assert.equal(provider.mock.callCount(), 0);
  assert.equal(snapshot.quotes.length, 6);
  assert.ok(snapshot.quotes.every((item) => item.status === 'unavailable' && item.price === null && item.timestamp === null && item.points.length === 0));
  assert.ok(snapshot.providers[0].detail.includes('not connected'));
  const series = await getGrowwSeries('NSE:INFY', null);
  assert.equal(series.status, 'unavailable');
  assert.deepEqual(series.points, []);
  assert.equal(provider.mock.callCount(), 0);
});

test('snapshot coalesces requests, sends the token only in headers and caches quotes for 60 seconds', async () => {
  process.env.GROWW_ACCESS_TOKEN = 'private-test-access-token';
  let now = NOW;
  mock.method(Date, 'now', () => now);
  const provider = mock.method(globalThis, 'fetch', async (value, options) => {
    const url = new URL(value);
    assert.equal(url.origin, 'https://api.groww.in');
    assert.ok(!url.href.includes(process.env.GROWW_ACCESS_TOKEN));
    assert.equal(options.headers.Authorization, `Bearer ${process.env.GROWW_ACCESS_TOKEN}`);
    assert.equal(options.headers['X-API-VERSION'], '1.0');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.redirect, 'error');
    assert.equal(url.searchParams.get('segment'), 'CASH');
    if (url.pathname.endsWith('/quote')) return Response.json(quote());
    assert.equal(url.pathname, '/v1/historical/candles');
    assert.equal(url.searchParams.get('candle_interval'), '1day');
    return Response.json(candles([candle('2026-10-22T09:15:00+05:30', 2400)]));
  });
  const { getGrowwSnapshot } = await adapter();
  const [first, second] = await Promise.all([getGrowwSnapshot(), getGrowwSnapshot()]);
  assert.equal(provider.mock.callCount(), 12);
  assert.deepEqual(first.quotes, second.quotes);
  assert.ok(first.quotes.every((item) => item.currency === (['NSE:NIFTY', 'NSE:BANKNIFTY'].includes(item.symbol) ? 'PTS' : 'INR') && item.market === 'India' && item.exchange === 'NSE' && item.price === 2456.8 && item.change === -12.4 && item.points.length === 1));
  assert.ok(!JSON.stringify(first).includes(process.env.GROWW_ACCESS_TOKEN));
  now += 59_000;
  await getGrowwSnapshot();
  assert.equal(provider.mock.callCount(), 12);
  now += 2_000;
  await getGrowwSnapshot();
  assert.equal(provider.mock.callCount(), 18);
});

test('invalid latest quotes do not fall back to candles or a price without a timestamp', async () => {
  process.env.GROWW_ACCESS_TOKEN = 'private-test-access-token';
  mock.method(Date, 'now', () => NOW);
  mock.method(globalThis, 'fetch', async (url) => Response.json(String(url).includes('/quote?')
    ? quote({ last_trade_time: null }) : candles([candle('2026-10-22T09:15:00+05:30', 2400)])));
  const { getGrowwSnapshot } = await adapter();
  const snapshot = await getGrowwSnapshot();
  assert.ok(snapshot.quotes.every((item) => item.status === 'unavailable' && item.price === null && item.timestamp === null && item.points.length === 0));
  assert.equal(snapshot.providers[0].status, 'unavailable');
});

test('historical request uses current endpoint, epoch seconds and explicit instrument identifiers', async () => {
  process.env.GROWW_ACCESS_TOKEN = 'private-test-access-token';
  mock.method(Date, 'now', () => NOW);
  const provider = mock.method(globalThis, 'fetch', async (value) => {
    const url = new URL(value);
    assert.equal(url.pathname, '/v1/historical/candles');
    assert.equal(url.searchParams.get('groww_symbol'), 'NSE-RELIANCE');
    assert.equal(url.searchParams.get('candle_interval'), '1hour');
    assert.equal(url.searchParams.get('start_time').length, 10);
    assert.ok(Number(url.searchParams.get('end_time')) - Number(url.searchParams.get('start_time')) <= 8 * 86400);
    return Response.json(candles([candle('2026-10-23T10:00:00+05:30', 2400), candle('2026-10-23T11:00:00+05:30', 2405)]));
  });
  const { getGrowwSeries } = await adapter();
  const series = await getGrowwSeries('NSE:RELIANCE', '2026-10-23T05:00:00Z');
  assert.equal(provider.mock.callCount(), 1);
  assert.equal(series.status, 'historical');
  assert.equal(series.interval, '1h');
  assert.equal(series.points[0].time, '2026-10-23T04:30:00.000Z');
  assert.ok(series.limitations.some((item) => item.includes('boundary semantics')));
});

test('zoneless candles can show documented IST context but cannot produce event-time comparisons', async () => {
  process.env.GROWW_ACCESS_TOKEN = 'private-test-access-token';
  mock.method(Date, 'now', () => NOW);
  mock.method(globalThis, 'fetch', async () => Response.json(candles([candle('2026-10-23T10:00:00', 2400)])));
  const { getGrowwSeries } = await adapter();
  const context = await getGrowwSeries('NSE:TCS', null);
  assert.equal(context.status, 'historical');
  assert.equal(context.points[0].time, '2026-10-23T04:30:00.000Z');
  assert.ok(context.limitations.some((item) => item.includes('assumption')));
  const reaction = await getGrowwSeries('NSE:TCS', '2026-10-23T05:00:00Z');
  assert.equal(reaction.status, 'unavailable');
  assert.deepEqual(reaction.points, []);
  assert.ok(reaction.reason.includes('without a timezone'));
});

test('authorization failures are short-cached, sanitized and invalidated by token rotation', async () => {
  process.env.GROWW_ACCESS_TOKEN = 'private-test-access-token';
  let now = NOW;
  mock.method(Date, 'now', () => now);
  const provider = mock.method(globalThis, 'fetch', async () => Response.json({ status: 'FAILURE', error: { message: process.env.GROWW_ACCESS_TOKEN } }, { status: 401 }));
  const { getGrowwSeries } = await adapter();
  const first = await getGrowwSeries('NSE:INFY', null);
  await getGrowwSeries('NSE:INFY', null);
  assert.equal(provider.mock.callCount(), 1);
  assert.equal(first.status, 'unavailable');
  assert.ok(first.reason.includes('Reconnect'));
  assert.ok(!JSON.stringify(first).includes(process.env.GROWW_ACCESS_TOKEN));
  now += 16_000;
  await getGrowwSeries('NSE:INFY', null);
  assert.equal(provider.mock.callCount(), 2);
  process.env.GROWW_ACCESS_TOKEN = 'replacement-private-token';
  await getGrowwSeries('NSE:INFY', null);
  assert.equal(provider.mock.callCount(), 3);
});

test('oversized, malformed and rate-limited upstream data stay unavailable with no echoed secrets', async () => {
  for (const mode of ['oversized', 'malformed', 'rate-limit']) {
    process.env.GROWW_ACCESS_TOKEN = `private-${mode}-token`;
    mock.method(Date, 'now', () => NOW);
    mock.method(globalThis, 'fetch', async () => mode === 'oversized'
      ? new Response(process.env.GROWW_ACCESS_TOKEN, { headers: { 'content-length': '1000001' } })
      : mode === 'malformed' ? new Response('not-json ' + process.env.GROWW_ACCESS_TOKEN)
        : new Response(process.env.GROWW_ACCESS_TOKEN, { status: 429 }));
    const { getGrowwSeries } = await adapter();
    const result = await getGrowwSeries('NSE:HDFCBANK', null);
    assert.equal(result.status, 'unavailable');
    assert.deepEqual(result.points, []);
    assert.ok(!JSON.stringify(result).includes(process.env.GROWW_ACCESS_TOKEN));
    if (mode === 'rate-limit') assert.ok(result.reason.includes('rate limiting'));
    mock.restoreAll();
  }
});

test('unsupported instruments and invalid or out-of-range event dates do not call Groww', async () => {
  process.env.GROWW_ACCESS_TOKEN = 'private-test-access-token';
  mock.method(Date, 'now', () => NOW);
  const provider = mock.method(globalThis, 'fetch', async () => { throw new Error('unexpected request'); });
  const { getGrowwSeries } = await adapter();
  for (const [symbol, date] of [
    ['../TCS', null], ['SPY', null], ['NSE:TCS', '2026-10-23'], ['NSE:TCS', '2026-02-30T00:00:00Z'],
    ['NSE:TCS', '2026-10-24T00:00:00Z'], ['NSE:TCS', '2020-01-01T00:00:00Z'],
  ]) await assert.rejects(getGrowwSeries(symbol, date));
  assert.equal(provider.mock.callCount(), 0);
});

test('API key and secret generate one shared token for the complete Indian snapshot', async () => {
  delete process.env.GROWW_ACCESS_TOKEN;
  process.env.GROWW_API_KEY = 'fixture-api-key';
  process.env.GROWW_API_SECRET = 'fixture-api-secret';
  mock.method(Date, 'now', () => NOW);
  let authenticationRequests = 0;
  let marketRequests = 0;
  mock.method(globalThis, 'fetch', async (value, options) => {
    const url = new URL(value);
    if (url.pathname === '/v1/token/api/access') {
      authenticationRequests += 1;
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.Authorization, 'Bearer fixture-api-key');
      assert.equal(JSON.parse(options.body).key_type, 'approval');
      assert.ok(!options.body.includes('fixture-api-secret'));
      return Response.json({ token: 'fixture-generated-token', isActive: true, expiry: '2026-10-24T00:30:00Z' });
    }
    marketRequests += 1;
    assert.equal(options.headers.Authorization, 'Bearer fixture-generated-token');
    return url.pathname.endsWith('/quote')
      ? Response.json(quote())
      : Response.json(candles([candle('2026-10-22T09:15:00+05:30', 2400)]));
  });
  const { getGrowwSnapshot } = await adapter();
  const [first, second] = await Promise.all([getGrowwSnapshot(), getGrowwSnapshot()]);
  assert.equal(authenticationRequests, 1);
  assert.equal(marketRequests, 12);
  assert.ok(first.quotes.every(item => item.price === 2456.8));
  assert.deepEqual(first.quotes, second.quotes);
  for (const credential of ['fixture-api-key', 'fixture-api-secret', 'fixture-generated-token']) {
    assert.ok(!JSON.stringify(first).includes(credential));
  }
  await getGrowwSnapshot();
  assert.equal(authenticationRequests, 1);
  assert.equal(marketRequests, 12);
});

test('unique event windows cannot create an unbounded outbound request burst', async () => {
  process.env.GROWW_ACCESS_TOKEN = 'private-test-access-token';
  mock.method(Date, 'now', () => NOW);
  const provider = mock.method(globalThis, 'fetch', async () => Response.json(candles([])));
  const { getGrowwSeries } = await adapter();
  const results = await Promise.all(Array.from({ length: 45 }, (_, index) => getGrowwSeries('NSE:NIFTY', new Date(NOW - (index + 1) * 86400000).toISOString())));
  assert.ok(provider.mock.callCount() <= 20);
  assert.ok(results.every((result) => result.status === 'unavailable' && result.points.length === 0));
  assert.ok(results.some((result) => result.reason.includes('budget')));
});
