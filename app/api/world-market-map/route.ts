import { NextResponse } from "next/server";

import countryGeoMetadata from "@/data/country-geo-metadata.json";
import {
  WORLD_MARKET_CONFIG,
  type MarketCountryCode,
  type WorldMarketConfigEntry,
} from "@/lib/worldMarketConfig";

export const revalidate = 60;
export const runtime = "nodejs";

type MarketMapValues = Record<string, number>;
type MarketMapSource = "polygon" | "finnhub" | "mixed" | "none";
type CountryGeoMetadataMap = Record<string, [string, string, string]>;

interface AggResult {
  c?: number;
}

interface PolygonAggResponse {
  status?: string;
  results?: AggResult[];
}

interface FinnhubQuoteResponse {
  dp?: number;
}

interface MarketMapMeta {
  count: number;
  directCount: number;
  proxyCount: number;
  source: MarketMapSource;
  directCodes: string[];
  hasPolygonKey?: boolean;
  hasFinnhubKey?: boolean;
}

interface MarketMapApiResponse {
  values: MarketMapValues;
  meta: MarketMapMeta;
}

const COUNTRY_GEO_METADATA = countryGeoMetadata as unknown as CountryGeoMetadataMap;

const COUNTRY_META_BY_CODE = Object.entries(COUNTRY_GEO_METADATA).reduce<
  Record<string, { numericCode: string; region: string; subregion: string }>
>((acc, [numericCode, [countryCode, region, subregion]]) => {
  acc[countryCode] = { numericCode, region, subregion };
  return acc;
}, {});

const POLYGON_BASE_URL = "https://api.polygon.io";
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const CACHE_TTL_MS = 55_000;

let memoryCache:
  | {
      expiresAt: number;
      payload: MarketMapApiResponse;
      inflight?: Promise<MarketMapApiResponse>;
    }
  | undefined;

let lastSource: MarketMapSource = "none";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toFixedNumber(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function averageNumbers(values: number[]): number | null {
  if (!values.length) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return toFixedNumber(total / values.length);
}

function addBucketValue(bucket: Map<string, number[]>, key: string, value: number) {
  if (!key) {
    return;
  }

  const existing = bucket.get(key);
  if (existing) {
    existing.push(value);
  } else {
    bucket.set(key, [value]);
  }
}

function buildFilledCountryValues(directValues: Record<string, number>): MarketMapValues {
  const subregionBuckets = new Map<string, number[]>();
  const regionBuckets = new Map<string, number[]>();
  const globalValues: number[] = [];

  for (const [countryCode, value] of Object.entries(directValues)) {
    const meta = COUNTRY_META_BY_CODE[countryCode];
    if (!meta || !Number.isFinite(value)) {
      continue;
    }

    globalValues.push(value);
    addBucketValue(subregionBuckets, meta.subregion, value);
    addBucketValue(regionBuckets, meta.region, value);
  }

  const subregionAverages = new Map<string, number>();
  const regionAverages = new Map<string, number>();

  for (const [key, values] of subregionBuckets.entries()) {
    const average = averageNumbers(values);
    if (typeof average === "number") {
      subregionAverages.set(key, average);
    }
  }

  for (const [key, values] of regionBuckets.entries()) {
    const average = averageNumbers(values);
    if (typeof average === "number") {
      regionAverages.set(key, average);
    }
  }

  const globalAverage = averageNumbers(globalValues);
  const output: MarketMapValues = {};

  for (const [numericCode, [countryCode, region, subregion]] of Object.entries(COUNTRY_GEO_METADATA)) {
    if (region === "Antarctic") {
      continue;
    }

    const directValue = directValues[countryCode];
    if (typeof directValue === "number" && Number.isFinite(directValue)) {
      output[numericCode] = directValue;
      continue;
    }

    const proxyValue =
      subregionAverages.get(subregion) ?? regionAverages.get(region) ?? globalAverage;

    if (typeof proxyValue === "number" && Number.isFinite(proxyValue)) {
      output[numericCode] = proxyValue;
    }
  }

  return output;
}

async function fetchDailyChangePercent(
  apiKey: string,
  polygonTicker: string
): Promise<number | null> {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 14);

  const url =
    `${POLYGON_BASE_URL}/v2/aggs/ticker/${encodeURIComponent(polygonTicker)}` +
    `/range/1/day/${toIsoDate(from)}/${toIsoDate(to)}` +
    `?adjusted=true&sort=asc&limit=30&apiKey=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as PolygonAggResponse | null;
  if (!payload || !Array.isArray(payload.results) || payload.results.length < 2) {
    return null;
  }

  const closes = payload.results
    .map((item) => Number(item.c))
    .filter((item) => Number.isFinite(item));

  if (closes.length < 2) {
    return null;
  }

  const previousClose = closes[closes.length - 2];
  const latestClose = closes[closes.length - 1];

  if (!Number.isFinite(previousClose) || !Number.isFinite(latestClose) || previousClose === 0) {
    return null;
  }

  const pct = ((latestClose - previousClose) / previousClose) * 100;
  return toFixedNumber(clamp(pct, -25, 25));
}

async function fetchFinnhubChangePercent(
  apiKey: string,
  symbol: string
): Promise<number | null> {
  const url =
    `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}` +
    `&token=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as FinnhubQuoteResponse | null;
  const dp = Number(payload?.dp);
  if (!Number.isFinite(dp)) {
    return null;
  }

  return toFixedNumber(clamp(dp, -25, 25));
}

