import { NextResponse } from "next/server";

export const revalidate = 60;
export const runtime = "nodejs";

type CountryCode =
  | "US"
  | "CA"
  | "BR"
  | "MX"
  | "GB"
  | "DE"
  | "FR"
  | "JP"
  | "CN"
  | "IN"
  | "AU"
  | "KR";

type MarketMapResponse = Partial<Record<CountryCode, number>>;

interface AggResult {
  c?: number;
}

interface PolygonAggResponse {
  status?: string;
  results?: AggResult[];
}

interface IndexMapping {
  indexSymbol: string;
  polygonTickers: string[];
  finnhubSymbols: string[];
}

const COUNTRY_INDEX_MAP: Record<CountryCode, IndexMapping> = {
  US: {
    indexSymbol: "^GSPC",
    polygonTickers: ["I:SPX", "I:GSPC"],
    finnhubSymbols: ["SPY"],
  },
  CA: {
    indexSymbol: "^GSPTSE",
    polygonTickers: ["I:SPTSX", "I:GSPTSE"],
    finnhubSymbols: ["EWC"],
  },
  BR: {
    indexSymbol: "^BVSP",
    polygonTickers: ["I:IBOV", "I:BVSP"],
    finnhubSymbols: ["EWZ"],
  },
  MX: {
    indexSymbol: "^MXX",
    polygonTickers: ["I:MXX"],
    finnhubSymbols: ["EWW"],
  },
  GB: {
    indexSymbol: "^FTSE",
    polygonTickers: ["I:UKX", "I:FTSE"],
    finnhubSymbols: ["EWU"],
  },
  DE: {
    indexSymbol: "^GDAXI",
    polygonTickers: ["I:DAX", "I:GDAXI"],
    finnhubSymbols: ["EWG"],
  },
  FR: {
    indexSymbol: "^FCHI",
    polygonTickers: ["I:CAC", "I:FCHI"],
    finnhubSymbols: ["EWQ"],
  },
  JP: {
    indexSymbol: "^N225",
    polygonTickers: ["I:N225", "I:NKY"],
    finnhubSymbols: ["EWJ"],
  },
  CN: {
    indexSymbol: "000001.SS",
    polygonTickers: ["I:000001", "I:SSEC"],
    finnhubSymbols: ["MCHI"],
  },
  IN: {
    indexSymbol: "^BSESN",
    polygonTickers: ["I:SENSEX", "I:BSESN"],
    finnhubSymbols: ["INDA"],
  },
  AU: {
    indexSymbol: "^AXJO",
    polygonTickers: ["I:XJO", "I:AXJO"],
    finnhubSymbols: ["EWA"],
  },
  KR: {
    indexSymbol: "^KS11",
    polygonTickers: ["I:KOSPI", "I:KS11"],
    finnhubSymbols: ["EWY"],
  },
};

const POLYGON_BASE_URL = "https://api.polygon.io";
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const CACHE_TTL_MS = 55_000;

let memoryCache:
  | {
      expiresAt: number;
      data: MarketMapResponse;
      source: "polygon" | "finnhub" | "mixed" | "none";
      inflight?: Promise<MarketMapResponse>;
    }
  | undefined;

let lastSource: "polygon" | "finnhub" | "mixed" | "none" = "none";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toFixedNumber(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
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

interface FinnhubQuoteResponse {
  dp?: number;
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
  mapping: IndexMapping
) {
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

  return { change: null, source: null as const };
}

async function fetchWorldMarketMapData(): Promise<MarketMapResponse> {
  const polygonApiKey =
    process.env.POLYGON_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY || "";
  const finnhubApiKey = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_KEY || "";

  if (!polygonApiKey && !finnhubApiKey) {
    lastSource = "none";
    return {};
  }

  const entries = Object.entries(COUNTRY_INDEX_MAP) as Array<[CountryCode, IndexMapping]>;
  let polygonCount = 0;
  let finnhubCount = 0;

  const settled = await Promise.allSettled(
    entries.map(async ([countryCode, mapping]) => {
      const result = await fetchCountryChange(polygonApiKey, finnhubApiKey, mapping);
      return { countryCode, ...result };
    })
  );

  const output: MarketMapResponse = {};
  for (const item of settled) {
    if (item.status !== "fulfilled") {
      continue;
    }

    const { countryCode, change, source } = item.value;
    if (typeof change === "number" && Number.isFinite(change)) {
      output[countryCode] = change;
      if (source === "polygon") {
        polygonCount += 1;
      } else if (source === "finnhub") {
        finnhubCount += 1;
      }
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

  return output;
}

async function getCachedWorldMarketMapData(): Promise<MarketMapResponse> {
  const now = Date.now();

  if (memoryCache && memoryCache.expiresAt > now) {
    return memoryCache.data;
  }

  if (memoryCache?.inflight) {
    return memoryCache.inflight;
  }

  const inflight = fetchWorldMarketMapData()
    .then((data) => {
      memoryCache = {
        data,
        source: lastSource,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };
      return data;
    })
    .catch((error) => {
      console.error("[world-market-map] fetch failed:", error);
      memoryCache = {
        data: memoryCache?.data || {},
        source: memoryCache?.source || "none",
        expiresAt: Date.now() + 10_000,
      };
      return memoryCache.data;
    });

  memoryCache = {
    data: memoryCache?.data || {},
    source: memoryCache?.source || "none",
    expiresAt: 0,
    inflight,
  };

  return inflight;
}

export async function GET(request: Request) {
  const data = await getCachedWorldMarketMapData();
  const count = Object.keys(data).length;
  const { searchParams } = new URL(request.url);
  const isDebug = searchParams.get("debug") === "1";

  if (isDebug) {
    return NextResponse.json(
      {
        data,
        meta: {
          count,
          source: memoryCache?.source || lastSource,
          hasPolygonKey: Boolean(
            process.env.POLYGON_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY
          ),
          hasFinnhubKey: Boolean(
            process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_KEY
          ),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "X-Market-Map-Source": memoryCache?.source || lastSource,
      "X-Market-Map-Count": String(count),
    },
  });
}
