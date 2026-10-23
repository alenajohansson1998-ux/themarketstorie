import { NextRequest, NextResponse } from 'next/server';
import { getRadarHistory, RadarHistoryInputError } from '@/lib/market-impact/reaction';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  try {
    const history = await getRadarHistory(params.get('symbol') ?? 'SPY', params.get('eventAt'));
    return NextResponse.json(history, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    });
  } catch (error) {
    if (error instanceof RadarHistoryInputError) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json({ error: 'Historical observations are temporarily unavailable.' }, { status: 503 });
  }
}
