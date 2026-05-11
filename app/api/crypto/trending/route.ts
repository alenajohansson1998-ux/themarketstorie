import { NextResponse } from 'next/server';

let cache: { data: unknown; ts: number } | null = null;
const TTL = 300_000;

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.ts < TTL) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, s-maxage=300' },
    });
  }

  try {
    const res = await fetch('https://api.coingecko.com/api/v3/search/trending', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

    const data = await res.json();
    cache = { data, ts: now };

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300' },
    });
  } catch {
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ error: 'Failed to fetch trending' }, { status: 502 });
  }
}
