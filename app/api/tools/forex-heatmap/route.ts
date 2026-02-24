import { NextResponse } from 'next/server';
import { getForexMatrix } from '@/lib/forex/fetchRates';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url, 'http://localhost');
    const filter = url.searchParams.get('filter') || '1D';
    const matrix = await getForexMatrix(filter);
    return NextResponse.json({ matrix });
  } catch (err: any) {
    console.error('Forex Heatmap API error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
