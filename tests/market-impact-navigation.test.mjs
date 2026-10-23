import assert from 'node:assert/strict';
import { test } from 'node:test';
import { radarLocation } from '../components/market-impact/navigation.ts';

test('selecting a different event updates a shared deep link and leaves the terminal', () => {
  const result = new URL(radarLocation('https://example.com/markets?event=old-event&view=terminal&tab=stocks', 'radar', 'stocks', 'new-event'), 'https://example.com');
  assert.equal(result.searchParams.get('event'), 'new-event');
  assert.equal(result.searchParams.has('view'), false);
  assert.equal(result.searchParams.has('tab'), false);
});

test('returning to the terminal restores the controlled instrument tab in its URL', () => {
  const current = 'https://example.com/markets?event=saved-event&view=watchlist';
  const result = new URL(radarLocation(current, 'terminal', 'crypto'), 'https://example.com');
  assert.equal(result.searchParams.get('view'), 'terminal');
  assert.equal(result.searchParams.get('tab'), 'crypto');
  assert.equal(result.searchParams.get('event'), 'saved-event');
});

test('calendar and default indices cannot inherit a stale terminal tab', () => {
  const current = 'https://example.com/markets?view=terminal&tab=stocks#workspace';
  const calendar = new URL(radarLocation(current, 'calendar', 'stocks'), 'https://example.com');
  const indices = new URL(radarLocation(current, 'terminal', 'indices'), 'https://example.com');
  assert.equal(calendar.searchParams.has('tab'), false);
  assert.equal(indices.searchParams.has('tab'), false);
  assert.equal(calendar.hash, '#workspace');
});
