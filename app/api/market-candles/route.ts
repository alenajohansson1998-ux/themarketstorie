import { NextResponse } from "next/server";
import { fetchCandles, MarketTimeframe, toDisplaySymbol } from "@/lib/finnhub";

export const dynamic = "force-dynamic";

const TIMEFRAMES: MarketTimeframe[] = ["5M", "15M", "1H", "1D", "1W", "1M", "1Y"];

function isTimeframe(value: string): value is MarketTimeframe {
  return TIMEFRAMES.includes(value as MarketTimeframe);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbolParam = url.searchParams.get("symbol");
  const timeframeParam = (url.searchParams.get("timeframe") || "1M").toUpperCase();

  if (!symbolParam) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  if (!isTimeframe(timeframeParam)) {
    return NextResponse.json(
      { error: "Invalid timeframe. Use 5M, 15M, 1H, 1D, 1W, 1M, or 1Y." },
      { status: 400 }
    );
  }

  const symbol = toDisplaySymbol(decodeURIComponent(symbolParam).toUpperCase());

  try {
    const candles = await fetchCandles(symbol, timeframeParam);
    return NextResponse.json({ candles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load candles";
    return NextResponse.json({ error: message, candles: [] }, { status: 500 });
  }
}
