import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, mock, test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/market-impact/groww-auth.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
let moduleNumber = 0;
const load = () => import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${moduleNumber++}`);
const environmentNames = ['GROWW_ACCESS_TOKEN', 'GROWW_API_KEY', 'GROWW_API_SECRET'];
let savedEnvironment;
let clock;
const initialTime = Date.parse('2026-10-23T18:00:00Z');
const json = (value, init) => new Response(JSON.stringify(value), init);
const jwt = (expiresAt) => `header.${Buffer.from(JSON.stringify({ exp: expiresAt / 1000 })).toString('base64url')}.signature`;

beforeEach(() => {
  savedEnvironment = environmentNames.map((name) => process.env[name]);
  delete process.env.GROWW_ACCESS_TOKEN;
  process.env.GROWW_API_KEY = 'test-groww-api-key';
  process.env.GROWW_API_SECRET = 'test-groww-api-secret';
  clock = initialTime;
  mock.method(Date, 'now', () => clock);
  mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network request'); });
});

afterEach(() => {
  mock.restoreAll();
  environmentNames.forEach((name, index) => {
    if (savedEnvironment[index] === undefined) delete process.env[name];
    else process.env[name] = savedEnvironment[index];
  });
});

test('missing or partial credentials never call Groww', async () => {
  const { getGrowwAccess } = await load();
  delete process.env.GROWW_API_KEY;
  delete process.env.GROWW_API_SECRET;
  assert.equal((await getGrowwAccess()).token, null);
  process.env.GROWW_API_KEY = 'test-key';
  assert.match((await getGrowwAccess()).reason, /credentials are incomplete/);
  delete process.env.GROWW_API_KEY;
  process.env.GROWW_API_SECRET = 'test-secret';
  assert.equal((await getGrowwAccess()).token, null);
  assert.equal(fetch.mock.callCount(), 0);
});

test('a direct token takes priority and rejection never generates a token', async () => {
  const { getGrowwAccess, invalidateGrowwAccess } = await load();
  process.env.GROWW_ACCESS_TOKEN = ' manual-token ';
  assert.deepEqual(await getGrowwAccess(), { token: 'manual-token', reason: null });
  invalidateGrowwAccess('manual-token');
  assert.equal((await getGrowwAccess()).token, 'manual-token');
  process.env.GROWW_ACCESS_TOKEN = 'invalid\r\ntoken';
  assert.equal((await getGrowwAccess()).token, null);
  assert.equal(fetch.mock.callCount(), 0);
});

test('approval authentication sends the documented checksum, body and private headers', async () => {
  fetch.mock.mockImplementation(async () => json({ token: 'returned-token', isActive: true, expiry: '2026-10-23T19:00:00Z' }));
  const { getGrowwAccess } = await load();
  assert.deepEqual(await getGrowwAccess(), { token: 'returned-token', reason: null });
  assert.equal(fetch.mock.callCount(), 1);
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(url, 'https://api.groww.in/v1/token/api/access');
  assert.equal(options.method, 'POST');
  assert.deepEqual(options.headers, {
    Authorization: 'Bearer test-groww-api-key', Accept: 'application/json',
    'Content-Type': 'application/json', 'X-API-VERSION': '1.0',
  });
  const timestamp = Math.floor(clock / 1000).toString();
  assert.deepEqual(JSON.parse(options.body), {
    key_type: 'approval', timestamp,
    checksum: createHash('sha256').update(`test-groww-api-secret${timestamp}`).digest('hex'),
  });
  assert.equal(options.cache, 'no-store');
  assert.equal(options.redirect, 'error');
  assert.ok(options.signal instanceof AbortSignal);
  assert.ok(!options.body.includes('test-groww-api-secret'));
  assert.ok(!url.includes('test-groww-api-key'));
});

test('concurrent authentication coalesces and caches the successful token', async () => {
  let release;
  fetch.mock.mockImplementation(() => new Promise((resolve) => { release = resolve; }));
  const { getGrowwAccess } = await load();
  const requests = Array.from({ length: 20 }, () => getGrowwAccess());
  assert.equal(fetch.mock.callCount(), 1);
  release(json({ token: 'shared-token' }));
  assert.ok((await Promise.all(requests)).every((result) => result.token === 'shared-token'));
  assert.equal((await getGrowwAccess()).token, 'shared-token');
  assert.equal(fetch.mock.callCount(), 1);
});

test('JWT expiry renews thirty seconds early and overrides a later provider expiry', async () => {
  fetch.mock.mockImplementation(async () => json({ token: jwt(clock + 120_000), expiry: new Date(clock + 3_600_000).toISOString() }));
  const { getGrowwAccess } = await load();
  const first = (await getGrowwAccess()).token;
  clock += 89_000;
  assert.equal((await getGrowwAccess()).token, first);
  clock += 2_000;
  assert.notEqual((await getGrowwAccess()).token, first);
  assert.equal(fetch.mock.callCount(), 2);
});

test('explicit provider expiry wins when it is earlier than JWT expiry', async () => {
  fetch.mock.mockImplementation(async () => json({ token: jwt(clock + 3_600_000), expiry: new Date(clock + 90_000).toISOString() }));
  const { getGrowwAccess } = await load();
  await getGrowwAccess();
  clock += 59_000;
  await getGrowwAccess();
  assert.equal(fetch.mock.callCount(), 1);
  clock += 2_000;
  await getGrowwAccess();
  assert.equal(fetch.mock.callCount(), 2);
});

test('zoneless expiry uses a ten minute fallback instead of the host timezone', async () => {
  fetch.mock.mockImplementation(async () => json({ token: 'opaque-token', expiry: '2026-10-24T04:00:00' }));
  const { getGrowwAccess } = await load();
  await getGrowwAccess();
  clock += 569_000;
  await getGrowwAccess();
  assert.equal(fetch.mock.callCount(), 1);
  clock += 2_000;
  await getGrowwAccess();
  assert.equal(fetch.mock.callCount(), 2);
});

test('generated tokens never remain usable beyond the next 06:00 IST boundary', async () => {
  clock = Date.parse('2026-10-24T00:29:00Z');
  fetch.mock.mockImplementation(async () => json({ token: jwt(clock + 86_400_000) }));
  const { getGrowwAccess } = await load();
  assert.ok((await getGrowwAccess()).token);
  clock += 29_000;
  assert.ok((await getGrowwAccess()).token);
  assert.equal(fetch.mock.callCount(), 1);
  clock += 2_000;
  assert.equal((await getGrowwAccess()).token, null);
  assert.equal(fetch.mock.callCount(), 2);
  clock = Date.parse('2026-10-24T00:30:32Z');
  assert.ok((await getGrowwAccess()).token);
  assert.equal(fetch.mock.callCount(), 3);
});

test('credential rotation discards the old cache and stale invalidation cannot clear the new token', async () => {
  let count = 0;
  fetch.mock.mockImplementation(async () => json({ token: `token-${++count}` }));
  const { getGrowwAccess, invalidateGrowwAccess } = await load();
  assert.equal((await getGrowwAccess()).token, 'token-1');
  process.env.GROWW_API_SECRET = 'rotated-secret';
  assert.equal((await getGrowwAccess()).token, 'token-2');
  invalidateGrowwAccess('token-1');
  assert.equal((await getGrowwAccess()).token, 'token-2');
  assert.equal(fetch.mock.callCount(), 2);
});

test('generated-token rejection has a sixty second cooldown and does not loop', async () => {
  let count = 0;
  fetch.mock.mockImplementation(async () => json({ token: `token-${++count}` }));
  const { getGrowwAccess, invalidateGrowwAccess } = await load();
  assert.equal((await getGrowwAccess()).token, 'token-1');
  invalidateGrowwAccess('token-1');
  for (let index = 0; index < 20; index++) assert.equal((await getGrowwAccess()).token, null);
  clock += 59_999;
  assert.equal((await getGrowwAccess()).token, null);
  assert.equal(fetch.mock.callCount(), 1);
  clock += 1;
  assert.equal((await getGrowwAccess()).token, 'token-2');
  assert.equal(fetch.mock.callCount(), 2);
});

test('provider failures are negative-cached without leaking response or exception secrets', async () => {
  const sensitive = 'test-groww-api-key test-groww-api-secret upstream-token';
  fetch.mock.mockImplementation(async () => new Response(sensitive, { status: 403 }));
  const { getGrowwAccess } = await load();
  const first = await getGrowwAccess();
  assert.equal(first.token, null);
  for (const secret of sensitive.split(' ')) assert.ok(!first.reason.includes(secret));
  clock += 59_999;
  await getGrowwAccess();
  assert.equal(fetch.mock.callCount(), 1);
  clock += 1;
  fetch.mock.mockImplementation(async () => { throw new Error(sensitive); });
  const second = await getGrowwAccess();
  assert.equal(second.token, null);
  for (const secret of sensitive.split(' ')) assert.ok(!second.reason.includes(secret));
  assert.equal(fetch.mock.callCount(), 2);
});

test('malformed, inactive, expired and oversized token responses are unavailable', async () => {
  const cases = [
    () => json({ token: '', isActive: true }),
    () => json({ token: 'inactive-token', isActive: false }),
    () => json({ token: 'invalid\ntoken' }),
    () => json({ token: 'x'.repeat(8193) }),
    () => json({ payload: { token: 'nested-token' } }),
    () => json({ token: jwt(clock - 1_000) }),
    () => json({ token: 'expired-token', expiry: new Date(clock - 1_000).toISOString() }),
    () => json({ token: 'oversized' }, { headers: { 'content-length': '65537' } }),
    () => new Response(JSON.stringify({ token: 'token', padding: 'x'.repeat(65_536) })),
    () => new Response('invalid json'),
    () => new Response(null),
  ];
  for (const response of cases) {
    fetch.mock.mockImplementation(async () => response());
    const { getGrowwAccess } = await load();
    assert.equal((await getGrowwAccess()).token, null);
  }
  assert.equal(fetch.mock.callCount(), cases.length);
});

test('transport and provider outages remain distinct from credential rejection', async () => {
  for (const [response, temporary] of [
    [() => { throw new TypeError('network fixture-private-secret'); }, true],
    [() => new Response('unavailable', { status: 503 }), true],
    [() => new Response('rate limited', { status: 429 }), true],
    [() => new Response('denied', { status: 401 }), false],
  ]) {
    fetch.mock.mockImplementation(async () => response());
    const { getGrowwAccess } = await load();
    const result = await getGrowwAccess();
    assert.equal(result.token, null);
    assert.match(result.reason, temporary ? /temporarily unavailable/ : /not accepted/);
    assert.ok(!result.reason.includes('fixture-private-secret'));
  }
});

test('invalid credentials do not reach the authentication endpoint', async () => {
  const { getGrowwAccess } = await load();
  process.env.GROWW_API_KEY = 'bad\nkey';
  assert.equal((await getGrowwAccess()).token, null);
  process.env.GROWW_API_KEY = 'valid-key';
  process.env.GROWW_API_SECRET = 'x'.repeat(8193);
  assert.equal((await getGrowwAccess()).token, null);
  assert.equal(fetch.mock.callCount(), 0);
});

test('a rolling 24 hour budget survives key rotation and clears only as requests age out', async () => {
  fetch.mock.mockImplementation(async () => new Response('unavailable', { status: 503 }));
  const { getGrowwAccess } = await load();
  for (let index = 0; index < 100; index++) {
    process.env.GROWW_API_KEY = `test-key-${index}`;
    await getGrowwAccess();
    clock += 60_000;
  }
  process.env.GROWW_API_KEY = 'test-key-blocked';
  assert.match((await getGrowwAccess()).reason, /budget reached/);
  assert.equal(fetch.mock.callCount(), 100);
  clock = initialTime + 86_400_001;
  await getGrowwAccess();
  assert.equal(fetch.mock.callCount(), 101);
});
