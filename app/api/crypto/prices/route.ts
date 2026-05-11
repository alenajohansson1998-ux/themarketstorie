import { NextRequest, NextResponse } from 'next/server';

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 30_000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get('ids') || 'bitcoin,ethereum';
  const vs = searchParams.get('vs_currencies') || 'usd';

  // Deduplicate vs currencies (e.g. "usd,usd" → "usd")
  const vsClean = [...new Set(vs.split(','))].join(',');
  const cacheKey = `${ids}__${vsClean}`;

  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && now - hit.ts < TTL) {
    return NextResponse.json(hit.data, {
      headers: { 'Cache-Control': 'public, s-maxage=30' },
    });
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vsClean}&include_24hr_change=true&include_market_cap=true`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

    const data = await res.json();
    cache.set(cacheKey, { data, ts: now });

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=30' },
    });
  } catch {
    if (hit) return NextResponse.json(hit.data);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 502 });
  }
}
