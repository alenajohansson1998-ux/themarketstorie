import { NextResponse } from 'next/server';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';

export async function GET(req: Request) {
  const url = new URL(req.url, 'http://localhost');
  const limit = url.searchParams.get('limit') || '10';
  try {
    const cgRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      { next: { revalidate: 60 } }
    );
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      return NextResponse.json(cgData);
    }
  } catch (e) {
    // Ignore
  }
  return NextResponse.json([], { status: 500 });
}
