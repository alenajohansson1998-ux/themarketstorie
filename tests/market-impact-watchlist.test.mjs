import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  applyRadarWatchlistMutation, emptyRadarWatchlist, normalizeRadarWatchlist,
  parseRadarWatchlistMutation, RadarWatchlistQueue,
} from '../lib/market-impact/watchlist.ts';

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

test('rejects caller-supplied user identity and unsafe IDs', () => {
  assert.deepEqual(parseRadarWatchlistMutation({ kind: 'event', id: 'fed-policy-2026', following: true }), { kind: 'event', id: 'fed-policy-2026', following: true });
  for (const input of [
    { kind: 'event', id: 'safe-event', following: true, userId: 'another-account' },
    { kind: 'event', id: '../unsafe', following: true },
    { kind: 'entity', id: '$set', following: true },
    { kind: 'event', id: 'safe-event', following: 'true' },
    { kind: 'event', id: 'a'.repeat(121), following: true },
  ]) assert.throws(() => parseRadarWatchlistMutation(input));
});

test('sanitizes stored data, deduplicates and bounds combined follows', () => {
  const result = normalizeRadarWatchlist({ eventSlugs: ['valid-event', 'valid-event', '../invalid'], entityIds: Array.from({ length: 120 }, (_, n) => `company-${n}`) });
  assert.deepEqual(result.eventSlugs, ['valid-event']);
  assert.equal(result.entityIds.length, 99);
  assert.deepEqual(normalizeRadarWatchlist(null), emptyRadarWatchlist());
});

test('capacity allows idempotent adds and removals but blocks additional entities', () => {
  const full = { eventSlugs: Array.from({ length: 100 }, (_, n) => `event-${n}`), entityIds: [] };
  assert.equal(applyRadarWatchlistMutation(full, { kind: 'event', id: 'event-0', following: true }).eventSlugs.length, 100);
  assert.throws(() => applyRadarWatchlistMutation(full, { kind: 'entity', id: 'gold', following: true }), /100/);
  const removed = applyRadarWatchlistMutation(full, { kind: 'event', id: 'event-0', following: false });
  assert.equal(applyRadarWatchlistMutation(removed, { kind: 'entity', id: 'gold', following: true }).entityIds.length, 1);
});

test('rapid toggles persist in intent order and do not overwrite newer optimistic state', async () => {
  const first = deferred();
  const second = deferred();
  const calls = [];
  const changes = [];
  const queue = new RadarWatchlistQueue(emptyRadarWatchlist(), (mutation) => {
    calls.push(mutation);
    return calls.length === 1 ? first.promise : second.promise;
  }, (data) => changes.push(data));
  const add = queue.toggle('event', 'oil-supply');
  const remove = queue.toggle('event', 'oil-supply');
  assert.deepEqual(queue.snapshot().eventSlugs, []);
  assert.equal(calls.length, 1);
  first.resolve({ eventSlugs: ['oil-supply'], entityIds: [] });
  await add;
  assert.deepEqual(queue.snapshot().eventSlugs, []);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map((call) => call.following), [true, false]);
  second.resolve(emptyRadarWatchlist());
  await remove;
  assert.deepEqual(changes.at(-1).eventSlugs, []);
});

test('failed optimistic save rolls back its item and preserves another queued follow', async () => {
  const first = deferred();
  const second = deferred();
  let requests = 0;
  const changes = [];
  const queue = new RadarWatchlistQueue(emptyRadarWatchlist(), () => ++requests === 1 ? first.promise : second.promise, (data, error) => changes.push({ data, error }));
  const event = queue.toggle('event', 'fed-decision');
  const entity = queue.toggle('entity', 'bonds');
  first.reject(new Error('Connection lost'));
  await event;
  assert.deepEqual(queue.snapshot(), { eventSlugs: [], entityIds: ['bonds'] });
  second.resolve({ eventSlugs: [], entityIds: ['bonds'] });
  await entity;
  assert.deepEqual(changes.at(-1).data, { eventSlugs: [], entityIds: ['bonds'] });
  assert.equal(changes.at(-1).error, 'Connection lost');
});

test('disposing an account queue suppresses late responses and cancels queued writes', async () => {
  const first = deferred();
  let calls = 0;
  const changes = [];
  const accountA = new RadarWatchlistQueue(emptyRadarWatchlist(), () => { calls++; return first.promise; }, (data) => changes.push(data));
  const saving = accountA.toggle('event', 'account-a-event');
  const queued = accountA.toggle('entity', 'banks');
  accountA.dispose();
  const updatesBeforeLateResponse = changes.length;
  first.resolve({ eventSlugs: ['account-a-event'], entityIds: [] });
  await Promise.all([saving, queued]);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls, 1);
  assert.equal(changes.length, updatesBeforeLateResponse);
  const accountB = new RadarWatchlistQueue(emptyRadarWatchlist(), async () => emptyRadarWatchlist(), () => {});
  assert.deepEqual(accountB.snapshot(), emptyRadarWatchlist());
});

test('browser storage failures roll back and expose a useful error', async () => {
  let latest;
  const queue = new RadarWatchlistQueue(emptyRadarWatchlist(), async () => { throw new Error('Browser storage is full'); }, (data, error) => { latest = { data, error }; });
  await queue.toggle('entity', 'gold');
  assert.deepEqual(latest.data, emptyRadarWatchlist());
  assert.equal(latest.error, 'Browser storage is full');
});
