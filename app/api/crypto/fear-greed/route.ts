import { NextResponse } from 'next/server';

let cache: { data: unknown; ts: number } | null = null;
const TTL = 3_600_000;

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.ts < TTL) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600' },
    });
  }

  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Alternative.me ${res.status}`);

    const json = await res.json();
    const item = json?.data?.[0];
    const data = {
      value: Number(item?.value ?? 50),
      classification: item?.value_classification ?? 'Neutral',
      timestamp: item?.timestamp,
    };
    cache = { data, ts: now };

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600' },
    });
  } catch {
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ value: 50, classification: 'Neutral' });
  }
}
