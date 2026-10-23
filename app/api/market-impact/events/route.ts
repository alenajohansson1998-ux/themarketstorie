import { NextRequest, NextResponse } from 'next/server';
import { getRadarFeed } from '@/lib/market-impact/server';
import { eventQuerySchema, queryRadarEvents } from '@/lib/market-impact/query';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const parsed = eventQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid event filters', issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  const feed = await getRadarFeed();
  return NextResponse.json({ ...feed, ...queryRadarEvents(feed.events, parsed.data) }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
