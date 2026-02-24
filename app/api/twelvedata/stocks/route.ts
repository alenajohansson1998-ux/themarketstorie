import { NextResponse } from "next/server";

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];

export async function GET() {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  const symbols = SYMBOLS.join(",");
  const url = `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.code && data.message) {
    return NextResponse.json({ error: data.message }, { status: 429 });
  }

  const result = Object.values(data)
    .filter((item: any) => item && item.symbol)
    .map((item: any) => ({
      ticker: item.symbol,
      price: parseFloat(item.close),
      todaysChangePerc: parseFloat(item.percent_change),
    }));

  return NextResponse.json(result);
}
