import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Fixtures below are test-only hypothetical news. They are never imported by the application.
// Compile the pure TS modules for Node's runner without adding a runtime/test dependency.
const temp = mkdtempSync(join(tmpdir(), 'tms-radar-tests-'));
writeFileSync(join(temp, 'package.json'), '{"type":"commonjs"}');
mkdirSync(join(temp, 'node_modules'), { recursive: true });
const require = createRequire(import.meta.url);
for (const name of ['engine', 'relationships', 'query', 'server']) {
  const source = readFileSync(new URL(`../lib/market-impact/${name}.ts`, import.meta.url), 'utf8');
  let compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  compiled = compiled.replace('require("zod")', `require(${JSON.stringify(require.resolve('zod'))})`);
  writeFileSync(join(temp, `${name}.js`), compiled);
}
const { normalizeStory, canonicalSourceUrl, classifyEvent, sameUnderlyingStory, deduplicateStories, eventFromStories, scoreEvent, buildEvents, isFinancialStory, inferRegion } = require(join(temp, 'engine.js'));
const { documentedImpacts, mentionedEntities } = require(join(temp, 'relationships.js'));
const { eventQuerySchema, queryRadarEvents } = require(join(temp, 'query.js'));
after(() => {
  assert.equal(dirname(resolve(temp)), resolve(tmpdir()));
  assert(basename(temp).startsWith('tms-radar-tests-'));
  rmSync(temp, { recursive: true, force: true });
});

const now = Date.parse('2026-10-23T10:00:00Z');
const story = (overrides = {}) => ({ externalId: 'fixture:1', title: 'Central bank cuts policy rates in October', summary: 'A hypothetical test report.', publisher: 'Test Publisher', url: 'https://example.com/story?utm_source=test', publishedAt: '2026-10-23T09:00:00Z', sourceType: 'reporting', ...overrides });
const normalized = (overrides = {}) => normalizeStory(story(overrides), now);

test('normalization retains original publication time, normalizes tracking and strips markup', () => {
  const value = normalized({ title: '<b>Central bank</b> cuts rates', publishedAt: 1792746000 });
  assert.equal(value.title, 'Central bank cuts rates');
  assert.equal(value.publishedAt, '2026-10-23T09:00:00.000Z');
  assert.equal(value.url, 'https://example.com/story');
});

test('invalid/future dates and unsafe source URLs never reach the event feed', () => {
  for (const publishedAt of ['invalid', '2027-01-01T00:00:00Z', '1999-01-01']) assert.equal(normalized({ publishedAt }), null);
  for (const url of ['javascript:alert(1)', 'file:///secret', 'https://user:secret@example.com/story', 'http://127.0.0.1/story', 'http://172.16.0.1/story', '/relative']) assert.equal(normalized({ url }), null);
  assert.equal(canonicalSourceUrl('https://EXAMPLE.com/story?b=2&a=1&fbclid=x#section'), 'https://example.com/story?a=1&b=2');
});

test('category matching is conservative and ordinary bank earnings do not become a policy decision', () => {
  assert.equal(classifyEvent('Bank quarterly earnings rise'), 'earnings');
  assert.equal(documentedImpacts('Bank quarterly earnings rise').length, 0);
  assert.equal(classifyEvent('Federal Reserve holds rates'), 'monetary-policy');
  assert.equal(classifyEvent('Brent crude inventories decline'), 'energy');
  assert.equal(isFinancialStory('Education minister discusses school curriculum'), false);
  assert.deepEqual(eventFromStories([normalized({ title: 'Investors find opportunities in the bond market' })]).assetClasses, ['Bonds']);
  assert.deepEqual(eventFromStories([normalized({ title: 'Leaders debate a ceasefire' })]).assetClasses, []);
});

test('same URL and near-identical coverage deduplicate but different figures or days do not', () => {
  const first = normalized();
  const matching = normalized({ externalId: 'fixture:2', publisher: 'Other Publisher', url: 'https://other.example.com/story', title: 'Central bank cuts policy rates in October!' });
  assert.equal(sameUnderlyingStory(first, matching), true);
  assert.equal(deduplicateStories([first, matching]).length, 1);
  assert.equal(sameUnderlyingStory(normalized({ title: 'Company earnings rise 10 percent' }), normalized({ title: 'Company earnings rise 20 percent', url: 'https://example.com/other' })), false);
  assert.equal(sameUnderlyingStory(first, normalized({ url: 'https://example.com/new', publishedAt: '2026-10-20T09:00:00Z' })), false);
});

test('retains all source links and does not turn reporting time or economic mechanisms into verified facts', () => {
  const event = eventFromStories([normalized(), normalized({ externalId: 'fixture:2', url: 'https://other.example.com/story', publisher: 'Other Publisher' })]);
  assert.equal(event.sources.length, 2);
  assert.equal(event.eventOccurredAt, null);
  assert.equal(event.analysisType, 'rules');
  assert.equal(event.impacts.length, 4);
  assert(event.impacts.every(impact => impact.direction === 'uncertain' && impact.evidence.length > 0));
  assert(event.evidenceLimitations.some(item => item.includes('No official announcement')));
  assert.equal(eventFromStories([normalized()]).slug, eventFromStories([normalized()]).slug);
  assert.match(eventFromStories([normalized({ title: 'बाजार समाचार' })]).slug, /^market-event-[a-f0-9]+$/);
});

