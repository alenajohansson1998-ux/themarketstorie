import type { Metadata } from "next";
import MarketChart from "@/components/MarketChart";
import MarketHeader from "@/components/MarketHeader";
import MarketNews from "@/components/MarketNews";
import {
  fetchMarketPageData,
  toDisplaySymbol,
} from "@/lib/finnhub";

interface MarketPageProps {
  params: Promise<{ symbol: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: MarketPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const symbol = toDisplaySymbol(decodeURIComponent(resolvedParams.symbol).toUpperCase());
  return {
    title: `${symbol} Market Stats | The Market Stories`,
    description: `Live market data, interactive chart, and latest news for ${symbol}.`,
  };
}

export default async function MarketDetailPage({ params }: MarketPageProps) {
  const resolvedParams = await params;
  const symbol = toDisplaySymbol(decodeURIComponent(resolvedParams.symbol).toUpperCase());
  const data = await fetchMarketPageData(symbol, "1M");

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      {data.partial ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Some Finnhub endpoints are restricted for this symbol or plan. Showing available data.
        </section>
      ) : null}
      <MarketHeader symbol={symbol} profile={data.profile} quote={data.quote} />
      <MarketChart symbol={symbol} initialData={data.candles} initialTimeframe="1M" />
      <MarketNews news={data.news} />
    </main>
  );
}