async function fetchCountryChange(
  polygonApiKey: string,
  finnhubApiKey: string,
  mapping: WorldMarketConfigEntry
): Promise<{ change: number | null; source: "polygon" | "finnhub" | null }> {
  if (polygonApiKey) {
    for (const ticker of mapping.polygonTickers) {
      const value = await fetchDailyChangePercent(polygonApiKey, ticker);
      if (typeof value === "number" && Number.isFinite(value)) {
        return { change: value, source: "polygon" as const };
      }
    }
  }

  if (finnhubApiKey) {
    for (const symbol of mapping.finnhubSymbols) {
      const value = await fetchFinnhubChangePercent(finnhubApiKey, symbol);
      if (typeof value === "number" && Number.isFinite(value)) {
        return { change: value, source: "finnhub" as const };
      }
    }
  }

  return { change: null, source: null };
}

async function fetchWorldMarketMapData(): Promise<MarketMapApiResponse> {
  const polygonApiKey =
    process.env.POLYGON_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY || "";
  const finnhubApiKey = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_KEY || "";

  if (!polygonApiKey && !finnhubApiKey) {
    lastSource = "none";
    return {
      values: {},
      meta: {
        count: 0,
        directCount: 0,
        proxyCount: 0,
        source: "none",
        directCodes: [],
      },
    };
  }

  const entries = Object.entries(WORLD_MARKET_CONFIG) as Array<
    [MarketCountryCode, WorldMarketConfigEntry]
  >;

  let polygonCount = 0;
  let finnhubCount = 0;

  const settled = await Promise.allSettled(
    entries.map(async ([countryCode, mapping]) => {
      const result = await fetchCountryChange(polygonApiKey, finnhubApiKey, mapping);
      return { countryCode, ...result };
    })
  );

  const directValues: Record<string, number> = {};
  const directCodes: string[] = [];

  for (const item of settled) {
    if (item.status !== "fulfilled") {
      continue;
    }

    const { countryCode, change, source } = item.value;
    if (typeof change !== "number" || !Number.isFinite(change)) {
      continue;
    }

    directValues[countryCode] = change;
    directCodes.push(countryCode);

    if (source === "polygon") {
      polygonCount += 1;
    } else if (source === "finnhub") {
      finnhubCount += 1;
    }
  }

  if (polygonCount > 0 && finnhubCount > 0) {
    lastSource = "mixed";
  } else if (polygonCount > 0) {
    lastSource = "polygon";
  } else if (finnhubCount > 0) {
    lastSource = "finnhub";
  } else {
    lastSource = "none";
  }

  const values = buildFilledCountryValues(directValues);
  const count = Object.keys(values).length;

  return {
    values,
    meta: {
      count,
      directCount: directCodes.length,
      proxyCount: Math.max(count - directCodes.length, 0),
      source: lastSource,
      directCodes,
    },
  };
}

async function getCachedWorldMarketMapData(): Promise<MarketMapApiResponse> {
  const now = Date.now();

  if (memoryCache && memoryCache.expiresAt > now) {
    return memoryCache.payload;
  }

  if (memoryCache?.inflight) {
    return memoryCache.inflight;
  }

  const inflight = fetchWorldMarketMapData()
    .then((payload) => {
      memoryCache = {
        payload,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };
      return payload;
    })
    .catch((error) => {
      console.error("[world-market-map] fetch failed:", error);
      const fallbackPayload =
        memoryCache?.payload ||
        ({
          values: {},
          meta: {
            count: 0,
            directCount: 0,
            proxyCount: 0,
            source: "none",
            directCodes: [],
          },
        } satisfies MarketMapApiResponse);

      memoryCache = {
        payload: fallbackPayload,
        expiresAt: Date.now() + 10_000,
      };

      return fallbackPayload;
    });

  memoryCache = {
    payload:
      memoryCache?.payload ||
      ({
        values: {},
        meta: {
          count: 0,
          directCount: 0,
          proxyCount: 0,
          source: "none",
          directCodes: [],
        },
      } satisfies MarketMapApiResponse),
    expiresAt: 0,
    inflight,
  };

  return inflight;
}

export async function GET(request: Request) {
  const payload = await getCachedWorldMarketMapData();
  const { searchParams } = new URL(request.url);
  const isDebug = searchParams.get("debug") === "1";

  const responsePayload = isDebug
    ? {
        ...payload,
        meta: {
          ...payload.meta,
          hasPolygonKey: Boolean(
            process.env.POLYGON_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY
          ),
          hasFinnhubKey: Boolean(
            process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_KEY
          ),
        },
      }
    : payload;

  return NextResponse.json(responsePayload, {
    headers: {
      "Cache-Control": isDebug ? "no-store" : "public, s-maxage=60, stale-while-revalidate=120",
      "X-Market-Map-Source": payload.meta.source,
      "X-Market-Map-Count": String(payload.meta.count),
      "X-Market-Map-Direct-Count": String(payload.meta.directCount),
    },
  });
}
