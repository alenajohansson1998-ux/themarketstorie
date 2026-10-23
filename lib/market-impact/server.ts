import { z } from 'zod';
import { buildEvents, isFinancialStory, METHODOLOGY_VERSION, type IncomingStory } from './engine';
import type { RadarEvent, RadarFeed } from './types';

const FEED_TTL = 5 * 60_000;
const MAX_EVENTS = 60;
const newsSchema = z.object({
  id: z.union([z.number().finite(), z.string().min(1)]),
  headline: z.string().min(1).max(2000),
  datetime: z.number().finite().positive(),
  source: z.string().min(1).max(300),
  url: z.string().max(3000),
  summary: z.string().max(30_000).optional(),
});

async function boundedJson(response: Response): Promise<unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Empty provider response');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 1_500_000) {
        await reader.cancel();
        throw new Error('News response exceeded size limit');
      }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

interface CacheState { feed?: RadarFeed; expires: number; pending?: Promise<RadarFeed> }
const globalCache = globalThis as typeof globalThis & { marketImpactFeedCache?: CacheState };
const cache = globalCache.marketImpactFeedCache ||= { expires: 0 };

function withTimeout<T>(operation: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([operation, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Radar database timeout')), ms); })]).finally(() => clearTimeout(timer));
}

async function database() {
  if (!process.env.MONGODB_URI) throw new Error('Database not configured');
  const [{ default: connect }, { default: Event }] = await Promise.all([import('@/lib/mongodb'), import('@/models/MarketImpactEvent')]);
  await withTimeout(connect(), 6500);
  return Event;
}

async function fetchProviderStories(): Promise<IncomingStory[]> {
  // Header authentication keeps the key out of URLs, logs, shared caches and client bundles.
  const token = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_KEY;
  if (!token) throw new Error('FINNHUB_API_KEY not configured');
  const response = await fetch('https://finnhub.io/api/v1/news?category=general', {
    headers: { 'X-Finnhub-Token': token, Accept: 'application/json' },
    cache: 'no-store', signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`News provider returned HTTP ${response.status}`);
  const payload = await boundedJson(response);
  if (!Array.isArray(payload)) throw new Error('News provider returned an invalid response');
  const stories: IncomingStory[] = [];
  for (const item of payload.slice(0, 100)) {
    const parsed = newsSchema.safeParse(item);
    if (!parsed.success) continue;
    const news = parsed.data;
    stories.push({ externalId: `finnhub:${news.id}`, title: news.headline, summary: news.summary, publisher: news.source, url: news.url, publishedAt: news.datetime, sourceType: 'reporting' });
  }
  return stories;
}

interface LocalStory {
  _id: unknown; title: string; slug: string; excerpt?: string; createdAt: Date;
  publishedAt?: Date | null; category?: { slug?: string } | null;
}

async function fetchEditorialStories(): Promise<IncomingStory[]> {
  await database();
  const [{ default: Post }, { default: Article }, { default: Category }] = await Promise.all([import('@/models/Post'), import('@/models/Article'), import('@/models/Category')]);
  void Category;
  const now = new Date();
  const [posts, articles] = await Promise.all([
    Post.find({ publicationStatus: 'published', $or: [{ publishedAt: { $lte: now } }, { publishedAt: { $exists: false } }] })
      .select('_id title slug excerpt publishedAt createdAt category').populate('category', 'slug').sort({ publishedAt: -1, createdAt: -1 }).limit(35).maxTimeMS(4000).lean<LocalStory[]>(),
    Article.find({ status: 'published', publishedAt: { $lte: now } })
      .select('_id title slug excerpt publishedAt createdAt category').populate('category', 'slug').sort({ publishedAt: -1, createdAt: -1 }).limit(35).maxTimeMS(4000).lean<LocalStory[]>(),
  ]);
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://themarketstories.com';
  return [...posts.map(post => ({ ...post, kind: 'post' })), ...articles.map(article => ({ ...article, kind: 'article' }))]
    .filter(story => story.category?.slug && isFinancialStory(story.title))
    .map(story => {
      const coverageUrl = `/${encodeURIComponent(story.category!.slug!)}/${encodeURIComponent(story.slug)}`;
      return { externalId: `${story.kind}:${String(story._id)}`, title: story.title, summary: story.excerpt, publisher: 'The Market Stories', url: new URL(coverageUrl, base).toString(), publishedAt: story.publishedAt || story.createdAt, sourceType: 'editorial' as const, coverageUrl };
    });
}

async function persistEvents(events: RadarEvent[]): Promise<RadarEvent[]> {
  if (!events.length) return events;
  const Event = await database();
  const stored = await Event.find({ sourceIds: { $in: events.flatMap(event => event.sources.map(source => source.id)) } }).select('slug sourceIds data.id').limit(MAX_EVENTS * 2).maxTimeMS(3000).lean();
  const stableEvents = events.map(event => {
    const previous = stored.find(record => record.sourceIds.some(id => event.sources.some(source => source.id === id)));
    return previous ? { ...event, slug: previous.slug, id: previous.data.id } : event;
  });
  await Event.bulkWrite(stableEvents.map(event => ({ updateOne: {
    filter: { slug: event.slug },
    update: { $set: { slug: event.slug, data: event, publishedAt: new Date(event.publishedAt), analyzedAt: new Date(), methodologyVersion: METHODOLOGY_VERSION }, $addToSet: { sourceIds: { $each: event.sources.map(source => source.id) } } },
    upsert: true,
  } })), { ordered: false, maxTimeMS: 4000 });
  return stableEvents;
}

async function archivedEvents(): Promise<RadarEvent[]> {
  const Event = await database();
  const rows = await Event.find({ methodologyVersion: METHODOLOGY_VERSION }).sort({ publishedAt: -1 }).limit(MAX_EVENTS).maxTimeMS(3000).lean();
  return rows.map(row => row.data);
}

async function refreshFeed(): Promise<RadarFeed> {
  const [provider, editorial] = await Promise.allSettled([fetchProviderStories(), fetchEditorialStories()]);
  const providers: RadarFeed['providers'] = [
    { name: 'Finnhub market news', status: provider.status === 'fulfilled' ? 'available' : 'unavailable', detail: provider.status === 'fulfilled' ? 'Provider headlines and source links; not independently verified.' : 'News request unavailable. Showing other sourced coverage where available.' },
    { name: 'The Market Stories', status: editorial.status === 'fulfilled' ? 'available' : 'unavailable', detail: editorial.status === 'fulfilled' ? 'Published editorial coverage; may include AI-assisted articles.' : 'Published editorial coverage is currently unavailable.' },
  ];
  const stories = [...(provider.status === 'fulfilled' ? provider.value : []), ...(editorial.status === 'fulfilled' ? editorial.value : [])];
  let events = buildEvents(stories).slice(0, MAX_EVENTS);
  if (events.length) {
    try { events = await persistEvents(events); }
    catch { providers.push({ name: 'Event archive', status: 'unavailable', detail: 'Archive write unavailable; current source data remains readable. Older links may be unavailable.' }); }
  } else {
    try {
      events = await archivedEvents();
      if (events.length) providers.push({ name: 'Event archive', status: 'available', detail: 'Stored real coverage. Check each original publication timestamp; this is not a live feed.' });
    } catch { /* The explicitly unavailable state below is preferable to invented fallback stories. */ }
    if (!events.length && cache.feed?.events.length) events = cache.feed.events;
  }
  const failed = providers.some(item => item.status === 'unavailable');
  return { events, asOf: new Date().toISOString(), status: events.length ? (failed ? 'degraded' : 'ready') : 'unavailable', providers, methodologyVersion: METHODOLOGY_VERSION };
}

/** Coalesces concurrent requests and refreshes at most once every five minutes per worker. */
export async function getRadarFeed(): Promise<RadarFeed> {
  if (cache.feed && cache.expires > Date.now()) return cache.feed;
  if (cache.pending) return cache.pending;
  cache.pending = refreshFeed().then(feed => {
    cache.feed = feed;
    cache.expires = Date.now() + FEED_TTL;
    return feed;
  }).finally(() => { cache.pending = undefined; });
  return cache.pending;
}

export async function getRadarEvent(slug: string): Promise<RadarEvent | null> {
  if (!/^[a-z0-9][a-z0-9-]{0,119}$/.test(slug)) return null;
  const current = cache.feed?.events.find(event => event.slug === slug);
  if (current) return current;
  try {
    const Event = await database();
    const stored = await Event.findOne({ slug, methodologyVersion: METHODOLOGY_VERSION }).maxTimeMS(3000).lean();
    if (stored) return stored.data;
  } catch { /* A missing archive must not prevent reading a current event. */ }
  const feed = await getRadarFeed();
  return feed.events.find(event => event.slug === slug) || null;
}
