import { NextResponse } from 'next/server';
import { getMarketSnapshot } from '@/lib/market-impact/snapshot';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await getMarketSnapshot(), {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
  });
}
