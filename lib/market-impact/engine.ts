import { createHash } from 'node:crypto';
import { documentedImpacts, mentionedEntities } from './relationships';
import type { RadarAssetClass, RadarCategory, RadarEvent, RadarSource } from './types';

export const METHODOLOGY_VERSION = '1.0-rules';
export const RADAR_CATEGORIES = ['monetary-policy', 'economy', 'earnings', 'corporate', 'geopolitics', 'energy', 'crypto', 'technology', 'regulation', 'markets'] as const satisfies readonly RadarCategory[];
export const RADAR_ASSET_CLASSES = ['Equities', 'Bonds', 'Commodities', 'Currencies', 'Crypto'] as const satisfies readonly RadarAssetClass[];

export interface IncomingStory {
  externalId: string;
  title: string;
  summary?: string;
  publisher: string;
  url: string;
  publishedAt: string | number | Date;
  sourceType: RadarSource['type'];
  coverageUrl?: string;
}
export interface NormalizedStory extends Omit<IncomingStory, 'publishedAt'> {
  publishedAt: string;
  summary: string;
  canonicalUrl: string;
}

export function plainText(value: string, maxLength: number): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|amp|quot|apos|lt|gt);/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function canonicalSourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || !url.hostname.includes('.')) return null;
    if (/^(?:localhost|127\.|0\.|169\.254\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/i.test(url.hostname)) return null;
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^(?:utm_|fbclid$|gclid$|ref$|source$)/i.test(key)) url.searchParams.delete(key);
    }
    url.searchParams.sort();
    url.hostname = url.hostname.toLowerCase();
    return url.toString();
  } catch { return null; }
}

export function normalizeStory(input: IncomingStory, now = Date.now()): NormalizedStory | null {
  const title = plainText(input.title, 240);
  const publisher = plainText(input.publisher, 100);
  const canonicalUrl = canonicalSourceUrl(input.url);
  const date = new Date(typeof input.publishedAt === 'number' ? input.publishedAt * 1000 : input.publishedAt);
  if (!title || !publisher || !canonicalUrl || !input.externalId || !Number.isFinite(date.getTime()) || date.getTime() > now + 300_000 || date.getTime() < Date.UTC(2000, 0, 1)) return null;
  return { ...input, title, publisher, canonicalUrl, url: canonicalUrl, publishedAt: date.toISOString(), summary: plainText(input.summary || '', 320) };
}

export function classifyEvent(title: string): RadarCategory {
  if (/\b(?:central bank|federal reserve|fed|fomc|ecb|bank of england|bank of japan|reserve bank|rbi|boe|boj)\b/i.test(title) && /\b(?:rate|rates|policy|hike|cut|cuts|easing|tightening)\b/i.test(title)) return 'monetary-policy';
  if (/\b(?:earnings|quarterly results|profit|profits|eps|revenue|revenues)\b/i.test(title)) return 'earnings';
  if (/\b(?:crude|oil|opec|brent|petroleum|natural gas|energy supply)\b/i.test(title)) return 'energy';
  if (/\b(?:bitcoin|btc|ethereum|ether|crypto|cryptocurrency|stablecoin)\b/i.test(title)) return 'crypto';
  if (/\b(?:inflation|cpi|gdp|payrolls|employment|unemployment|jobs report|retail sales|pce)\b/i.test(title)) return 'economy';
  if (/\b(?:tariff|tariffs|antitrust|regulator|regulation|sec charges|trade ban|export controls)\b/i.test(title)) return 'regulation';
  if (/\b(?:war|military|conflict|sanctions|geopolitical|missile|ceasefire)\b/i.test(title)) return 'geopolitics';
  if (/\b(?:semiconductor|semiconductors|chipmaker|chips|artificial intelligence|nvidia|openai)\b/i.test(title)) return 'technology';
  if (/\b(?:acquisition|merger|merges|takeover|funding|layoffs|ipo|buyback|dividend)\b/i.test(title)) return 'corporate';
  return 'markets';
}

