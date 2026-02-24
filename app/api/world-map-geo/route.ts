import { NextResponse } from "next/server";

export const revalidate = 86_400;
export const runtime = "nodejs";

const GEO_SOURCES = [
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
  "https://unpkg.com/world-atlas@2/countries-110m.json",
];

type GeoPayload = Record<string, unknown>;

let cachedGeo:
  | {
      data: GeoPayload;
      expiresAt: number;
      inflight?: Promise<GeoPayload>;
    }
  | undefined;

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

async function loadGeoFromSources(): Promise<GeoPayload> {
  for (const url of GEO_SOURCES) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
      });
      if (!response.ok) {
        continue;
      }

      const payload = (await response.json().catch(() => null)) as GeoPayload | null;
      if (payload && typeof payload === "object") {
        return payload;
      }
    } catch {
      // try next source
    }
  }

  throw new Error("Unable to load world geo topology from remote sources.");
}

async function getGeoData(): Promise<GeoPayload> {
  const now = Date.now();

  if (cachedGeo && cachedGeo.expiresAt > now) {
    return cachedGeo.data;
  }

  if (cachedGeo?.inflight) {
    return cachedGeo.inflight;
  }

  const inflight = loadGeoFromSources()
    .then((data) => {
      cachedGeo = {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };
      return data;
    })
    .catch((error) => {
      console.error("[world-map-geo] fetch failed:", error);
      if (cachedGeo?.data) {
        cachedGeo = {
          data: cachedGeo.data,
          expiresAt: Date.now() + 5 * 60 * 1000,
        };
        return cachedGeo.data;
      }
      throw error;
    });

  cachedGeo = {
    data: cachedGeo?.data || {},
    expiresAt: 0,
    inflight,
  };

  return inflight;
}

export async function GET() {
  try {
    const data = await getGeoData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load world geo data." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}

