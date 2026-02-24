import { NextResponse } from "next/server";

const SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "META", "AMD", "AMZN"];

export async function GET() {
  const quotes = await Promise.all(
    SYMBOLS.map(async (symbol) => {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
      );
      const q = await res.json();

      return {
        symbol,
        price: q.c,
        change: q.dp,
      };
    })
  );

  const gainers = quotes
    .filter(q => q.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 5);

  const losers = quotes
    .filter(q => q.change < 0)
    .sort((a, b) => a.change - b.change)
    .slice(0, 5);

  return NextResponse.json({ gainers, losers });
}