/** Reject unrelated local general-interest stories without pretending to assess their financial impact. */
export function isFinancialStory(title: string): boolean {
  return classifyEvent(title) !== 'markets' || mentionedEntities(title).length > 0 || /\b(?:stocks?|shares?|markets?|bonds?|yields?|currency|currencies|investors?|nasdaq|s&p|sensex|nifty|gold|silver|dollar|euro|economy|economic|banking)\b/i.test(title);
}

export function inferAssetClasses(title: string, category: RadarCategory): RadarAssetClass[] {
  const classes: RadarAssetClass[] = [];
  if (/\b(?:stocks?|shares?|equities|nasdaq|s&p|sensex|nifty)\b/i.test(title) || ['earnings', 'corporate', 'technology'].includes(category)) classes.push('Equities');
  if (/\b(?:bonds?|treasur(?:y|ies)|gilt|gilts|yields?)\b/i.test(title)) classes.push('Bonds');
  if (/\b(?:oil|crude|brent|gold|silver|copper|commodit(?:y|ies)|petroleum|natural gas)\b/i.test(title)) classes.push('Commodities');
  if (/\b(?:currenc(?:y|ies)|forex|dollar|euro|sterling|rupee|yen)\b/i.test(title)) classes.push('Currencies');
  if (category === 'crypto') classes.push('Crypto');
  return classes;
}

export function inferRegion(title: string): string {
  const matches: string[] = [];
  if (/\b(?:india|indian|rbi|nifty|sensex|rupee)\b/i.test(title)) matches.push('India');
  if (/\b(?:china|chinese|beijing|hong kong)\b/i.test(title)) matches.push('China');
  if (/\b(?:europe|european|ecb|eurozone)\b/i.test(title)) matches.push('Europe');
  if (/\b(?:britain|british|uk|bank of england)\b/i.test(title)) matches.push('United Kingdom');
  if (/\b(?:japan|japanese|bank of japan|boj)\b/i.test(title)) matches.push('Japan');
  if (/\b(?:united states|federal reserve|wall street|nasdaq)\b|\bu\.s\./i.test(title) || /\b(?:US|Fed|FOMC)\b/.test(title)) matches.push('United States');
  return matches.length === 1 ? matches[0] : 'Global / unspecified';
}

function normalizedTitle(title: string): string { return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function numberSignature(title: string): string { return (title.match(/\d+(?:[.,]\d+)*(?:%|[bmk])?/gi) || []).join('|'); }

export function sameUnderlyingStory(a: NormalizedStory, b: NormalizedStory): boolean {
  if (a.canonicalUrl === b.canonicalUrl) return true;
  if (Math.abs(Date.parse(a.publishedAt) - Date.parse(b.publishedAt)) > 48 * 3_600_000) return false;
  if (numberSignature(a.title) !== numberSignature(b.title)) return false;
  const left = normalizedTitle(a.title), right = normalizedTitle(b.title);
  if (left === right) return true;
  const aTokens = new Set(left.split(' ')), bTokens = new Set(right.split(' '));
  const overlap = [...aTokens].filter(token => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return aTokens.size >= 7 && bTokens.size >= 7 && overlap / union >= 0.9;
}

export function deduplicateStories(stories: NormalizedStory[]): NormalizedStory[][] {
  const groups: NormalizedStory[][] = [];
  for (const story of [...stories].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt) || a.externalId.localeCompare(b.externalId))) {
    const existing = groups.find(group => sameUnderlyingStory(group[0], story));
    if (existing) {
      if (!existing.some(item => item.canonicalUrl === story.canonicalUrl)) existing.push(story);
    } else groups.push([story]);
  }
  return groups;
}

