import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import * as format from '../components/market-impact/format.ts';
import { radarLocation } from '../components/market-impact/navigation.ts';

const source = readFileSync(new URL('../components/market-impact/RadarDashboard.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;

// Explicit test fixtures: nothing here is presented as real news or fetched from a provider.
const asOf = '2026-10-24T08:00:00Z';
const entity = { id: 'fixture-bonds', name: 'Fixture government bonds', type: 'sector', assetClass: 'Bonds', description: 'Fixture economic exposure.' };
const impact = {
  entity, channel: 'Fixture rate channel', explanation: 'Fixture conditional research explanation.',
  exposure: 'indirect', direction: 'uncertain', confidence: 'medium', evidence: [], alternatives: ['Fixture alternative.'],
};
function event(id, overrides = {}) {
  return {
    id, slug: id, title: `Fixture report ${id}`, summary: 'A source-attributed fixture report.',
    category: 'markets', region: 'Global / unspecified', assetClasses: ['Equities'],
    publishedAt: '2026-10-23T08:00:00Z', eventOccurredAt: null,
    sources: [{ id: `${id}-source`, title: 'Fixture source', publisher: 'Fixture News', url: 'https://example.test/report', publishedAt: '2026-10-23T08:00:00Z', type: 'reporting' }],
    entities: [], impacts: [], significance: 50, evidenceConfidence: 58, uncertainty: 78,
    whyItMatters: 'Fixture conditional interpretation.', whatToWatch: ['Check the fixture source.'],
    alternativeScenarios: ['Fixture alternative.'], evidenceLimitations: ['Fixture evidence limit.'], analysisType: 'rules',
    ...overrides,
  };
}
function feed(events = [], status = 'ready') {
  return { events, asOf, status, providers: [{ name: 'Fixture provider', status: status === 'unavailable' ? 'unavailable' : 'available' }], methodologyVersion: '1.0-rules' };
}

function harness({ watchlist = {} } = {}) {
  const buttons = [];
  const terminalProps = [];
  const mappedEvents = [];
  const removedEntities = [];
  const watchlistState = {
    eventSlugs: [], entityIds: [], loading: false, error: null, scope: 'browser',
    toggleEvent: async () => {}, toggleEntity: async (id) => { removedEntities.push(id); }, ...watchlist,
  };
  const createElement = (factory) => (type, props, key) => {
    // Capture public DOM action props while keeping React hooks and server rendering real.
    if (type === 'button') buttons.push(props);
    return factory(type, props, key);
  };
  const icon = () => React.createElement('svg', { 'aria-hidden': true });
  const dependencies = {
    react: React,
    'react/jsx-runtime': { ...jsxRuntime, jsx: createElement(jsxRuntime.jsx), jsxs: createElement(jsxRuntime.jsxs) },
    'next/link': { __esModule: true, default: ({ href, ...props }) => React.createElement('a', { href, ...props }) },
    'next/dynamic': { __esModule: true, default: () => (props) => {
      terminalProps.push(props);
      return React.createElement('div', { 'data-terminal-value': props.value }, props.value ? `Terminal tab: ${props.value}` : 'Deferred provider calendar');
    } },
    'lucide-react': new Proxy({}, { get: () => icon }),
    '@/lib/marketStatus': { getNyseStatus: () => ({ label: 'Fixture session estimate', short: 'Fixture session', open: false }) },
    './ImpactMap': { __esModule: true, default: ({ event: selected }) => {
      mappedEvents.push(selected);
      return React.createElement('div', { 'data-impact-event': selected.id }, `Connections for ${selected.title}`);
    } },
    './ObservedReaction': { __esModule: true, default: () => React.createElement('div', null, 'Observed data child') },
    './useRadarWatchlist': { useRadarWatchlist: () => watchlistState },
    './format': format,
    './navigation': { radarLocation },
    './Radar.module.css': { __esModule: true, default: new Proxy({}, { get: (_, name) => String(name) }) },
  };
  const exports = {};
  runInNewContext(compiled, {
    exports,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dashboard dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename: 'radar-dashboard-under-test.cjs' });
  return {
    buttons, terminalProps, mappedEvents, removedEntities,
    render(props = {}) {
      return renderToStaticMarkup(React.createElement(exports.default, { initialFeed: feed(), initialSnapshot: { quotes: [], asOf }, initialMarket: 'global', ...props }));
    },
  };
}

test('Indian prices distinguish index points from rupees and timestamps cross dates in IST', () => {
  assert.equal(format.formatRadarPrice(24000.5, 'PTS'), '24,000.5 pts');
  assert.equal(format.formatRadarPrice(120000, 'INR'), '\u20b91,20,000.00');
  assert.equal(format.formatRadarTime('2026-10-23T23:00:00Z', true), '24 Oct, 04:30 IST');
});

test('initial workspace selects the first mapped event even when a newer higher-ranked report has no map', () => {
  const newest = event('newest-unmapped', { publishedAt: asOf, significance: 88 });
  const firstMapped = event('first-mapped', { impacts: [impact], entities: [entity], significance: 60 });
  const laterMapped = event('later-mapped', { impacts: [impact], entities: [entity], significance: 70 });
  const ui = harness();
  const html = ui.render({ initialFeed: feed([newest, firstMapped, laterMapped]) });
  assert.deepEqual(ui.mappedEvents.map(item => item.id), ['first-mapped']);
  assert.match(html, /data-impact-event="first-mapped"/);
  assert.match(html, /href="\/market-impact\/events\/first-mapped"/);
  assert.doesNotMatch(html, /data-impact-event="newest-unmapped"/);
});

test('a followed entity outside the current feed stays visible and its enabled action unfollows the saved ID', async () => {
  const ui = harness({ watchlist: { entityIds: ['archived-fixture-company'] } });
  const html = ui.render({ initialView: 'watchlist' });
  assert.match(html, /Outside the current event feed/);
  assert.match(html, /archived-fixture-company/);
  const remove = ui.buttons.find(button => button['aria-label'] === 'Unfollow saved entity archived-fixture-company');
  assert.ok(remove, 'The saved entity must retain an accessible removal action');
  assert.equal(remove.disabled, false);
  await remove.onClick();
  assert.deepEqual(ui.removedEntities, ['archived-fixture-company']);
});

test('an unavailable empty provider shows missing data and retry actions without inventing an event map', () => {
  const ui = harness();
  const html = ui.render({ initialFeed: feed([], 'unavailable') });
  assert.match(html, /Market quotes are unavailable/);
  assert.match(html, /No verified event feed is available right now/);
  assert.match(html, /Waiting for sourced events/);
  assert.match(html, /Retry sources/);
  assert.equal(ui.mappedEvents.length, 0);
  assert.doesNotMatch(html, /Read full analysis|data-impact-event=/);
});

test('a missing quote retains its unavailable status and does not render a zero price', () => {
  const ui = harness();
  const html = ui.render({ initialSnapshot: { asOf, quotes: [{
    symbol: 'SPY', name: 'Fixture S&P 500 ETF', assetClass: 'Equities', price: null,
    change: null, changePercent: null, currency: 'USD', timestamp: null,
    provider: 'Fixture provider', sourceUrl: 'https://example.test/quote', status: 'unavailable', points: [],
  }] } });
  assert.match(html, /Observation unavailable/);
  assert.match(html, />Unavailable<\/a>/);
  assert.doesNotMatch(html, /\$0\.00|\+0\.00%/);
});

test('an initial crypto terminal deep link passes the controlled tab and change callback to the terminal', () => {
  const ui = harness();
  const html = ui.render({ initialView: 'terminal', initialMarketTab: 'crypto' });
  assert.match(html, /data-terminal-value="crypto"/);
  assert.equal(ui.terminalProps.length, 1);
  assert.equal(ui.terminalProps[0].value, 'crypto');
  assert.equal(typeof ui.terminalProps[0].onTabChange, 'function');
  assert.equal(ui.mappedEvents.length, 0);
});

test('Indian snapshot displays only Groww observations, rupee prices, and provider setup failures', () => {
  const ui = harness();
  const html = ui.render({ initialMarket: 'india', initialSnapshot: { asOf, providers: [{ name: 'Groww', status: 'unavailable', detail: 'Groww data is not connected.' }], quotes: [
    { symbol: 'NSE:RELIANCE', name: 'Reliance Industries', assetClass: 'Equities', market: 'India', exchange: 'NSE', price: 1500, change: 5, changePercent: 0.33, currency: 'INR', timestamp: asOf, provider: 'Groww', sourceUrl: 'https://groww.in/trade-api', status: 'delayed', points: [] },
    { symbol: 'SPY', name: 'Global fixture hidden in India view', assetClass: 'Equities', price: 500, change: 1, changePercent: 0.2, currency: 'USD', timestamp: asOf, provider: 'Fixture provider', sourceUrl: 'https://example.test', status: 'delayed', points: [] },
  ] } });
  assert.match(html, /Reliance Industries/);
  assert.ok(html.includes('\u20b91,500.00'));
  assert.match(html, /Groww \u00b7 delayed/);
  assert.match(html, /Groww data is not connected/);
  assert.match(html, /Retry Groww/);
  assert.match(html, /IST/);
  assert.doesNotMatch(html, /Global fixture hidden/);
});
