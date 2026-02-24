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

interface EasternClock {
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

function getEasternClock(referenceDate = new Date()): EasternClock {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
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
  const label = `${dateKey} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ET`;

  return { weekday, year, month, day, hour, minute, dateKey, label };
}

function isMarketCloseWindow(clock: EasternClock): boolean {
  const tradingDays = new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  if (!tradingDays.has(clock.weekday)) {
    return false;
  }
  if (clock.hour > 16) {
    return true;
  }
  return clock.hour === 16 && clock.minute >= 15;
}

function buildDailyTitle(clock: EasternClock): string {
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${clock.dateKey}T18:00:00Z`));
  return `Global Markets Today: Federal Reserve Outlook, Yields and Equities - ${dateLabel}`;
}

function buildDailySlug(seedSlug: string, dateKey: string): string {
  const base = toSlug(seedSlug || "global-markets-overview") || "global-markets-overview";
  const shortBase = base.slice(0, 72).replace(/-+$/g, "");
  if (shortBase.endsWith(dateKey)) {
    return shortBase;
  }
  return `${shortBase}-${dateKey}`;
}

function normalizeTags(tags: string[] | undefined): string[] {
  const base = Array.isArray(tags) ? tags : [];
  const merged = [...base, "Global Markets", "Daily Market Overview", "Market Wrap"];
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
        bio: "Automated market coverage with editorial review.",
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

async function runDailyGlobalOverview(req: NextRequest) {
  const session = await getServerSession(authConfig);
  const allowedByRole = canManageArticles(session);
  const allowedBySecret = isAuthorizedBySecret(req);
  if (!allowedByRole && !allowedBySecret) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const force = req.nextUrl.searchParams.get("force") === "1";
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const clock = getEasternClock();
  if (!force && !isMarketCloseWindow(clock)) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "Before US market close window (after 4:15 PM ET, weekdays only).",
      nowET: clock.label,
    });
  }

  await dbConnect();
  await ensureDefaultArticleCategories();

  const categoryId = await resolveCategoryIdForType("global");
  if (!categoryId) {
    return NextResponse.json(
      { success: false, error: "Global Markets category is missing." },
      { status: 500 }
    );
  }

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
      type: "global",
      provider: "auto",
      mode: "daily_market_overview",
    }),
    cache: "no-store",
  });

  const generated = (await generateResponse.json().catch(() => ({}))) as GeneratePayload;
  if (!generateResponse.ok || !generated.success || !generated.data) {
    return NextResponse.json(
      {
        success: false,
        error: generated.error || "Failed to generate daily global overview.",
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
      reason: "Daily article already exists for this date.",
      article: {
        id: String(existing._id),
        title: existing.title,
        slug: existing.slug,
      },
      nowET: clock.label,
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
      nowET: clock.label,
      article: {
        title: generatedTitle,
        slug: dailySlug,
        excerpt,
        image,
        tags,
        metaTitle,
        metaDescription,
      },
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
    type: "global",
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
    note: "Daily global overview created by scheduler",
    metadata: {
      automation: "daily_global_overview",
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
    note: "Daily global overview published automatically",
    metadata: {
      automation: "daily_global_overview",
    },
  });

  return NextResponse.json({
    success: true,
    created: true,
    nowET: clock.label,
    article: {
      id: String(article._id),
      title: article.title,
      slug: article.slug,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    return await runDailyGlobalOverview(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run scheduler";
    console.error("Daily global overview cron failed:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await runDailyGlobalOverview(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run scheduler";
    console.error("Daily global overview cron failed:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