export function scoreEvent(category: RadarCategory, sources: RadarSource[], impactCount: number): { significance: number; evidenceConfidence: number; uncertainty: number } {
  const importance: Record<RadarCategory, number> = { 'monetary-policy': 76, economy: 70, earnings: 58, corporate: 55, geopolitics: 68, energy: 68, crypto: 54, technology: 52, regulation: 64, markets: 42 };
  const official = sources.some(source => source.type === 'official');
  const reporting = sources.some(source => source.type === 'reporting');
  const publishers = new Set(sources.map(source => source.publisher.toLowerCase())).size;
  // Several URLs from one publisher are not independent corroboration. These are heuristic scores, not validated probabilities.
  const evidenceConfidence = Math.min(90, (official ? 82 : reporting ? 58 : 38) + Math.min(8, Math.max(0, publishers - 1) * 4));
  return { significance: Math.min(88, importance[category] + Math.min(8, impactCount * 2)), evidenceConfidence, uncertainty: official ? 65 : reporting ? 78 : 88 };
}

export function eventFromStories(stories: NormalizedStory[]): RadarEvent {
  if (!stories.length) throw new Error('An event needs at least one attributed source');
  const lead = stories[0];
  const id = createHash('sha256').update(lead.externalId).digest('hex').slice(0, 14);
  const slugBase = normalizedTitle(lead.title).replace(/ /g, '-').slice(0, 94).replace(/-$/, '') || 'market-event';
  const slug = `${slugBase}-${id}`;
  const sources: RadarSource[] = stories.map(story => ({ id: story.externalId, title: story.title, publisher: story.publisher, url: story.canonicalUrl, publishedAt: story.publishedAt, type: story.sourceType }));
  const category = classifyEvent(lead.title);
  const impacts = documentedImpacts(lead.title);
  const entities = [...mentionedEntities(lead.title), ...impacts.map(impact => impact.entity)].filter((entity, index, list) => list.findIndex(item => item.id === entity.id) === index);
  const assetClasses: RadarAssetClass[] = [...new Set([...entities.map(entity => entity.assetClass), ...inferAssetClasses(lead.title, category)])];
  const region = inferRegion(lead.title);
  const ownCoverage = stories.find(story => story.coverageUrl);
  return {
    id, slug, title: lead.title, summary: lead.summary || `Reported by ${lead.publisher}. Open the original source for the full report.`,
    category, region, assetClasses, publishedAt: lead.publishedAt, eventOccurredAt: null, sources, entities, impacts,
    ...scoreEvent(category, sources, impacts.length),
    whyItMatters: impacts.length ? 'The headline matches documented economic channels below. These are conditional research connections; the report and any market reaction need separate verification.' : entities.length ? 'The source names the entities below. No additional supplier, competitor or causal links have been inferred.' : 'This report may be relevant to market research. No documented exposure has been matched with enough specificity to draw a connection.',
    whatToWatch: impacts.length ? ['Check the original announcement and subsequent official updates.', 'Compare relevant price observations with timestamps and a suitable benchmark.', 'Check whether the development was anticipated before treating it as new information.'] : ['Check the original source and any subsequent company or official statement.', 'Look for independently corroborating coverage before drawing conclusions.'],
    alternativeScenarios: [...new Set(impacts.flatMap(impact => impact.alternatives))].slice(0, 5).concat(impacts.length ? [] : ['The information may already be reflected in prices.', 'Broader market conditions may matter more than this report.']),
    evidenceLimitations: [
      'Publication time is known; the underlying event time has not been independently verified.',
      'Headline-based classification and heuristic scores are uncalibrated research aids, not probabilities or price predictions.',
      ...(sources.some(source => source.type === 'official') ? [] : ['No official announcement has been independently checked for this event.']),
      ...(sources.every(source => source.type === 'editorial') ? ['This is published Market Stories coverage, which may include AI-assisted content; it is not independent confirmation of the claims.'] : []),
      ...(impacts.length ? ['Relationship references explain general mechanisms; they do not confirm this report or establish a causal market reaction.'] : ['No documented economic relationship has been matched for the impact map.']),
    ], analysisType: 'rules', ...(ownCoverage ? { coverageUrl: ownCoverage.coverageUrl } : {}),
  };
}

export function buildEvents(stories: IncomingStory[], now = Date.now()): RadarEvent[] {
  const normalized = stories.map(story => normalizeStory(story, now)).filter((story): story is NormalizedStory => story !== null);
  return deduplicateStories(normalized).map(eventFromStories).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
