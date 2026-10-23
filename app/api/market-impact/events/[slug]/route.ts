import { NextResponse } from 'next/server';
import { getRadarEvent } from '@/lib/market-impact/server';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!/^[a-z0-9][a-z0-9-]{0,119}$/.test(slug)) return NextResponse.json({ error: 'Invalid event slug' }, { status: 400 });
  const event = await getRadarEvent(slug);
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  return NextResponse.json({ event }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}
