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

interface CoinGeckoMarketRow {
  id?: string;
  symbol?: string;
  name?: string;
  current_price?: number;
  price_change_percentage_24h?: number;
  market_cap_rank?: number;
}

interface CryptoMover {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCapRank: number | null;
  link: string;
}

interface CryptoNewsItem {
  headline: string;
  source: string;
  url: string;
  datetime: string;
}

function getAutomationSecret(): string {
  return process.env.CRON_SECRET || process.env.AI_AUTOMATION_SECRET || "";
}

function isAuthorizedBySecret(req: NextRequest): boolean {
  const secret = getAutomationSecret();
  if (!secret) {
    return false;
  }

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
  if (clock.hour > 12) return true;
  return clock.hour === 12;
}

function buildDailyTitle(clock: IndiaClock): string {
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${clock.dateKey}T06:30:00Z`));

  return `Crypto and Digital Assets Update: Bitcoin, Ethereum and Market Movers - ${dateLabel}`;
}

function buildDailySlug(seedSlug: string, dateKey: string): string {
  const base = toSlug(seedSlug || "crypto-digital-assets-update") || "crypto-digital-assets-update";
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
    "Crypto Update",
    "Digital Assets",
    "Bitcoin",
    "Ethereum",
    "Top Gainers",
    "Top Losers",
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
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
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
        bio: "Automated crypto market coverage with editorial review.",
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

function isStablecoinSymbol(symbol: string): boolean {
  const stable = new Set([
    "USDT",
    "USDC",
    "DAI",
    "BUSD",
    "TUSD",
    "USDE",
    "FDUSD",
    "USDD",
    "PYUSD",
    "EURC",
  ]);
  return stable.has(symbol.toUpperCase());
}

function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return value.toLocaleString("en-US", { maximumFractionDigits: 8 });
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

async function fetchCryptoMovers(): Promise<{
  btc: CryptoMover | null;
  eth: CryptoMover | null;
  gainers: CryptoMover[];
  losers: CryptoMover[];
  sourceUrl: string;
  warning?: string;
}> {
  const endpoint =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=150&page=1&sparkline=false&price_change_percentage=24h";

  const response = await fetchJsonWithTimeout<CoinGeckoMarketRow[]>(endpoint, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok || !Array.isArray(response.data)) {
    return {
      btc: null,
      eth: null,
      gainers: [],
      losers: [],
      sourceUrl: "https://www.coingecko.com/",
      warning: "CoinGecko market data unavailable for this run.",
    };
  }

  const movers: CryptoMover[] = response.data
    .map((row) => {
      const symbol = typeof row.symbol === "string" ? row.symbol.toUpperCase() : "";
      const name = typeof row.name === "string" ? row.name : symbol;
      const price = typeof row.current_price === "number" ? row.current_price : Number.NaN;
      const change24h =
        typeof row.price_change_percentage_24h === "number"
          ? row.price_change_percentage_24h
          : Number.NaN;
      const marketCapRank =
        typeof row.market_cap_rank === "number" ? row.market_cap_rank : null;

      const id = typeof row.id === "string" ? row.id : "";
      const link = id ? `https://www.coingecko.com/en/coins/${id}` : "https://www.coingecko.com/";

      return { symbol, name, price, change24h, marketCapRank, link };
    })
    .filter(
      (item) =>
        item.symbol &&
        item.name &&
        Number.isFinite(item.price) &&
        Number.isFinite(item.change24h)
    );

  const filtered = movers.filter((item) => !isStablecoinSymbol(item.symbol));
  const gainers = [...filtered].sort((a, b) => b.change24h - a.change24h).slice(0, 5);
  const losers = [...filtered].sort((a, b) => a.change24h - b.change24h).slice(0, 5);

  const btc = filtered.find((item) => item.symbol === "BTC") || null;
  const eth = filtered.find((item) => item.symbol === "ETH") || null;

  return {
    btc,
    eth,
    gainers,
    losers,
    sourceUrl: "https://www.coingecko.com/",
  };
}

function toDateLabel(input: Date): string {
  return input.toISOString();
}

