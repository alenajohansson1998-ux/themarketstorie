import { NextRequest, NextResponse } from 'next/server';

let cache: { data: unknown; ts: number } | null = null;
const TTL = 60_000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get('ids') || '';
  const perPage = searchParams.get('per_page') || '20';

  const now = Date.now();
  if (cache && now - cache.ts < TTL && !ids) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    });
  }

  try {
    const params = new URLSearchParams({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: perPage,
      page: '1',
      sparkline: 'true',
      price_change_percentage: '24h',
    });
    if (ids) params.set('ids', ids);

    const url = `https://api.coingecko.com/api/v3/coins/markets?${params}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

    const data = await res.json();
    if (!ids) cache = { data, ts: now };

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    });
  } catch {
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 502 });
  }
}
