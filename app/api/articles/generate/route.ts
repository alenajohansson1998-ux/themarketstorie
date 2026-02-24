import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { isArticleType, ArticleType } from "@/lib/articles/constants";
import { getArticlePrompt } from "@/lib/articles/prompts";
import { canManageArticles } from "@/lib/articles/workflow";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";
import { toSlug } from "@/lib/articles/slug";

type AIProvider = "auto" | "openai" | "gemini";
type GenerateMode =
  | "default"
  | "daily_market_overview"
  | "daily_crypto_update"
  | "daily_commodities_geopolitical_report";

interface GenerateRequestBody {
  title?: string;
  type?: string;
  provider?: AIProvider;
  mode?: GenerateMode | string;
  context?: string;
}

interface GeneratedArticleDraft {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  imageQuery: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

interface GeminiModelEntry {
  name?: string;
  supportedGenerationMethods?: string[];
}

interface GeminiModelListPayload {
  models?: GeminiModelEntry[];
}

interface GeminiGeneratePayload {
  error?: { message?: string };
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

interface UnsplashSearchPayload {
  results?: Array<{
    urls?: {
      regular?: string;
      full?: string;
    };
  }>;
}

interface PexelsSearchPayload {
  photos?: Array<{
    src?: {
      original?: string;
      large2x?: string;
      large?: string;
      landscape?: string;
    };
  }>;
}

const TYPE_IMAGE_HINTS: Record<ArticleType, string> = {
  global: "global stock market trading floor finance",
  crypto: "bitcoin ethereum crypto market charts",
  commodity: "oil gold commodities market",
  business: "corporate deal business finance meeting",
  geopolitical: "geopolitics world economy global trade",
};

const DEFAULT_TYPE_IMAGES: Record<ArticleType, string> = {
  global:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80",
  crypto:
    "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1600&q=80",
  commodity:
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1600&q=80",
  business:
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=80",
  geopolitical:
    "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=80",
};

function parseGenerateMode(value: unknown): GenerateMode {
  if (value === "daily_market_overview") return "daily_market_overview";
  if (value === "daily_crypto_update") return "daily_crypto_update";
  if (value === "daily_commodities_geopolitical_report") {
    return "daily_commodities_geopolitical_report";
  }
  return "default";
}

function isCronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.AI_AUTOMATION_SECRET || "";
  if (!secret) {
    return false;
  }

  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const cronHeader = req.headers.get("x-cron-secret") || "";
  return bearer === secret || cronHeader === secret;
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  return [];
}

function isHttpsUrl(value: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeImageQuery(input: string): string {
  return input
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function buildImageQuery(input: {
  title: string;
  type: ArticleType;
  tags: string[];
  imageQuery?: string;
}): string {
  const userQuery = normalizeImageQuery(input.imageQuery || "");
  if (userQuery) return userQuery;

  const safeTitle = normalizeImageQuery(input.title);
  const tagHint = input.tags.slice(0, 3).join(" ");
  const combined = `${safeTitle} ${tagHint} ${TYPE_IMAGE_HINTS[input.type]}`;
  return normalizeImageQuery(combined) || TYPE_IMAGE_HINTS[input.type];
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
    });
    const data = (await response.json().catch(() => null)) as T | null;
    return { ok: response.ok, status: response.status, data };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchUnsplashImage(query: string, accessKey: string): Promise<string | null> {
  const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&orientation=landscape&per_page=1&content_filter=high`;

  const response = await fetchJsonWithTimeout<UnsplashSearchPayload>(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Client-ID ${accessKey}`,
    },
  });

  if (!response.ok) return null;

  const candidate =
    response.data?.results?.[0]?.urls?.regular || response.data?.results?.[0]?.urls?.full || "";

  return isHttpsUrl(candidate) ? candidate : null;
}