async function fetchFinnhubCryptoNews(apiKey: string): Promise<CryptoNewsItem[]> {
  if (!apiKey) return [];

  const endpoint = `https://finnhub.io/api/v1/news?category=crypto&token=${encodeURIComponent(apiKey)}`;
  const response = await fetchJsonWithTimeout<
    Array<{ headline?: string; source?: string; url?: string; datetime?: number }>
  >(endpoint, { method: "GET" });

  if (!response.ok || !Array.isArray(response.data)) {
    return [];
  }

  return response.data
    .map((item) => {
      const headline = typeof item.headline === "string" ? item.headline.trim() : "";
      const source = typeof item.source === "string" ? item.source.trim() : "";
      const url = typeof item.url === "string" ? item.url.trim() : "";
      const datetime =
        typeof item.datetime === "number" && item.datetime > 0
          ? toDateLabel(new Date(item.datetime * 1000))
          : "";
      return { headline, source, url, datetime };
    })
    .filter((item) => item.headline && item.url.startsWith("https://"))
    .slice(0, 8);
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchCoinDeskRssNews(): Promise<CryptoNewsItem[]> {
  const endpoint = "https://www.coindesk.com/arc/outboundfeeds/rss/";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return [];
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 8);

    return items
      .map((match) => {
        const block = match[1] || "";
        const headline = decodeXmlEntities(
          (block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "").trim()
        );
        const url = decodeXmlEntities(
          (block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "").trim()
        );
        const datetime = decodeXmlEntities(
          (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || "").trim()
        );
        return {
          headline,
          source: "CoinDesk",
          url,
          datetime,
        };
      })
      .filter((item) => item.headline && item.url.startsWith("https://"));
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchLatestCryptoNews(): Promise<{
  items: CryptoNewsItem[];
  source: string;
}> {
  const finnhubKey = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_KEY || "";
  const finnhubNews = await fetchFinnhubCryptoNews(finnhubKey);
  if (finnhubNews.length > 0) {
    return { items: finnhubNews, source: "finnhub" };
  }

  const rssNews = await fetchCoinDeskRssNews();
  if (rssNews.length > 0) {
    return { items: rssNews, source: "coindesk-rss" };
  }

  return { items: [], source: "none" };
}

function buildCryptoContext(input: {
  clock: IndiaClock;
  movers: Awaited<ReturnType<typeof fetchCryptoMovers>>;
  newsItems: CryptoNewsItem[];
  newsSource: string;
}): string {
  const lines: string[] = [];
  lines.push(`Data snapshot generated at: ${input.clock.label}`);
  lines.push(`Market data source: ${input.movers.sourceUrl}`);
  lines.push(`News source: ${input.newsSource}`);
  lines.push("");

  lines.push("BTC and ETH snapshot:");
  if (input.movers.btc) {
    lines.push(
      `- BTC: $${formatPrice(input.movers.btc.price)} (${formatPercent(input.movers.btc.change24h)} 24h) | ${input.movers.btc.link}`
    );
  } else {
    lines.push("- BTC: data unavailable");
  }

  if (input.movers.eth) {
    lines.push(
      `- ETH: $${formatPrice(input.movers.eth.price)} (${formatPercent(input.movers.eth.change24h)} 24h) | ${input.movers.eth.link}`
    );
  } else {
    lines.push("- ETH: data unavailable");
  }

  lines.push("");
  lines.push("Top gainers (24h):");
  if (input.movers.gainers.length > 0) {
    for (const item of input.movers.gainers) {
      lines.push(
        `- ${item.symbol} (${item.name}): ${formatPercent(item.change24h)}, price $${formatPrice(item.price)} | ${item.link}`
      );
    }
  } else {
    lines.push("- no reliable gainers data available");
  }

  lines.push("");
  lines.push("Top losers (24h):");
  if (input.movers.losers.length > 0) {
    for (const item of input.movers.losers) {
      lines.push(
        `- ${item.symbol} (${item.name}): ${formatPercent(item.change24h)}, price $${formatPrice(item.price)} | ${item.link}`
      );
    }
  } else {
    lines.push("- no reliable losers data available");
  }

  lines.push("");
  lines.push("Latest crypto headlines:");
  if (input.newsItems.length > 0) {
    for (const item of input.newsItems.slice(0, 8)) {
      lines.push(
        `- ${item.headline} | source: ${item.source || "unknown"} | time: ${item.datetime || "n/a"} | ${item.url}`
      );
    }
  } else {
    lines.push("- no reliable news headlines available");
  }

  if (input.movers.warning) {
    lines.push("");
    lines.push(`Warning: ${input.movers.warning}`);
  }

  return lines.join("\n").slice(0, 11000);
}

async function runDailyCryptoUpdate(req: NextRequest) {
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
      reason: "Before scheduled window (12:00 PM IST onward).",
      nowIST: clock.label,
    });
  }

  await dbConnect();
  await ensureDefaultArticleCategories();

  const categoryId = await resolveCategoryIdForType("crypto");
  if (!categoryId) {
    return NextResponse.json(
      { success: false, error: "Crypto category is missing." },
      { status: 500 }
    );
  }

  const seoDateSlug = clock.dateKey;
  const titleSeed = buildDailyTitle(clock);
  const movers = await fetchCryptoMovers();
  const news = await fetchLatestCryptoNews();
  const context = buildCryptoContext({
    clock,
    movers,
    newsItems: news.items,
    newsSource: news.source,
  });

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
      type: "crypto",
      provider: "auto",
      mode: "daily_crypto_update",
      context,
    }),
    cache: "no-store",
  });

  const generated = (await generateResponse.json().catch(() => ({}))) as GeneratePayload;
  if (!generateResponse.ok || !generated.success || !generated.data) {
    return NextResponse.json(
      {
        success: false,
        error: generated.error || "Failed to generate daily crypto update.",
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
      reason: "Daily crypto article already exists for this date.",
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
      contextPreview: context.split("\n").slice(0, 20),
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
    type: "crypto",
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
    note: "Daily crypto update created by scheduler",
    metadata: {
      automation: "daily_crypto_update",
      dateKey: clock.dateKey,
      provider: generated.data.provider || "unknown",
      newsSource: news.source,
    },
  });

  await logArticleEvent({
    articleId: String(article._id),
    action: "published",
    session: null,
    fromStatus: "review",
    toStatus: "published",
    note: "Daily crypto update published automatically",
    metadata: {
      automation: "daily_crypto_update",
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
    return await runDailyCryptoUpdate(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run scheduler";
    console.error("Daily crypto update cron failed:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await runDailyCryptoUpdate(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run scheduler";
    console.error("Daily crypto update cron failed:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
