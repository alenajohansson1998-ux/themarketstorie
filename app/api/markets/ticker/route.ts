import { NextResponse } from 'next/server';

// CoinDesk API endpoint for market data (cryptocurrencies)
const COINDESK_API_URL = 'https://api.coindesk.com/v1/bpi/currentprice.json';

// Fallback: CoinGecko API (no API key required, public)
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';

export async function GET() {
  try {
    // Try CoinDesk first
    const coindeskRes = await fetch(COINDESK_API_URL, {
      headers: {
        'Authorization': `Bearer ${process.env.COINDESK_API_KEY}`,
      },
      next: { revalidate: 60 }, // cache for 1 min
    });
    if (coindeskRes.ok) {
      const data = await coindeskRes.json();
      // CoinDesk returns only BTC, so fallback to CoinGecko for more assets
      // If you want only BTC, you can use this block
      if (data?.bpi?.USD) {
        return NextResponse.json([
          {
            symbol: 'BTC',
            price: data.bpi.USD.rate_float,
            change24h: null, // Not available from CoinDesk
          },
        ]);
      }
    }
  } catch (e) {
    // Ignore and fallback
  }

  // Fallback: CoinGecko (top 10 cryptos)
  try {
    const cgRes = await fetch(COINGECKO_API_URL, { next: { revalidate: 60 } });
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      const mapped = cgData.map((item: any) => ({
        symbol: item.symbol.toUpperCase(),
        price: item.current_price,
        change24h: item.price_change_percentage_24h,
        iconUrl: item.image,
      }));
      return NextResponse.json(mapped);
    }
  } catch (e) {
    // Ignore
  }

  return NextResponse.json([], { status: 500 });
}