async function fetchPexelsImage(query: string, apiKey: string): Promise<string | null> {
  const endpoint = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query
  )}&orientation=landscape&per_page=1`;

  const response = await fetchJsonWithTimeout<PexelsSearchPayload>(endpoint, {
    method: "GET",
    headers: {
      Authorization: apiKey,
    },
  });

  if (!response.ok) return null;

  const src = response.data?.photos?.[0]?.src;
  const candidate = src?.landscape || src?.large2x || src?.large || src?.original || "";
  return isHttpsUrl(candidate) ? candidate : null;
}

async function resolveCoverImage(input: {
  title: string;
  type: ArticleType;
  tags: string[];
  imageQuery?: string;
}): Promise<{ image: string; source: string; query: string }> {
  const query = buildImageQuery(input);
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY || "";
  const pexelsKey = process.env.PEXELS_API_KEY || "";

  if (unsplashKey) {
    try {
      const image = await fetchUnsplashImage(query, unsplashKey);
      if (image) {
        return { image, source: "unsplash", query };
      }
    } catch {
      // ignore provider errors and continue to fallback chain
    }
  }

  if (pexelsKey) {
    try {
      const image = await fetchPexelsImage(query, pexelsKey);
      if (image) {
        return { image, source: "pexels", query };
      }
    } catch {
      // ignore provider errors and continue to fallback chain
    }
  }

  return {
    image: DEFAULT_TYPE_IMAGES[input.type] || "/herobaner.png",
    source: "fallback",
    query,
  };
}

function extractJsonObject(raw: string): Record<string, unknown> {
  let value = raw.trim();
  if (!value) {
    throw new Error("AI returned empty response");
  }

  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    value = fenced[1].trim();
  }

  if (!value.startsWith("{")) {
    const start = value.indexOf("{");
    const end = value.lastIndexOf("}");
    if (start >= 0 && end > start) {
      value = value.slice(start, end + 1);
    }
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid JSON object");
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `AI response was not valid JSON: ${error instanceof Error ? error.message : "parse failed"}`
    );
  }
}

function normalizeGeneratedDraft(
  rawObject: Record<string, unknown>,
  fallbackTitle: string
): GeneratedArticleDraft {
  const seoObject =
    rawObject.seo && typeof rawObject.seo === "object" && !Array.isArray(rawObject.seo)
      ? (rawObject.seo as Record<string, unknown>)
      : {};

  const title = getString(rawObject.title) || fallbackTitle;
  const slug = toSlug(getString(rawObject.slug) || title);
  const htmlInput = getString(rawObject.contentHtml) || getString(rawObject.content);
  const content = sanitizeRichHtml(htmlInput);
  if (!content.trim()) {
    throw new Error("AI did not return usable article content");
  }

  const excerptInput = getString(rawObject.excerpt);
  const excerpt = excerptInput
    ? stripHtml(sanitizeRichHtml(excerptInput))
    : stripHtml(content).slice(0, 220);

  const tags = getStringArray(rawObject.tags);
  const imageQuery = getString(rawObject.imageQuery) || title;
  const metaTitle =
    getString(rawObject.metaTitle) ||
    getString(seoObject.metaTitle) ||
    title.slice(0, 65);
  const metaDescription =
    getString(rawObject.metaDescription) ||
    getString(seoObject.metaDescription) ||
    excerpt.slice(0, 160);

  return {
    title,
    slug,
    excerpt,
    content,
    tags,
    imageQuery,
    seo: {
      metaTitle,
      metaDescription,
    },
  };
}

function buildDefaultPrompt(title: string, type: ArticleType): string {
  const basePrompt = getArticlePrompt(type);
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return `${basePrompt}

Specific topic title: "${title}"
Date context: ${today}

Return ONLY valid JSON (no markdown, no code block) with this exact shape:
{
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "contentHtml": "string",
  "imageQuery": "string",
  "tags": ["string", "string", "string"],
  "metaTitle": "string",
  "metaDescription": "string"
}

Output rules:
- Keep the title market-news professional.
- Provide slug as short SEO-friendly lowercase URL slug with hyphens only.
- Provide imageQuery as 3 to 8 concise keywords suitable for finding a finance-related cover image.
- contentHtml must be full rich HTML using headings and paragraphs:
  - Use one <h1> and multiple <h2> sections.
  - Use <p> for body text.
  - Optional <ul><li> where useful.
- Include 3 to 6 natural in-text references using <a href="https://..."> anchors from trusted sources only.
- End contentHtml with: <h2>Sources & References</h2> followed by a <ul> of the referenced links.
- Use only real, publicly reachable HTTPS URLs. Never fabricate links.
- Do not include script/style/iframe.
- Avoid generic AI disclaimers.
- Keep excerpt between 25 and 45 words.
- Keep metaTitle under 65 chars and metaDescription under 160 chars.`;
}

function buildDailyMarketOverviewPrompt(title: string): string {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return `Write a detailed global markets news article based on the latest available financial data.

