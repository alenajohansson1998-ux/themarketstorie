import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import dbConnect from "@/lib/mongodb";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";
import { toSlug } from "@/lib/articles/slug";
import {
  ensureDefaultArticleCategories,
  resolveCategoryIdForType,
} from "@/lib/articles/categoryMapping";
import { canManageArticles, logArticleEvent } from "@/lib/articles/workflow";
import Article from "@/models/Article";
import Author from "@/models/Author";

interface IndiaClock {
  weekday: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dateKey: string;
  label: string;
}

interface GeneratePayload {
  success?: boolean;
  error?: string;
  data?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    tags?: string[];
    image?: string;
    provider?: string;
    mode?: string;
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
    };
  };
}

interface YahooChartPayload {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
      };
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
        }>;
      };
    }>;
  };
}

interface CommoditySnapshot {
  label: string;
  symbol: string;
  price: number;
  changePct: number;
  high20: number;
  low20: number;
  sourceUrl: string;
}

interface NewsItem {
  headline: string;
  url: string;
  source: string;
  publishedAt: string;
}

function getAutomationSecret(): string {
  return process.env.CRON_SECRET || process.env.AI_AUTOMATION_SECRET || "";
}

function isAuthorizedBySecret(req: NextRequest): boolean {
  const secret = getAutomationSecret();
  if (!secret) return false;

  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const cronHeader = req.headers.get("x-cron-secret") || "";
  return bearer === secret || cronHeader === secret;
}

function getIndiaClock(referenceDate = new Date()): IndiaClock {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(referenceDate);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  const year = Number(map.year || "0");
  const month = Number(map.month || "0");
  const day = Number(map.day || "0");
  const hour = Number(map.hour || "0");
  const minute = Number(map.minute || "0");
  const weekday = map.weekday || "";
  const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const label = `${dateKey} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} IST`;

  return { weekday, year, month, day, hour, minute, dateKey, label };
}

function isPublishWindow(clock: IndiaClock): boolean {
  if (clock.hour > 19) return true;
  return clock.hour === 19;
}

