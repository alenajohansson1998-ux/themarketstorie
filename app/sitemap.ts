import { MetadataRoute } from "next";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import Article from "@/models/Article";
import Category from "@/models/Category";
import Tag from "@/models/Tag";
import Broker from "@/models/Broker";
import { DEFAULT_TICKER_SYMBOLS } from "@/lib/finnhub";

export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;

const STATIC_ROUTE_CONFIG: Array<{
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}> = [
  { path: "/", changeFrequency: "hourly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/advertise", changeFrequency: "monthly", priority: 0.8 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.7 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.7 },
  { path: "/risk-disclosure", changeFrequency: "monthly", priority: 0.7 },
  { path: "/learn", changeFrequency: "weekly", priority: 0.75 },
  { path: "/brokers", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "daily", priority: 0.8 },
  { path: "/markets", changeFrequency: "daily", priority: 0.85 },
  { path: "/screener", changeFrequency: "daily", priority: 0.75 },
  { path: "/tools", changeFrequency: "weekly", priority: 0.7 },
  { path: "/tools/forex-heatmap", changeFrequency: "weekly", priority: 0.7 },
  { path: "/tools/forex-heatmap/all-rates", changeFrequency: "weekly", priority: 0.65 },
  { path: "/more", changeFrequency: "monthly", priority: 0.6 },
];

function resolveBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "https://themarketstories.com";

  const normalized = envUrl.trim().replace(/\/$/, "");
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    return `https://${normalized}`;
  }
  return normalized;
}

function asUrl(baseUrl: string, path: string): string {
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function toValidDate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  return new Date();
}

function normalizeSlug(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getCategorySlug(category: unknown): string {
  if (typeof category === "string") {
    return normalizeSlug(category);
  }

  if (category && typeof category === "object") {
    const record = category as { slug?: unknown };
    return normalizeSlug(record.slug);
  }

  return "";
}

function createEntry(
  url: string,
  lastModified: unknown,
  changeFrequency: ChangeFrequency,
  priority: number
): SitemapEntry {
  return {
    url,
    lastModified: toValidDate(lastModified),
    changeFrequency,
    priority,
  };
}

function uniqueEntries(entries: SitemapEntry[]): SitemapEntry[] {
  const byUrl = new Map<string, SitemapEntry>();

  for (const entry of entries) {
    const existing = byUrl.get(entry.url);
    if (!existing) {
      byUrl.set(entry.url, entry);
      continue;
    }

    const existingTime = existing.lastModified
      ? new Date(existing.lastModified).getTime()
      : 0;
    const nextTime = entry.lastModified ? new Date(entry.lastModified).getTime() : 0;

    byUrl.set(entry.url, {
      ...existing,
      ...entry,
      lastModified: nextTime >= existingTime ? entry.lastModified : existing.lastModified,
      priority: Math.max(existing.priority || 0, entry.priority || 0),
    });
  }

  return [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url));
}

function buildStaticEntries(baseUrl: string): SitemapEntry[] {
  const now = new Date();
  const entries: SitemapEntry[] = [];

  for (const route of STATIC_ROUTE_CONFIG) {
    entries.push(createEntry(asUrl(baseUrl, route.path), now, route.changeFrequency, route.priority));
  }

  for (const symbol of DEFAULT_TICKER_SYMBOLS) {
    entries.push(
      createEntry(
        asUrl(baseUrl, `/markets/${encodeURIComponent(symbol)}`),
        now,
        "hourly",
        0.72
      )
    );
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = resolveBaseUrl();
  const staticEntries = buildStaticEntries(baseUrl);

  try {
    await dbConnect();

    const categoryRows = (await Category.find({})
      .select("slug updatedAt")
      .lean()) as Array<{ slug?: unknown; updatedAt?: unknown }>;

    const categoryEntries: SitemapEntry[] = [];
    for (const row of categoryRows) {
      const slug = normalizeSlug(row.slug);
      if (!slug) continue;
      categoryEntries.push(
        createEntry(asUrl(baseUrl, `/category/${slug}`), row.updatedAt, "weekly", 0.7)
      );
    }

    const tagRows = (await Tag.find({}).select("slug updatedAt").lean()) as Array<{
      slug?: unknown;
      updatedAt?: unknown;
    }>;

    const tagEntries: SitemapEntry[] = [];
    for (const row of tagRows) {
      const slug = normalizeSlug(row.slug);
      if (!slug) continue;
      tagEntries.push(createEntry(asUrl(baseUrl, `/tag/${slug}`), row.updatedAt, "weekly", 0.6));
    }

    const cmsPostRows = (await Post.find({ publicationStatus: "published" })
      .populate("category", "slug")
      .select("slug category publishedAt updatedAt")
      .lean()) as Array<{
      slug?: unknown;
      category?: unknown;
      publishedAt?: unknown;
      updatedAt?: unknown;
    }>;

    const cmsPostEntries: SitemapEntry[] = [];
    for (const row of cmsPostRows) {
      const slug = normalizeSlug(row.slug);
      const categorySlug = getCategorySlug(row.category);
      if (!slug || !categorySlug) continue;
      cmsPostEntries.push(
        createEntry(
          asUrl(baseUrl, `/${categorySlug}/${slug}`),
          row.publishedAt || row.updatedAt,
          "daily",
          0.78
        )
      );
    }

    const aiArticleRows = (await Article.find({ status: "published" })
      .populate("category", "slug")
      .select("slug category publishedAt updatedAt")
      .lean()) as Array<{
      slug?: unknown;
      category?: unknown;
      publishedAt?: unknown;
      updatedAt?: unknown;
    }>;

    const aiArticleEntries: SitemapEntry[] = [];
    for (const row of aiArticleRows) {
      const slug = normalizeSlug(row.slug);
      const categorySlug = getCategorySlug(row.category);
      if (!slug || !categorySlug) continue;
      aiArticleEntries.push(
        createEntry(
          asUrl(baseUrl, `/${categorySlug}/${slug}`),
          row.publishedAt || row.updatedAt,
          "daily",
          0.8
        )
      );
    }

    const brokerRows = (await Broker.find({}).select("slug updatedAt").lean()) as Array<{
      slug?: unknown;
      updatedAt?: unknown;
    }>;

    const brokerEntries: SitemapEntry[] = [];
    for (const row of brokerRows) {
      const slug = normalizeSlug(row.slug);
      if (!slug) continue;
      brokerEntries.push(
        createEntry(asUrl(baseUrl, `/brokers/${slug}`), row.updatedAt, "weekly", 0.68)
      );
    }

    return uniqueEntries([
      ...staticEntries,
      ...categoryEntries,
      ...tagEntries,
      ...cmsPostEntries,
      ...aiArticleEntries,
      ...brokerEntries,
    ]);
  } catch (error) {
    console.warn("Sitemap DB generation failed; returning static routes only.", error);
    return uniqueEntries(staticEntries);
  }
}