Primary article context date: ${today}
Working title seed: "${title}"

Requirements:
- Use a professional financial newsroom style.
- Avoid repetition.
- Avoid generic statements.
- Use real index names.
- Do not include disclaimers.
- Do not use emojis.
- Include natural in-text reference links from trusted sources (official institutions, exchanges, central banks, regulators, major financial publications).
- Do not fabricate links.

Write the article with this structure:
Introduction:
- 2 to 3 paragraphs summarizing global market sentiment (risk-on or risk-off), bond yield movements, dollar strength, and major equity reactions.

H2: US Markets Overview
- Analyze S&P 500, Nasdaq, Dow Jones performance.
- Discuss Treasury yields (especially 10-year).
- Explain Federal Reserve rate cut expectations.
- Mention sector performance and major stock movers.

H2: European Markets Reaction
- Cover DAX, FTSE 100, CAC 40.
- Mention ECB commentary if relevant.
- Discuss Euro vs Dollar movement.
- Explain how US bond yields impacted European equities.

H2: Asian Markets Performance
- Analyze Nikkei 225, Shanghai Composite, Hang Seng.
- Mention Bank of Japan policy outlook.
- Discuss China stimulus or economic data.
- Explain spillover effects from Wall Street.

H2: Emerging Markets & Global Risk Sentiment
- Discuss Nifty 50 and emerging market currencies.
- Explain capital flows.
- Mention oil and gold movement impact on equities.

H2: Bond Market & Dollar Analysis
- Compare US yields with German and Japanese yields.
- Explain Dollar Index movement.
- Discuss implications for global liquidity.

H2: Commodities & Safe Haven Assets
- Analyze oil prices (Brent & WTI).
- Discuss gold and silver movement.
- Explain geopolitical factors influencing prices.

Conclusion:
- Summarize overall global outlook.
- Explain what investors are watching next (inflation data, central bank speeches, economic indicators).

Include a final section:
H2: Sources & References
- Provide a bullet list of the same references used naturally in the article body.

Return ONLY valid JSON (no markdown, no code block) with this exact shape:
{
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "contentHtml": "string",
  "imageQuery": "string",
  "tags": ["string", "string", "string", "string"],
  "metaTitle": "string",
  "metaDescription": "string"
}

Output rules:
- Title must be strong and SEO-friendly about Federal Reserve rate expectations, Treasury yields movement, and global equity performance.
- metaDescription must be 155 to 165 characters.
- slug must be short, lowercase, and hyphen-separated.
- contentHtml must include headings, paragraphs, and natural anchor links.
- Use only publicly reachable HTTPS URLs.`;
}

function buildDailyCryptoUpdatePrompt(title: string, context: string): string {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return `Write a detailed Crypto & Digital Assets Update article using the provided latest market data.

Primary article context date: ${today}
Working title seed: "${title}"

Focus:
- BTC and ETH price action
- ETF inflows and outflows (if available in provided context/news)
- Whale activity signals (if available in provided context/news)
- Regulation headlines
- Global crypto risk sentiment

Verified data snapshot (highest priority facts and links):
${context || "No structured snapshot provided. Use only broadly verifiable facts and avoid specific unsupported numbers."}

Write the article with this structure:
Introduction:
- 2 to 3 paragraphs summarizing broad crypto sentiment, BTC/ETH direction, and risk appetite.

H2: Bitcoin and Ethereum Price Action
- Explain current momentum, volatility, and key support/resistance narrative.

H2: Top Crypto Gainers and Top Losers (24h)
- Include a clear breakdown of top gainers and top losers from the provided snapshot.
- Mention percentage moves and notable drivers when possible.

H2: ETF Flows and Institutional Positioning
- Cover spot ETF flow direction if present in the provided context/news.
- Explain institutional risk positioning.

H2: Whale Activity and On-Chain Signals
- Highlight large-wallet flow narrative only if supported by provided context/news.

H2: Regulation and Policy Headlines
- Summarize the most relevant regulatory developments from the provided news list.

H2: Risk Sentiment and What Traders Watch Next
- Explain catalysts to monitor over the next 24 to 72 hours.

Conclusion:
- Summarize cross-asset crypto outlook and immediate watchpoints.

Include a final section:
H2: Sources & References
- Provide a bullet list of the same links used naturally in the article.

Return ONLY valid JSON (no markdown, no code block) with this exact shape:
{
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "contentHtml": "string",
  "imageQuery": "string",
  "tags": ["string", "string", "string", "string"],
  "metaTitle": "string",
  "metaDescription": "string"
}

