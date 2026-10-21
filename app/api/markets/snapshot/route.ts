import { NextResponse } from "next/server";
import { DEFAULT_TICKER_SYMBOLS, fetchTickerSnapshot } from "@/lib/finnhub";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await fetchTickerSnapshot(DEFAULT_TICKER_SYMBOLS);

  return NextResponse.json(snapshot, {
    headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=30" },
  });
}
