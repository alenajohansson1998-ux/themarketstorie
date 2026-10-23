import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as watchlistHelpers from '../lib/market-impact/watchlist.ts';

const source = readFileSync(new URL('../app/api/market-impact/watchlist/route.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;

function harness(options = {}) {
  const calls = { auth: [], db: 0, model: [] };
  const authConfig = { testConfiguration: true };
  const ownData = { eventSlugs: ['my-event'], entityIds: ['bonds'] };
  const session = Object.hasOwn(options, 'session') ? options.session : { user: { id: 'session-account-a' } };
  const record = (method, args) => calls.model.push({ method, args: structuredClone(args) });
  const query = (data) => ({ select(projection) {
    calls.model.push({ method: 'select', args: [projection] });
    return { lean: async () => data };
  } });
  const model = {
    findOne(...args) { record('findOne', args); return query(ownData); },
    async updateOne(...args) { record('updateOne', args); if (options.initializeError) throw options.initializeError; },
    findOneAndUpdate(...args) {
      record('findOneAndUpdate', args);
      return query(Object.hasOwn(options, 'writeResult') ? options.writeResult : ownData);
    },
  };
  const dependencies = {
    'next/server': { NextResponse: { json: Response.json } },
    'next-auth/next': { getServerSession: async (config) => { calls.auth.push(config); return session; } },
    '@/auth.config': { authConfig },
    '@/lib/mongodb': { __esModule: true, default: async () => { calls.db++; if (options.dbFailure) throw new Error('Private DB connection details'); } },
    '@/models/RadarWatchlist': { __esModule: true, default: model },
    '@/lib/market-impact/watchlist': watchlistHelpers,
  };
  const exports = {};
  runInNewContext(compiled, {
    exports,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected route dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename: 'watchlist-route-under-test.cjs' });
  return { route: exports, calls, authConfig, ownData };
}

function request(body = { kind: 'event', id: 'fed-decision', following: true }, origin = 'http://localhost:3000') {
  const req = new Request('http://localhost:3000/api/market-impact/watchlist', {
    method: 'PUT', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  Object.defineProperty(req, 'nextUrl', { value: new URL(req.url) });
  return req;
}

function assertPrivate(response) {
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(response.headers.get('Vary'), 'Cookie');
}

test('watchlist GET and PUT reject anonymous sessions before any database access', async () => {
  for (const method of ['GET', 'PUT']) {
    const { route, calls, authConfig } = harness({ session: null });
    const response = await route[method](method === 'PUT' ? request() : undefined);
    assert.equal(response.status, 401);
    assert.deepEqual(calls.auth, [authConfig]);
    assert.equal(calls.db, 0);
    assert.deepEqual(calls.model, []);
    assertPrivate(response);
  }
});

test('authenticated GET reads only the account identified by the server session', async () => {
  const { route, calls, ownData } = harness();
  const response = await route.GET();
  assert.equal(response.status, 200);
  assert.equal(calls.db, 1);
  assert.deepEqual(calls.model.find((call) => call.method === 'findOne').args, [{ userId: 'session-account-a' }]);
  assert.deepEqual(await response.json(), ownData);
  assertPrivate(response);
});

test('PUT rejects a caller-supplied account ID without reading or modifying the database', async () => {
  const { route, calls } = harness();
  const response = await route.PUT(request({ kind: 'event', id: 'fed-decision', following: true, userId: 'victim-account' }));
  assert.equal(response.status, 400);
  assert.equal(calls.db, 0);
  assert.deepEqual(calls.model, []);
  assertPrivate(response);
});

test('cross-origin PUT is rejected before session or database work', async () => {
  const { route, calls } = harness();
  const response = await route.PUT(request(undefined, 'https://untrusted.example'));
  assert.equal(response.status, 403);
  assert.deepEqual(calls.auth, []);
  assert.equal(calls.db, 0);
  assert.deepEqual(calls.model, []);
  assertPrivate(response);
});

test('valid follow initializes and atomically adds only to the authenticated account', async () => {
  const { route, calls } = harness();
  const response = await route.PUT(request());
  assert.equal(response.status, 200);
  const initialize = calls.model.find((call) => call.method === 'updateOne').args;
  assert.deepEqual(initialize, [
    { userId: 'session-account-a' },
    { $setOnInsert: { userId: 'session-account-a', eventSlugs: [], entityIds: [] } },
    { upsert: true },
  ]);
  const [filter, update, config] = calls.model.find((call) => call.method === 'findOneAndUpdate').args;
  assert.equal(filter.userId, 'session-account-a');
  assert.deepEqual(update, { $addToSet: { eventSlugs: 'fed-decision' } });
  assert.deepEqual(config, { new: true, runValidators: true });
  // The same atomic write permits idempotent follows but bounds both collections together.
  assert.deepEqual(filter.$or[0], { eventSlugs: 'fed-decision' });
  assert.equal(filter.$or[1].$expr.$lt[1], 100);
  const combinedSizes = filter.$or[1].$expr.$lt[0].$add;
  assert.deepEqual(combinedSizes.map((size) => size.$size.$ifNull[0]), ['$eventSlugs', '$entityIds']);
  assertPrivate(response);
});

test('entity unfollow uses an atomic pull scoped to the authenticated account', async () => {
  const { route, calls } = harness();
  const response = await route.PUT(request({ kind: 'entity', id: 'bonds', following: false }));
  assert.equal(response.status, 200);
  const [filter, update] = calls.model.find((call) => call.method === 'findOneAndUpdate').args;
  assert.deepEqual(filter, { userId: 'session-account-a' });
  assert.deepEqual(update, { $pull: { entityIds: 'bonds' } });
  assertPrivate(response);
});

test('atomic capacity rejection returns a private conflict instead of claiming a saved follow', async () => {
  const { route } = harness({ writeResult: null });
  const response = await route.PUT(request());
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /100/);
  assertPrivate(response);
});

test('database failure returns a private 503 without leaking connection details', async () => {
  for (const method of ['GET', 'PUT']) {
    const { route, calls } = harness({ dbFailure: true });
    const response = await route[method](method === 'PUT' ? request() : undefined);
    assert.equal(response.status, 503);
    assert.equal(calls.db, 1);
    assert.deepEqual(calls.model, []);
    assert.doesNotMatch(JSON.stringify(await response.json()), /Private DB connection details/);
    assertPrivate(response);
  }
});