Output rules:
- Create an SEO-friendly title around crypto market momentum and risk sentiment.
- Ensure metaDescription is 155 to 165 characters.
- slug must be short, lowercase, and hyphen-separated.
- Use real coin tickers (BTC, ETH, etc.) and natural anchor links.
- Use only publicly reachable HTTPS links.
- Do not fabricate links or unsupported numeric claims.`;
}

function buildDailyCommoditiesGeopoliticalPrompt(title: string, context: string): string {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return `Write a detailed Commodities & Geopolitical Risk Report using the provided latest data snapshot.

Primary article context date: ${today}
Working title seed: "${title}"

Title direction:
"Commodities Weekly Report: Oil Supply Risks, Gold Volatility, and Global Trade Tensions"

Required focus:
- Oil inventory data
- OPEC production updates
- Gold technical levels
- China demand outlook
- Major geopolitical developments

Verified data snapshot (highest priority facts and links):
${context || "No structured snapshot provided. Use only broadly verifiable facts and avoid unsupported specific numbers."}

Write the article with this structure:
Introduction:
- 2 to 3 paragraphs summarizing commodity risk sentiment, oil and gold direction, and key macro/geopolitical drivers.

H2: Oil Market and Inventory Data
- Explain latest inventory trend and implications for supply-demand balance.
- Include OPEC production narrative and policy signals.

H2: Gold Volatility and Technical Levels
- Discuss gold momentum, key support/resistance style levels, and macro sensitivity.
- Mention real-yield and dollar context when relevant.

H2: China Demand Outlook and Industrial Signals
- Cover China demand indicators relevant to energy and metals.
- Explain how China demand outlook affects global commodity pricing.

H2: Geopolitical Risk and Trade Tensions
- Summarize major geopolitical developments and shipping/sanctions/trade implications.
- Explain transmission into oil, metals, and risk assets.

H2: Cross-Asset Implications for Investors
- Connect commodities moves with equities, currencies, and bonds.
- Highlight what traders/investors should monitor next.

Conclusion:
- Concise outlook for next sessions and critical catalysts.

Include a final section:
H2: Sources & References
- Provide a bullet list of the same references used naturally in the article body.

Return ONLY valid JSON (no markdown, no code block) with this exact shape:
{
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "contentHtml": "string",
  "imageQuery": "string",
  "tags": ["string", "string", "string", "string"],
  "metaTitle": "string",
  "metaDescription": "string"
}

