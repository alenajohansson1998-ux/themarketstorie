export type MarketTimeframe = "5M" | "15M" | "1H" | "1D" | "1W" | "1M" | "1Y";

export interface FinnhubQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface FinnhubCompanyProfile {
  country?: string;
  currency?: string;
  exchange?: string;
  finnhubIndustry?: string;
  logo?: string;
  marketCapitalization?: number;
  name: string;
  ticker: string;
  weburl?: string;
}

export interface FinnhubNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface CandleBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandleApiResponse {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: string;
  t: number[];
  v: number[];
}

interface TimeframeConfig {
  resolution: string;
  from: number;
  to: number;
  bucketSeconds: number;
}

const FINNHUB_REST_BASE = "https://finnhub.io/api/v1";
const FINNHUB_WS_BASE = "wss://ws.finnhub.io";
const DAY_SECONDS = 86_400;
const BINANCE_REST_BASE = "https://api.binance.com/api/v3";
const YAHOO_CHART_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

export const DEFAULT_TICKER_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "AAPL",
  "TSLA",
  "MSFT",
] as const;

class FinnhubHttpError extends Error {
  status: number;
  path: string;
  body: string;

  constructor(status: number, path: string, body: string) {
    super(`Finnhub request failed (${status}) for ${path}: ${body}`);
    this.name = "FinnhubHttpError";
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_FINNHUB_KEY || process.env.FINNHUB_API_KEY;
  if (!key) {
    throw new Error(
      "Finnhub API key missing. Set NEXT_PUBLIC_FINNHUB_KEY in your environment."
    );
  }
  return key;
}

async function finnhubFetch<T>(pathWithQuery: string): Promise<T> {
  const token = getApiKey();
  const separator = pathWithQuery.includes("?") ? "&" : "?";
  const url = `${FINNHUB_REST_BASE}${pathWithQuery}${separator}token=${token}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const body = await response.text();
    throw new FinnhubHttpError(response.status, pathWithQuery, body);
  }
  return (await response.json()) as T;
}

function isPermissionError(error: unknown): boolean {
  return error instanceof FinnhubHttpError && (error.status === 401 || error.status === 403);
}

function toIsoDate(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toISOString().slice(0, 10);
}

export function isCryptoSymbol(symbol: string): boolean {
  const upper = symbol.toUpperCase();
  if (upper.includes(":")) {
    return (
      upper.startsWith("BINANCE:") ||
      upper.startsWith("COINBASE:") ||
      upper.startsWith("KRAKEN:")
    );
  }
  return upper.endsWith("USDT") || upper.endsWith("USD");
}

export function toFinnhubSymbol(symbol: string): string {
  const upper = symbol.toUpperCase();
  if (upper.includes(":")) return upper;
  if (isCryptoSymbol(upper)) return `BINANCE:${upper}`;
  return upper;
}

export function toDisplaySymbol(symbol: string): string {
  const upper = symbol.toUpperCase();
  if (!upper.includes(":")) return upper;
  const parts = upper.split(":");
  return parts[parts.length - 1] || upper;
}

export function getFinnhubWebSocketUrl(): string {
  return `${FINNHUB_WS_BASE}?token=${getApiKey()}`;
}

export function getTimeframeConfig(timeframe: MarketTimeframe): TimeframeConfig {
  const now = Math.floor(Date.now() / 1000);
  switch (timeframe) {
    case "5M":
      return {
        resolution: "5",
        from: now - DAY_SECONDS * 5,
        to: now,
        bucketSeconds: 300,
      };
    case "15M":
      return {
        resolution: "15",
        from: now - DAY_SECONDS * 14,
        to: now,
        bucketSeconds: 900,
      };
    case "1H":
      return {
        resolution: "60",
        from: now - DAY_SECONDS * 30,
        to: now,
        bucketSeconds: 3600,
      };
    case "1D":
      return { resolution: "5", from: now - DAY_SECONDS, to: now, bucketSeconds: 300 };
    case "1W":
      return {
        resolution: "60",
        from: now - DAY_SECONDS * 7,
        to: now,
        bucketSeconds: 3600,
      };
    case "1Y":
      return {
        resolution: "W",
        from: now - DAY_SECONDS * 365,
        to: now,
        bucketSeconds: DAY_SECONDS * 7,
      };
    case "1M":
    default:
      return {
        resolution: "D",
        from: now - DAY_SECONDS * 31,
        to: now,
        bucketSeconds: DAY_SECONDS,
      };
  }
}

export function timeframeBucketSeconds(timeframe: MarketTimeframe): number {
  return getTimeframeConfig(timeframe).bucketSeconds;
}

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string
];

interface YahooQuotePayload {
  open?: Array<number | null>;
  high?: Array<number | null>;
  low?: Array<number | null>;
  close?: Array<number | null>;
  volume?: Array<number | null>;
}

interface YahooChartResult {
  timestamp?: number[];
  indicators?: {
    quote?: YahooQuotePayload[];
  };
}

interface YahooChartResponse {
  chart?: {
    result?: YahooChartResult[];
  };
}

function toBinanceSpotSymbol(symbol: string): string {
  const display = toDisplaySymbol(symbol).toUpperCase();
  return display.replace(/[^A-Z0-9]/g, "");
}

function getBinanceIntervalConfig(timeframe: MarketTimeframe): {
  interval: string;
  limit: number;
} {
  switch (timeframe) {
    case "5M":
      return { interval: "5m", limit: 576 };
    case "15M":
      return { interval: "15m", limit: 672 };
    case "1H":
      return { interval: "1h", limit: 720 };
    case "1D":
      return { interval: "5m", limit: 288 };
    case "1W":
      return { interval: "1h", limit: 168 };
    case "1Y":
      return { interval: "1w", limit: 52 };
    case "1M":
    default:
      return { interval: "1d", limit: 31 };
  }
}

function getYahooRangeInterval(timeframe: MarketTimeframe): {
  range: string;
  interval: string;
} {
  switch (timeframe) {
    case "5M":
      return { range: "5d", interval: "5m" };
    case "15M":
      return { range: "1mo", interval: "15m" };
    case "1H":
      return { range: "1mo", interval: "60m" };
    case "1D":
      return { range: "1d", interval: "5m" };
    case "1W":
      return { range: "7d", interval: "60m" };
    case "1Y":
      return { range: "1y", interval: "1wk" };
    case "1M":
    default:
      return { range: "1mo", interval: "1d" };
  }
}

async function fetchStockCandlesFromYahoo(
  symbol: string,
  timeframe: MarketTimeframe
): Promise<CandleBar[]> {
  try {
    const ticker = toDisplaySymbol(symbol).toUpperCase();
    const { range, interval } = getYahooRangeInterval(timeframe);
    const url = `${YAHOO_CHART_BASE}/${encodeURIComponent(
      ticker
    )}?range=${range}&interval=${interval}&includePrePost=false&events=history`;

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as YahooChartResponse;
    const result = payload.chart?.result?.[0];
    const timestamps = result?.timestamp || [];
    const quote = result?.indicators?.quote?.[0];
    const open = quote?.open || [];
    const high = quote?.high || [];
    const low = quote?.low || [];
    const close = quote?.close || [];
    const volume = quote?.volume || [];

    const bars: CandleBar[] = [];
    for (let i = 0; i < timestamps.length; i += 1) {
      const time = timestamps[i];
      const o = open[i];
      const h = high[i];
      const l = low[i];
      const c = close[i];
      const v = volume[i];

      if (
        Number.isFinite(time) &&
        Number.isFinite(o) &&
        Number.isFinite(h) &&
        Number.isFinite(l) &&
        Number.isFinite(c)
      ) {
        bars.push({
          time: time as number,
          open: o as number,
          high: h as number,
          low: l as number,
          close: c as number,
          volume: Number.isFinite(v) ? (v as number) : 0,
        });
      }
    }

    return bars;
  } catch {
    return [];
  }
}

async function fetchCryptoCandlesFromBinance(
  symbol: string,
  timeframe: MarketTimeframe
): Promise<CandleBar[]> {
  const spot = toBinanceSpotSymbol(symbol);
  const { interval, limit } = getBinanceIntervalConfig(timeframe);
  const url = `${BINANCE_REST_BASE}/klines?symbol=${encodeURIComponent(
    spot
  )}&interval=${interval}&limit=${limit}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as BinanceKline[];
  if (!Array.isArray(payload)) {
    return [];
  }

  const bars: CandleBar[] = [];
  for (const item of payload) {
    const openTime = Math.floor(item[0] / 1000);
    const open = Number(item[1]);
    const high = Number(item[2]);
    const low = Number(item[3]);
    const close = Number(item[4]);
    const volume = Number(item[5]);

    if (
      Number.isFinite(openTime) &&
      Number.isFinite(open) &&
      Number.isFinite(high) &&
      Number.isFinite(low) &&
      Number.isFinite(close)
    ) {
      bars.push({
        time: openTime,
        open,
        high,
        low,
        close,
        volume: Number.isFinite(volume) ? volume : 0,
      });
    }
  }

  return bars;
}

async function fetchCryptoQuoteFromBinance(symbol: string): Promise<FinnhubQuote | null> {
  const spot = toBinanceSpotSymbol(symbol);
  const url = `${BINANCE_REST_BASE}/ticker/24hr?symbol=${encodeURIComponent(spot)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    lastPrice?: string;
    priceChange?: string;
    priceChangePercent?: string;
    highPrice?: string;
    lowPrice?: string;
    openPrice?: string;
    closeTime?: number;
  };

  const c = Number(payload.lastPrice);
  const d = Number(payload.priceChange);
  const dp = Number(payload.priceChangePercent);
  const h = Number(payload.highPrice);
  const l = Number(payload.lowPrice);
  const o = Number(payload.openPrice);
  const pc = Number.isFinite(o) ? o : c - d;
  const t = Number.isFinite(payload.closeTime)
    ? Math.floor((payload.closeTime as number) / 1000)
    : Math.floor(Date.now() / 1000);

  if (!Number.isFinite(c) || !Number.isFinite(d) || !Number.isFinite(dp)) {
    return null;
  }

  return {
    c,
    d,
    dp,
    h: Number.isFinite(h) ? h : c,
    l: Number.isFinite(l) ? l : c,
    o: Number.isFinite(o) ? o : c,
    pc: Number.isFinite(pc) ? pc : c,
    t,
  };
}

function quoteFromCandles(bars: CandleBar[]): FinnhubQuote | null {
  if (!bars.length) return null;

  const last = bars[bars.length - 1];
  const previous = bars[bars.length - 2] ?? bars[0];
  const change = last.close - previous.close;
  const changePercent = previous.close ? (change / previous.close) * 100 : 0;

  let high = Number.NEGATIVE_INFINITY;
  let low = Number.POSITIVE_INFINITY;
  for (const bar of bars) {
    if (bar.high > high) high = bar.high;
    if (bar.low < low) low = bar.low;
  }

  return {
    c: last.close,
    d: change,
    dp: changePercent,
    h: high,
    l: low,
    o: bars[0].open,
    pc: previous.close,
    t: last.time,
  };
}

function fallbackProfile(symbol: string): FinnhubCompanyProfile {
  return {
    name: symbol,
    ticker: symbol,
    finnhubIndustry: isCryptoSymbol(symbol) ? "Cryptocurrency" : "Unknown",
  };
}

function fallbackQuote(): FinnhubQuote {
  return {
    c: 0,
    d: 0,
    dp: 0,
    h: 0,
    l: 0,
    o: 0,
    pc: 0,
    t: Math.floor(Date.now() / 1000),
  };
}

function isValidQuote(quote: FinnhubQuote): boolean {
  return Number.isFinite(quote.c) && quote.c > 0;
}

function synthesizeCandlesFromQuote(
  quote: FinnhubQuote,
  timeframe: MarketTimeframe
): CandleBar[] {
  if (!isValidQuote(quote)) {
    return [];
  }

  const bucketSeconds = timeframeBucketSeconds(timeframe);
  const now = Math.floor(Date.now() / 1000);
  const currentBucket = Math.floor(now / bucketSeconds) * bucketSeconds;
  const previousBucket = currentBucket - bucketSeconds;

  const previousClose =
    Number.isFinite(quote.pc) && quote.pc > 0 ? quote.pc : quote.c - quote.d;
  const open = Number.isFinite(previousClose) && previousClose > 0 ? previousClose : quote.c;
  const close = quote.c;
  const high = Math.max(
    Number.isFinite(quote.h) && quote.h > 0 ? quote.h : close,
    open,
    close
  );
  const low = Math.min(
    Number.isFinite(quote.l) && quote.l > 0 ? quote.l : close,
    open,
    close
  );

  return [
    {
      time: previousBucket,
      open,
      high: Math.max(open, close),
      low: Math.min(open, close),
      close: open,
      volume: 0,
    },
    {
      time: currentBucket,
      open,
      high,
      low,
      close,
      volume: 0,
    },
  ];
}

async function fetchStockQuoteSnapshot(symbol: string): Promise<FinnhubQuote | null> {
  try {
    return await finnhubFetch<FinnhubQuote>(`/quote?symbol=${encodeURIComponent(symbol)}`);
  } catch (error) {
    if (isPermissionError(error)) {
      return null;
    }
    throw error;
  }
}

export async function fetchCandles(
  symbol: string,
  timeframe: MarketTimeframe
): Promise<CandleBar[]> {
  const normalized = toFinnhubSymbol(symbol);
  const { resolution, from, to } = getTimeframeConfig(timeframe);
  const crypto = isCryptoSymbol(normalized);
  const endpoint = crypto ? "/crypto/candle" : "/stock/candle";

  let payload: CandleApiResponse;
  try {
    payload = await finnhubFetch<CandleApiResponse>(
      `${endpoint}?symbol=${encodeURIComponent(
        normalized
      )}&resolution=${resolution}&from=${from}&to=${to}`
    );
  } catch (error) {
    if (isPermissionError(error)) {
      if (crypto) {
        return fetchCryptoCandlesFromBinance(normalized, timeframe);
      }
      const yahooBars = await fetchStockCandlesFromYahoo(normalized, timeframe);
      if (yahooBars.length) {
        return yahooBars;
      }
      try {
        const quote = await fetchStockQuoteSnapshot(normalized);
        return quote ? synthesizeCandlesFromQuote(quote, timeframe) : [];
      } catch {
        return [];
      }
    }
    throw error;
  }

  if (payload.s !== "ok" || !Array.isArray(payload.t) || payload.t.length === 0) {
    if (crypto) {
      return fetchCryptoCandlesFromBinance(normalized, timeframe);
    }
    const yahooBars = await fetchStockCandlesFromYahoo(normalized, timeframe);
    if (yahooBars.length) {
      return yahooBars;
    }
    try {
      const quote = await fetchStockQuoteSnapshot(normalized);
      return quote ? synthesizeCandlesFromQuote(quote, timeframe) : [];
    } catch {
      return [];
    }
  }

  const bars: CandleBar[] = [];
  for (let i = 0; i < payload.t.length; i += 1) {
    const bar: CandleBar = {
      time: payload.t[i],
      open: payload.o[i],
      high: payload.h[i],
      low: payload.l[i],
      close: payload.c[i],
      volume: payload.v[i] ?? 0,
    };

    if (
      Number.isFinite(bar.time) &&
      Number.isFinite(bar.open) &&
      Number.isFinite(bar.high) &&
      Number.isFinite(bar.low) &&
      Number.isFinite(bar.close)
    ) {
      bars.push(bar);
    }
  }

  return bars;
}

export async function fetchQuote(symbol: string): Promise<FinnhubQuote> {
  const normalized = toFinnhubSymbol(symbol);

  if (isCryptoSymbol(normalized)) {
    const bars = await fetchCandles(normalized, "1D");
    const candleQuote = quoteFromCandles(bars);
    if (candleQuote) {
      return candleQuote;
    }

    const binanceQuote = await fetchCryptoQuoteFromBinance(normalized);
    if (binanceQuote) {
      return binanceQuote;
    }

    return fallbackQuote();
  }

  const stockQuote = await fetchStockQuoteSnapshot(normalized);
  if (stockQuote) {
    return stockQuote;
  }

  const stockBars = await fetchStockCandlesFromYahoo(normalized, "1D");
  const stockCandleQuote = quoteFromCandles(stockBars);
  if (stockCandleQuote) {
    return stockCandleQuote;
  }

  return fallbackQuote();
}

export async function fetchCompanyProfile(
  symbol: string
): Promise<FinnhubCompanyProfile> {
  const normalized = toFinnhubSymbol(symbol);
  const displaySymbol = toDisplaySymbol(normalized);

  if (isCryptoSymbol(normalized)) {
    return {
      name: displaySymbol,
      ticker: displaySymbol,
      exchange: "BINANCE",
      finnhubIndustry: "Cryptocurrency",
      country: "Global",
      currency: "USD",
    };
  }

  let profile: Partial<FinnhubCompanyProfile>;
  try {
    profile = await finnhubFetch<Partial<FinnhubCompanyProfile>>(
      `/stock/profile2?symbol=${encodeURIComponent(normalized)}`
    );
  } catch (error) {
    if (isPermissionError(error)) {
      return fallbackProfile(displaySymbol);
    }
    throw error;
  }

  return {
    name: profile.name || displaySymbol,
    ticker: profile.ticker || displaySymbol,
    country: profile.country,
    currency: profile.currency,
    exchange: profile.exchange,
    finnhubIndustry: profile.finnhubIndustry,
    logo: profile.logo,
    marketCapitalization: profile.marketCapitalization,
    weburl: profile.weburl,
  };
}

export async function fetchRelatedNews(
  symbol: string
): Promise<FinnhubNewsItem[]> {
  const normalized = toFinnhubSymbol(symbol);
  const now = Math.floor(Date.now() / 1000);
  const from = toIsoDate(now - DAY_SECONDS * 7);
  const to = toIsoDate(now);

  if (isCryptoSymbol(normalized)) {
    let news: FinnhubNewsItem[] = [];
    try {
      news = await finnhubFetch<FinnhubNewsItem[]>("/news?category=crypto");
    } catch (error) {
      if (isPermissionError(error)) {
        return [];
      }
      throw error;
    }
    const keyword = toDisplaySymbol(normalized).replace("USDT", "");
    const filtered = news.filter((item) =>
      `${item.headline} ${item.summary}`.toUpperCase().includes(keyword)
    );
    return (filtered.length ? filtered : news).slice(0, 12);
  }

  let companyNews: FinnhubNewsItem[] = [];
  try {
    companyNews = await finnhubFetch<FinnhubNewsItem[]>(
      `/company-news?symbol=${encodeURIComponent(normalized)}&from=${from}&to=${to}`
    );
  } catch (error) {
    if (isPermissionError(error)) {
      return [];
    }
    throw error;
  }
  return companyNews.slice(0, 12);
}

export interface MarketPageData {
  symbol: string;
  quote: FinnhubQuote;
  profile: FinnhubCompanyProfile;
  candles: CandleBar[];
  news: FinnhubNewsItem[];
  partial: boolean;
}

export async function fetchMarketPageData(
  symbol: string,
  timeframe: MarketTimeframe = "1M"
): Promise<MarketPageData> {
  const displaySymbol = toDisplaySymbol(symbol);
  const [quoteResult, profileResult, candlesResult, newsResult] = await Promise.allSettled([
    fetchQuote(displaySymbol),
    fetchCompanyProfile(displaySymbol),
    fetchCandles(displaySymbol, timeframe),
    fetchRelatedNews(displaySymbol),
  ]);

  const rawCandles = candlesResult.status === "fulfilled" ? candlesResult.value : [];
  const quoteFromBars = quoteFromCandles(rawCandles);
  const quote =
    quoteResult.status === "fulfilled"
      ? quoteResult.value
      : quoteFromBars || fallbackQuote();
  const syntheticCandles = synthesizeCandlesFromQuote(quote, timeframe);
  const candles = rawCandles.length ? rawCandles : syntheticCandles;
  const profile =
    profileResult.status === "fulfilled"
      ? profileResult.value
      : fallbackProfile(displaySymbol);
  const news = newsResult.status === "fulfilled" ? newsResult.value : [];
  const partial =
    quoteResult.status === "rejected" ||
    profileResult.status === "rejected" ||
    candlesResult.status === "rejected" ||
    newsResult.status === "rejected" ||
    rawCandles.length === 0;

  return {
    symbol: displaySymbol,
    quote,
    profile,
    candles,
    news,
    partial,
  };
}

export async function fetchTickerSnapshot(
  symbols: readonly string[]
): Promise<Record<string, FinnhubQuote | null>> {
  const entries = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const quote = await fetchQuote(symbol);
        return [toDisplaySymbol(symbol), quote] as const;
      } catch {
        return [toDisplaySymbol(symbol), null] as const;
      }
    })
  );

  return Object.fromEntries(entries);
}