function buildDailyTitle(clock: IndiaClock): string {
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${clock.dateKey}T13:30:00Z`));

  return `Commodities and Geopolitical Risk Report: Oil Supply, Gold Volatility and Trade Tensions - ${dateLabel}`;
}

function buildDailySlug(seedSlug: string, dateKey: string): string {
  const base =
    toSlug(seedSlug || "commodities-geopolitical-risk-report") ||
    "commodities-geopolitical-risk-report";
  const shortBase = base.slice(0, 72).replace(/-+$/g, "");
  if (shortBase.endsWith(dateKey)) {
    return shortBase;
  }
  return `${shortBase}-${dateKey}`;
}

function normalizeTags(tags: string[] | undefined): string[] {
  const base = Array.isArray(tags) ? tags : [];
  const merged = [
    ...base,
    "Commodities",
    "Geopolitical Risk",
    "Oil Market",
    "OPEC",
    "Gold",
    "China Demand",
    "Trade Tensions",
  ];

  const seen = new Set<string>();
  const output: string[] = [];
  for (const tag of merged) {
    if (typeof tag !== "string") continue;
    const cleaned = tag.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(cleaned);
  }

  return output;
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMetaDescription(primary: string, fallback: string): string {
  const cleanPrimary = stripHtml(primary || "");
  const cleanFallback = stripHtml(fallback || "");
  const source = cleanPrimary || cleanFallback;
  if (!source) return "";

  if (source.length >= 155 && source.length <= 165) {
    return source;
  }
  if (source.length > 165) {
    return source.slice(0, 165).trim();
  }
  const expanded = cleanFallback || source;
  if (expanded.length >= 155) {
    return expanded.slice(0, 165).trim();
  }
  return source;
}

function getSiteOrigin(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
  if (envUrl) return envUrl.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

async function resolveAiAuthorId(): Promise<string> {
  const author = await Author.findOneAndUpdate(
    { slug: "ai-desk" },
    {
      $setOnInsert: {
        name: "AI Desk",
        slug: "ai-desk",
        role: "ai",
        bio: "Automated commodities and geopolitical market coverage with editorial review.",
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  )
    .select("_id")
    .lean();

  return String(author._id);
}

async function fetchJsonWithTimeout<T>(
  url: string,
  init: RequestInit,
  timeoutMs = 9000
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
    const data = (await response.json().catch(() => null)) as T | null;
    return { ok: response.ok, status: response.status, data };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchTextWithTimeout(
  url: string,
  timeoutMs = 9000
): Promise<{ ok: boolean; status: number; text: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    const text = await response.text().catch(() => "");
    return { ok: response.ok, status: response.status, text };
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractFiniteNumbers(values: Array<number | null> | undefined): number[] {
  return Array.isArray(values)
    ? values.filter((item): item is number => typeof item === "number" && Number.isFinite(item))
    : [];
}

function lastNumber(values: number[]): number | null {
  return values.length > 0 ? values[values.length - 1] : null;
}

async function fetchCommoditySnapshot(
  symbol: string,
  label: string
): Promise<CommoditySnapshot | null> {
  const endpoint = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?range=3mo&interval=1d`;
  const response = await fetchJsonWithTimeout<YahooChartPayload>(endpoint, { method: "GET" });

  if (!response.ok || !response.data?.chart?.result?.[0]) {
    return null;
  }

  const result = response.data.chart.result[0];
  const quote = result.indicators?.quote?.[0];
  const closes = extractFiniteNumbers(quote?.close);
  const highs = extractFiniteNumbers(quote?.high);
  const lows = extractFiniteNumbers(quote?.low);

  const latest = lastNumber(closes);
  const prev = closes.length > 1 ? closes[closes.length - 2] : null;
  const fallbackLatest =
    typeof result.meta?.regularMarketPrice === "number" ? result.meta.regularMarketPrice : null;
  const price = latest ?? fallbackLatest;
  if (!price || !Number.isFinite(price)) {
    return null;
  }

  const changePct =
    prev && Number.isFinite(prev) && prev !== 0 ? ((price - prev) / prev) * 100 : 0;

  const recentHighSlice = highs.length >= 20 ? highs.slice(-20) : highs;
  const recentLowSlice = lows.length >= 20 ? lows.slice(-20) : lows;
  const high20 =
    recentHighSlice.length > 0 ? Math.max(...recentHighSlice) : Math.max(...closes.slice(-20));
  const low20 =
    recentLowSlice.length > 0 ? Math.min(...recentLowSlice) : Math.min(...closes.slice(-20));

  if (!Number.isFinite(high20) || !Number.isFinite(low20)) {
    return null;
  }

  return {
    label,
    symbol,
    price,
    changePct,
    high20,
    low20,
    sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`,
  };
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function parseRssItems(xml: string, maxItems: number): NewsItem[] {
  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, maxItems);
  return blocks
    .map((match) => {
      const block = match[1] || "";
      const headline = decodeXmlEntities(
        normalizeWhitespace((block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ""))
      );
      const url = decodeXmlEntities(
        normalizeWhitespace((block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || ""))
      );
      const publishedAt = decodeXmlEntities(
        normalizeWhitespace((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || ""))
      );
      const source = decodeXmlEntities(
        normalizeWhitespace((block.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1] || ""))
      );
      return { headline, url, source, publishedAt };
    })
    .filter((item) => item.headline && item.url.startsWith("https://"));
}

async function fetchGoogleNews(query: string, limit = 5): Promise<NewsItem[]> {
  const endpoint = `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=en-US&gl=US&ceid=US:en`;
  const response = await fetchTextWithTimeout(endpoint);
  if (!response.ok || !response.text) return [];
  return parseRssItems(response.text, limit);
}

async function fetchOilInventoryInsight(): Promise<{
  summary: string;
  sourceUrl: string;
}> {
  const sourceUrl = "https://www.eia.gov/petroleum/supply/weekly/";
  const response = await fetchTextWithTimeout(sourceUrl);
  if (!response.ok || !response.text) {
    return {
      summary: "Latest EIA inventory commentary was not available at runtime.",
      sourceUrl,
    };
  }

  const text = normalizeWhitespace(
    response.text
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );

  const preferred =
    text.match(/U\.S\. commercial crude oil inventories[^.]{0,280}\./i)?.[0] ||
    text.match(/commercial crude oil inventories[^.]{0,240}\./i)?.[0] ||
    "";

  if (preferred) {
    return { summary: preferred.trim(), sourceUrl };
  }

  return {
    summary: "EIA weekly petroleum report is available, but no concise inventory line was extracted.",
    sourceUrl,
  };
}

function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (value >= 100) return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function snapshotLine(snapshot: CommoditySnapshot | null): string {
  if (!snapshot) return "- Data unavailable for this instrument.";
  return `- ${snapshot.label} (${snapshot.symbol}): ${formatPrice(snapshot.price)} (${formatPercent(
    snapshot.changePct
  )} 1d), 20-session high ${formatPrice(snapshot.high20)}, low ${formatPrice(
    snapshot.low20
  )} | ${snapshot.sourceUrl}`;
}

function buildHeadlineLines(items: NewsItem[], fallbackText: string): string[] {
  if (!items.length) return [`- ${fallbackText}`];
  return items.map(
    (item) =>
      `- ${item.headline} | source: ${item.source || "unknown"} | ${item.publishedAt || "n/a"} | ${item.url}`
  );
}

function buildContext(input: {
  clock: IndiaClock;
  wti: CommoditySnapshot | null;
  brent: CommoditySnapshot | null;
  gold: CommoditySnapshot | null;
  silver: CommoditySnapshot | null;
  inventory: { summary: string; sourceUrl: string };
  opecNews: NewsItem[];
  chinaNews: NewsItem[];
  geoNews: NewsItem[];
}): string {
  const lines: string[] = [];
  lines.push(`Snapshot timestamp: ${input.clock.label}`);
  lines.push("");
  lines.push("Energy and metals market snapshot:");
  lines.push(snapshotLine(input.wti));
  lines.push(snapshotLine(input.brent));
  lines.push(snapshotLine(input.gold));
  lines.push(snapshotLine(input.silver));
  lines.push("");
  lines.push("Oil inventory signal:");
  lines.push(`- ${input.inventory.summary} | ${input.inventory.sourceUrl}`);
  lines.push("");
  lines.push("OPEC production-related headlines:");
  lines.push(
    ...buildHeadlineLines(
      input.opecNews,
      "No reliable OPEC production headline was available at runtime."
    )
  );
  lines.push("");
  lines.push("China demand outlook headlines:");
  lines.push(
    ...buildHeadlineLines(
      input.chinaNews,
      "No reliable China demand headline was available at runtime."
    )
  );
  lines.push("");
  lines.push("Geopolitical and trade risk headlines:");
  lines.push(
    ...buildHeadlineLines(
      input.geoNews,
      "No reliable geopolitical risk headline was available at runtime."
    )
  );
  return lines.join("\n").slice(0, 11000);
}

async function runDailyCommoditiesGeopoliticalReport(req: NextRequest) {
  const session = await getServerSession(authConfig);
  const allowedByRole = canManageArticles(session);
  const allowedBySecret = isAuthorizedBySecret(req);
  if (!allowedByRole && !allowedBySecret) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const force = req.nextUrl.searchParams.get("force") === "1";
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const clock = getIndiaClock();
  if (!force && !isPublishWindow(clock)) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "Before scheduled window (7:00 PM IST onward).",
      nowIST: clock.label,
    });
  }

  await dbConnect();
  await ensureDefaultArticleCategories();

  const categoryId = await resolveCategoryIdForType("commodity");
  if (!categoryId) {
    return NextResponse.json(
      { success: false, error: "Commodities category is missing." },
      { status: 500 }
    );
  }

  const [wti, brent, gold, silver, inventory, opecNews, chinaNews, geoNews] = await Promise.all([
    fetchCommoditySnapshot("CL=F", "WTI Crude"),
    fetchCommoditySnapshot("BZ=F", "Brent Crude"),
    fetchCommoditySnapshot("GC=F", "Gold"),
    fetchCommoditySnapshot("SI=F", "Silver"),
    fetchOilInventoryInsight(),
    fetchGoogleNews("OPEC production output decision oil market Reuters", 5),
    fetchGoogleNews("China oil demand outlook commodities industrial data", 5),
    fetchGoogleNews("geopolitical tensions oil supply trade sanctions shipping", 5),
  ]);

  const context = buildContext({
    clock,
    wti,
    brent,
    gold,
    silver,
    inventory,
    opecNews,
    chinaNews,
    geoNews,
  });

  const seoDateSlug = clock.dateKey;
  const titleSeed = buildDailyTitle(clock);
  const siteOrigin = getSiteOrigin(req);
  const generateUrl = `${siteOrigin}/api/articles/generate`;
  const automationSecret = getAutomationSecret();
  const requestCookie = req.headers.get("cookie") || "";

  const generateResponse = await fetch(generateUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(automationSecret ? { "x-cron-secret": automationSecret } : {}),
      ...(requestCookie ? { cookie: requestCookie } : {}),
    },
    body: JSON.stringify({
      title: titleSeed,
      type: "commodity",
      provider: "auto",
      mode: "daily_commodities_geopolitical_report",
      context,
    }),
    cache: "no-store",
  });

  const generated = (await generateResponse.json().catch(() => ({}))) as GeneratePayload;
  if (!generateResponse.ok || !generated.success || !generated.data) {
    return NextResponse.json(
      {
        success: false,
        error: generated.error || "Failed to generate commodities geopolitical report.",
      },
      { status: 502 }
    );
  }

  const generatedTitle = (generated.data.title || titleSeed).trim();
  const generatedSlugSeed = (generated.data.slug || generatedTitle).trim();
  const dailySlug = buildDailySlug(generatedSlugSeed, seoDateSlug);

  const existing = await Article.findOne({ slug: dailySlug }).select("_id title slug").lean();
  if (existing?._id) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "Daily commodities report already exists for this date.",
      article: {
        id: String(existing._id),
        title: existing.title,
        slug: existing.slug,
      },
      nowIST: clock.label,
    });
  }

  const content = sanitizeRichHtml(generated.data.content || "");
  if (!content.trim()) {
    return NextResponse.json(
      { success: false, error: "Generated content is empty after sanitization." },
      { status: 502 }
    );
  }

  const excerptSource = (generated.data.excerpt || "").trim();
  const excerpt = excerptSource || stripHtml(content).slice(0, 240);
  const tags = normalizeTags(generated.data.tags);
  const metaTitle = (generated.data.seo?.metaTitle || generatedTitle).trim().slice(0, 70);
  const metaDescription = normalizeMetaDescription(
    generated.data.seo?.metaDescription || "",
    excerpt || stripHtml(content)
  );
  const image = typeof generated.data.image === "string" ? generated.data.image : "";

  if (dryRun) {
    return NextResponse.json({
      success: true,
      dryRun: true,
      nowIST: clock.label,
      article: {
        title: generatedTitle,
        slug: dailySlug,
        excerpt,
        image,
        tags,
        metaTitle,
        metaDescription,
      },
      contextPreview: context.split("\n").slice(0, 24),
    });
  }

  const authorId = await resolveAiAuthorId();
  const article = await Article.create({
    title: generatedTitle,
    slug: dailySlug,
    excerpt,
    content,
    category: categoryId,
    tags,
    type: "commodity",
    image,
    author: authorId,
    seo: {
      metaTitle,
      metaDescription,
      keywords: tags,
    },
    status: "published",
    aiGenerated: true,
    publishedAt: new Date(),
  });

  await logArticleEvent({
    articleId: String(article._id),
    action: "created",
    session: null,
    toStatus: "published",
    note: "Daily commodities report created by scheduler",
    metadata: {
      automation: "daily_commodities_geopolitical_report",
      dateKey: clock.dateKey,
      provider: generated.data.provider || "unknown",
    },
  });

  await logArticleEvent({
    articleId: String(article._id),
    action: "published",
    session: null,
    fromStatus: "review",
    toStatus: "published",
    note: "Daily commodities report published automatically",
    metadata: {
      automation: "daily_commodities_geopolitical_report",
    },
  });

  return NextResponse.json({
    success: true,
    created: true,
    nowIST: clock.label,
    article: {
      id: String(article._id),
      title: article.title,
      slug: article.slug,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    return await runDailyCommoditiesGeopoliticalReport(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run scheduler";
    console.error("Daily commodities/geopolitical cron failed:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await runDailyCommoditiesGeopoliticalReport(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run scheduler";
    console.error("Daily commodities/geopolitical cron failed:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