Output rules:
- Use a strong SEO-friendly title for commodities and geopolitical risk.
- metaDescription must be 155 to 165 characters.
- slug must be short, lowercase, and hyphen-separated.
- contentHtml must include natural anchor links to trusted sources.
- Use only publicly reachable HTTPS URLs.
- Do not fabricate links or unsupported numeric claims.`;
}

function buildPrompt(input: {
  title: string;
  type: ArticleType;
  mode: GenerateMode;
  context: string;
}): string {
  if (input.mode === "daily_market_overview") {
    return buildDailyMarketOverviewPrompt(input.title);
  }
  if (input.mode === "daily_crypto_update") {
    return buildDailyCryptoUpdatePrompt(input.title, input.context);
  }
  if (input.mode === "daily_commodities_geopolitical_report") {
    return buildDailyCommoditiesGeopoliticalPrompt(input.title, input.context);
  }
  return buildDefaultPrompt(input.title, input.type);
}

async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert financial newsroom assistant. Return strict JSON only, without markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        error?: { message?: string };
        choices?: Array<{ message?: { content?: string } }>;
      }
    | null;

  if (!response.ok) {
    const message = payload?.error?.message || `OpenAI HTTP ${response.status}`;
    throw new Error(message);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenAI returned no content");
  }

  return content;
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const normalizeModel = (value: string): string =>
    value.replace(/^models\//, "").trim();

  const configuredModel = normalizeModel(process.env.GEMINI_MODEL || "gemini-2.0-flash");
  const configuredFallbacks = (process.env.GEMINI_MODEL_FALLBACKS || "")
    .split(",")
    .map((item) => normalizeModel(item))
    .filter(Boolean);

  const staticFallbacks = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
  ];

  const versionCandidates = ["v1beta", "v1"] as const;

  async function fetchAvailableModels(): Promise<string[]> {
    for (const version of versionCandidates) {
      const endpoint = `https://generativelanguage.googleapis.com/${version}/models?key=${encodeURIComponent(
        apiKey
      )}`;
      const res = await fetch(endpoint, { method: "GET" });
      if (!res.ok) continue;

      const payload = (await res.json().catch(() => null)) as GeminiModelListPayload | null;
      const models = (payload?.models || [])
        .filter((item) => Array.isArray(item.supportedGenerationMethods))
        .filter((item) => item.supportedGenerationMethods?.includes("generateContent"))
        .map((item) => normalizeModel(item.name || ""))
        .filter(Boolean);

      if (models.length > 0) {
        return models;
      }
    }
    return [];
  }

  const availableModels = await fetchAvailableModels();
  const modelCandidates = Array.from(
    new Set([
      configuredModel,
      ...configuredFallbacks,
      ...staticFallbacks,
      ...availableModels,
    ].filter(Boolean))
  );

  const attemptErrors: string[] = [];

  for (const model of modelCandidates) {
    for (const version of versionCandidates) {
      const endpoint = `https://generativelanguage.googleapis.com/${version}/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            responseMimeType: "application/json",
          },
        }),
      });

      const payload = (await response.json().catch(() => null)) as GeminiGeneratePayload | null;

      if (!response.ok) {
        const message = payload?.error?.message || `HTTP ${response.status}`;
        attemptErrors.push(`${model} (${version}): ${message}`);
        continue;
      }

      const textParts = payload?.candidates?.[0]?.content?.parts
        ?.map((part) => (typeof part.text === "string" ? part.text : ""))
        .filter(Boolean);
      const content = textParts?.join("\n").trim();
      if (!content) {
        attemptErrors.push(`${model} (${version}): empty content`);
        continue;
      }

      return content;
    }
  }

  throw new Error(
    attemptErrors.length > 0
      ? `All Gemini model attempts failed. ${attemptErrors.slice(0, 6).join(" | ")}`
      : "Gemini returned no usable response"
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    const allowedByRole = canManageArticles(session);
    const allowedBySecret = isCronAuthorized(req);
    if (!allowedByRole && !allowedBySecret) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as GenerateRequestBody;
    const title = getString(body.title);
    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const type: ArticleType = isArticleType(body.type) ? body.type : "global";
    const provider: AIProvider =
      body.provider === "openai" || body.provider === "gemini" ? body.provider : "auto";
    const mode = parseGenerateMode(body.mode);
    const context = getString(body.context).slice(0, 12000);

    const openAiKey = process.env.OPENAI_API_KEY || "";
    const geminiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      "";

    const prompt = buildPrompt({ title, type, mode, context });
    const errors: string[] = [];
    let providerUsed: "openai" | "gemini" | null = null;
    let rawResponse = "";

    const wantsOpenAI = provider === "auto" || provider === "openai";
    const wantsGemini = provider === "auto" || provider === "gemini";

    if (wantsOpenAI && !providerUsed) {
      if (!openAiKey) {
        errors.push("OPENAI_API_KEY is not configured");
      } else {
        try {
          rawResponse = await callOpenAI(prompt, openAiKey);
          providerUsed = "openai";
        } catch (error) {
          const message = error instanceof Error ? error.message : "OpenAI failed";
          errors.push(`OpenAI: ${message}`);
        }
      }
    }

    if (wantsGemini && !providerUsed) {
      if (!geminiKey) {
        errors.push("GEMINI_API_KEY is not configured");
      } else {
        try {
          rawResponse = await callGemini(prompt, geminiKey);
          providerUsed = "gemini";
        } catch (error) {
          const message = error instanceof Error ? error.message : "Gemini failed";
          errors.push(`Gemini: ${message}`);
        }
      }
    }

    if (!providerUsed) {
      return NextResponse.json(
        {
          success: false,
          error: errors.join(" | ") || "No AI provider is available",
        },
        { status: 502 }
      );
    }

    const parsedObject = extractJsonObject(rawResponse);
    const draft = normalizeGeneratedDraft(parsedObject, title);
    const cover = await resolveCoverImage({
      title: draft.title,
      type,
      tags: draft.tags,
      imageQuery: draft.imageQuery,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...draft,
        image: cover.image,
        imageSource: cover.source,
        imageQuery: cover.query,
        provider: providerUsed,
        mode,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate article";
    console.error("Article generation failed:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
