import { ArticleType } from "./constants";

export type ArticleGenerateMode =
  | "default"
  | "daily_market_overview"
  | "daily_crypto_update"
  | "daily_commodities_geopolitical_report";

interface NewsItem {
  headline: string;
  url: string;
  source: string;
  publishedAt: string;
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

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchTextWithTimeout(
  url: string,
  timeoutMs = 9000
): Promise<{ ok: boolean; status: number; text: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      const text = await response.text().catch(() => "");
      return { ok: response.ok, status: response.status, text };
    } catch {
      return { ok: false, status: 0, text: "" };
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchJsonWithTimeout<T>(
  url: string,
  timeoutMs = 9000
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      const data = (await response.json().catch(() => null)) as T | null;
      return { ok: response.ok, status: response.status, data };
    } catch {
      return { ok: false, status: 0, data: null };
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseRssItems(xml: string, maxItems: number): NewsItem[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, maxItems);
  return items
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

async function fetchCoinDeskRssNews(limit = 6): Promise<NewsItem[]> {
  const endpoint = "https://www.coindesk.com/arc/outboundfeeds/rss/";
  const response = await fetchTextWithTimeout(endpoint);
  if (!response.ok || !response.text) return [];

  return parseRssItems(response.text, limit).map((item) => ({
    ...item,
    source: item.source || "CoinDesk",
  }));
}

function dedupeNews(items: NewsItem[], maxItems: number): NewsItem[] {
  const seen = new Set<string>();
  const unique: NewsItem[] = [];

  for (const item of items) {
    const key = `${item.url}::${item.headline}`.toLowerCase();
    if (!item.url || seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= maxItems) {
      break;
    }
  }

  return unique;
}

function buildHeadlineLines(items: NewsItem[], fallbackText: string): string[] {
  if (!items.length) return [`- ${fallbackText}`];
  return items.map(
    (item) =>
      `- ${item.headline} | source: ${item.source || "unknown"} | ${item.publishedAt || "n/a"} | ${item.url}`
  );
}

function buildNewsQueries(input: {
  title: string;
  type: ArticleType;
  mode: ArticleGenerateMode;
}): string[] {
  const safeTitle = input.title.trim();

  if (input.mode === "daily_market_overview" || input.type === "global") {
    return [
      safeTitle,
      "global markets treasury yields federal reserve equities Reuters",
      "European markets Asian markets dollar index bond yields",
    ];
  }

  if (input.mode === "daily_crypto_update" || input.type === "crypto") {
    return [
      safeTitle,
      "bitcoin ethereum crypto regulation ETF market news",
      "crypto market geopolitical risk sentiment",
    ];
  }

  if (
    input.mode === "daily_commodities_geopolitical_report" ||
    input.type === "commodity"
  ) {
    return [
      safeTitle,
      "oil gold commodities OPEC China demand Reuters",
      "geopolitical tensions shipping trade sanctions oil supply",
    ];
  }

  if (input.type === "business") {
    return [
      safeTitle,
      "corporate deal merger acquisition markets Reuters",
      "company earnings sector market reaction",
    ];
  }

  return [
    safeTitle,
    "geopolitics markets sanctions trade tensions Reuters",
    "energy shipping defense global trade risk",
  ];
}

function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (value >= 100) return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
  if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return value.toLocaleString("en-US", { maximumFractionDigits: 8 });
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function isStablecoinSymbol(symbol: string): boolean {
  return new Set([
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
  ]).has(symbol.toUpperCase());
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

  const response = await fetchJsonWithTimeout<CoinGeckoMarketRow[]>(endpoint);
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

  return {
    btc: filtered.find((item) => item.symbol === "BTC") || null,
    eth: filtered.find((item) => item.symbol === "ETH") || null,
    gainers,
    losers,
    sourceUrl: "https://www.coingecko.com/",
  };
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
  const response = await fetchJsonWithTimeout<YahooChartPayload>(endpoint);

  if (!response.ok || !response.data?.chart?.result?.[0]) {
    return null;
  }

  const result = response.data.chart.result[0];
  const quote = result.indicators?.quote?.[0];
  const closes = extractFiniteNumbers(quote?.close);
  const highs = extractFiniteNumbers(quote?.high);
  const lows = extractFiniteNumbers(quote?.low);

  const latest = lastNumber(closes);
  const previous = closes.length > 1 ? closes[closes.length - 2] : null;
  const fallbackLatest =
    typeof result.meta?.regularMarketPrice === "number" ? result.meta.regularMarketPrice : null;
  const price = latest ?? fallbackLatest;

  if (!price || !Number.isFinite(price)) {
    return null;
  }

  const changePct =
    previous && Number.isFinite(previous) && previous !== 0 ? ((price - previous) / previous) * 100 : 0;

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

function commoditySnapshotLine(snapshot: CommoditySnapshot | null): string {
  if (!snapshot) {
    return "- Data unavailable for this instrument.";
  }

  return `- ${snapshot.label} (${snapshot.symbol}): ${formatPrice(snapshot.price)} (${formatPercent(
    snapshot.changePct
  )} 1d), 20-session high ${formatPrice(snapshot.high20)}, low ${formatPrice(
    snapshot.low20
  )} | ${snapshot.sourceUrl}`;
}

async function buildGenericContext(input: {
  title: string;
  type: ArticleType;
  mode: ArticleGenerateMode;
}): Promise<string> {
  const queries = buildNewsQueries(input);
  const newsLists = await Promise.all(queries.map((query) => fetchGoogleNews(query, 4)));
  const newsItems = dedupeNews(newsLists.flat(), 8);

  const lines: string[] = [];
  lines.push(`Request title: ${input.title}`);
  lines.push(`Article type: ${input.type}`);
  lines.push(`Mode: ${input.mode}`);
  lines.push(`Context built at: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("Verified headline context:");
  lines.push(
    ...buildHeadlineLines(
      newsItems,
      "No reliable recent headlines were available. Keep the article high-level and avoid specific unsupported claims."
    )
  );

  return lines.join("\n").slice(0, 12000);
}

async function buildCryptoContext(input: {
  title: string;
  mode: ArticleGenerateMode;
}): Promise<string> {
  const [movers, googleNews, coinDeskNews] = await Promise.all([
    fetchCryptoMovers(),
    fetchGoogleNews(`${input.title} crypto market`, 5),
    fetchCoinDeskRssNews(6),
  ]);

  const newsItems = dedupeNews([...googleNews, ...coinDeskNews], 8);
  const lines: string[] = [];

  lines.push(`Request title: ${input.title}`);
  lines.push(`Mode: ${input.mode}`);
  lines.push(`Context built at: ${new Date().toISOString()}`);
  lines.push(`Market data source: ${movers.sourceUrl}`);
  lines.push("");
  lines.push("BTC and ETH snapshot:");

  if (movers.btc) {
    lines.push(
      `- BTC: $${formatPrice(movers.btc.price)} (${formatPercent(movers.btc.change24h)} 24h) | ${movers.btc.link}`
    );
  } else {
    lines.push("- BTC: data unavailable");
  }

  if (movers.eth) {
    lines.push(
      `- ETH: $${formatPrice(movers.eth.price)} (${formatPercent(movers.eth.change24h)} 24h) | ${movers.eth.link}`
    );
  } else {
    lines.push("- ETH: data unavailable");
  }

  lines.push("");
  lines.push("Top gainers (24h):");
  if (movers.gainers.length > 0) {
    for (const item of movers.gainers) {
      lines.push(
        `- ${item.symbol} (${item.name}): ${formatPercent(item.change24h)}, price $${formatPrice(
          item.price
        )} | ${item.link}`
      );
    }
  } else {
    lines.push("- no reliable gainers data available");
  }

  lines.push("");
  lines.push("Top losers (24h):");
  if (movers.losers.length > 0) {
    for (const item of movers.losers) {
      lines.push(
        `- ${item.symbol} (${item.name}): ${formatPercent(item.change24h)}, price $${formatPrice(
          item.price
        )} | ${item.link}`
      );
    }
  } else {
    lines.push("- no reliable losers data available");
  }

  lines.push("");
  lines.push("Latest crypto headlines:");
  lines.push(
    ...buildHeadlineLines(
      newsItems,
      "No reliable crypto headlines were available. Avoid unsupported event claims."
    )
  );

  if (movers.warning) {
    lines.push("");
    lines.push(`Warning: ${movers.warning}`);
  }

  return lines.join("\n").slice(0, 12000);
}

async function buildCommodityContext(input: {
  title: string;
  mode: ArticleGenerateMode;
}): Promise<string> {
  const [wti, brent, gold, silver, oilNews, chinaNews, geoNews] = await Promise.all([
    fetchCommoditySnapshot("CL=F", "WTI Crude"),
    fetchCommoditySnapshot("BZ=F", "Brent Crude"),
    fetchCommoditySnapshot("GC=F", "Gold"),
    fetchCommoditySnapshot("SI=F", "Silver"),
    fetchGoogleNews("OPEC production output oil market Reuters", 4),
    fetchGoogleNews("China demand commodities industrial outlook Reuters", 4),
    fetchGoogleNews("geopolitical tensions oil supply trade sanctions shipping", 4),
  ]);

  const lines: string[] = [];
  lines.push(`Request title: ${input.title}`);
  lines.push(`Mode: ${input.mode}`);
  lines.push(`Context built at: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("Energy and metals market snapshot:");
  lines.push(commoditySnapshotLine(wti));
  lines.push(commoditySnapshotLine(brent));
  lines.push(commoditySnapshotLine(gold));
  lines.push(commoditySnapshotLine(silver));
  lines.push("");
  lines.push("Oil and OPEC headlines:");
  lines.push(
    ...buildHeadlineLines(oilNews, "No reliable oil production or OPEC headlines were available.")
  );
  lines.push("");
  lines.push("China demand headlines:");
  lines.push(
    ...buildHeadlineLines(chinaNews, "No reliable China demand headlines were available.")
  );
  lines.push("");
  lines.push("Geopolitical and trade risk headlines:");
  lines.push(
    ...buildHeadlineLines(geoNews, "No reliable geopolitical headlines were available.")
  );

  return lines.join("\n").slice(0, 12000);
}

export async function buildArticleWritingContext(input: {
  title: string;
  type: ArticleType;
  mode: ArticleGenerateMode;
  providedContext?: string;
}): Promise<string> {
  const providedContext = typeof input.providedContext === "string" ? input.providedContext.trim() : "";
  if (providedContext) {
    return providedContext.slice(0, 12000);
  }

  try {
    if (input.mode === "daily_crypto_update" || input.type === "crypto") {
      return await buildCryptoContext({ title: input.title, mode: input.mode });
    }

    if (
      input.mode === "daily_commodities_geopolitical_report" ||
      input.type === "commodity"
    ) {
      return await buildCommodityContext({ title: input.title, mode: input.mode });
    }

    return await buildGenericContext(input);
  } catch {
    return [
      `Request title: ${input.title}`,
      `Article type: ${input.type}`,
      `Mode: ${input.mode}`,
      `Context built at: ${new Date().toISOString()}`,
      "",
      "Verified headline context:",
      "- Context providers were unavailable for this run. Keep the article high-level and avoid specific unsupported claims.",
    ]
      .join("\n")
      .slice(0, 12000);
  }
}