test('mentions resolve only curated issuers and do not invent supplier connections', () => {
  const entities = mentionedEntities('Nvidia and Microsoft announce new products');
  assert.deepEqual(entities.map(entity => entity.symbol), ['MSFT', 'NVDA']);
  assert.equal(documentedImpacts('Nvidia and Microsoft announce new products').length, 0);
});

test('region tags rely on explicit geographic cues and avoid ambiguous US or cross-country guesses', () => {
  assert.equal(inferRegion('What bond markets tell us about the economy'), 'Global / unspecified');
  assert.equal(inferRegion('US stocks close higher'), 'United States');
  assert.equal(inferRegion('U.S. stock market gains'), 'United States');
  assert.equal(inferRegion('India and China discuss trade'), 'Global / unspecified');
  assert.equal(inferRegion('Bank of Japan holds rates'), 'Japan');
});

test('source evidence and uncertainty remain separate from significance', () => {
  const editorial = eventFromStories([normalized({ sourceType: 'editorial' })]);
  const reporting = eventFromStories([normalized()]);
  assert(editorial.evidenceConfidence < reporting.evidenceConfidence);
  assert(editorial.uncertainty > reporting.uncertainty);
  assert.equal(editorial.significance, reporting.significance);
  assert(editorial.evidenceLimitations.some(item => item.includes('AI-assisted')));
  const singlePublisher = scoreEvent('energy', reporting.sources.concat(reporting.sources), 2);
  assert.equal(singlePublisher.evidenceConfidence, scoreEvent('energy', reporting.sources, 2).evidenceConfidence);
});

test('validates bounded pagination and dates, then searches entity tickers accurately', () => {
  for (const query of [{ page: '0' }, { limit: '999' }, { category: 'made-up' }, { q: 'x'.repeat(121) }, { from: '2026-10-23T00:00:00Z', to: '2026-10-22T00:00:00Z' }]) assert.equal(eventQuerySchema.safeParse(query).success, false);
  const events = buildEvents([story(), story({ externalId: 'fixture:nvda', title: 'Nvidia earnings report released', url: 'https://example.com/nvda' })], now);
  const result = queryRadarEvents(events, eventQuerySchema.parse({ q: 'NVDA', limit: '1' }));
  assert.equal(result.pagination.total, 1);
  assert.equal(result.events[0].category, 'earnings');
  assert.equal(queryRadarEvents(events, eventQuerySchema.parse({ page: '3', limit: '1' })).events.length, 0);
});

test('missing providers fail to an honest unavailable state without generated fallback news', async () => {
  const keys = ['MONGODB_URI', 'FINNHUB_API_KEY', 'NEXT_PUBLIC_FINNHUB_KEY'];
  const saved = keys.map(key => [key, process.env[key]]);
  const priorCache = globalThis.marketImpactFeedCache;
  try {
    keys.forEach(key => { delete process.env[key]; });
    delete globalThis.marketImpactFeedCache;
    delete require.cache[require.resolve(join(temp, 'server.js'))];
    const server = require(join(temp, 'server.js'));
    const feed = await server.getRadarFeed();
    assert.equal(feed.status, 'unavailable');
    assert.deepEqual(feed.events, []);
    assert(feed.providers.every(provider => provider.status === 'unavailable'));
  } finally {
    for (const [key, value] of saved) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    globalThis.marketImpactFeedCache = priorCache;
  }
});

test('concurrent reads share one bounded provider request and database failure preserves sourced events', async () => {
  const keys = ['MONGODB_URI', 'FINNHUB_API_KEY', 'NEXT_PUBLIC_FINNHUB_KEY'];
  const saved = keys.map(key => [key, process.env[key]]);
  const priorCache = globalThis.marketImpactFeedCache;
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    delete process.env.MONGODB_URI;
    process.env.FINNHUB_API_KEY = 'fixture-private-key';
    delete globalThis.marketImpactFeedCache;
    delete require.cache[require.resolve(join(temp, 'server.js'))];
    globalThis.fetch = async (url, options) => {
      calls++;
      assert.equal(url, 'https://finnhub.io/api/v1/news?category=general');
      assert.equal(options.headers['X-Finnhub-Token'], 'fixture-private-key');
      assert(options.signal);
      return Response.json([{ id: 123, headline: 'Hypothetical crude oil supply report', summary: 'Test fixture only.', source: 'Fixture Publisher', url: 'https://example.com/test-only-oil', datetime: Math.floor(Date.now() / 1000) - 60 }]);
    };
    const server = require(join(temp, 'server.js'));
    const feeds = await Promise.all([server.getRadarFeed(), server.getRadarFeed(), server.getRadarFeed()]);
    assert.equal(calls, 1);
    assert.equal(feeds[0].status, 'degraded');
    assert.equal(feeds[0].events.length, 1);
    assert.equal(feeds[0].events[0].sources[0].publisher, 'Fixture Publisher');
    assert.equal(JSON.stringify(feeds[0]).includes('fixture-private-key'), false);
    assert.equal((await server.getRadarEvent(feeds[0].events[0].slug)).id, feeds[0].events[0].id);
    assert.equal(await server.getRadarEvent('../invalid'), null);
    await server.getRadarFeed();
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of saved) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    globalThis.marketImpactFeedCache = priorCache;
  }
});
