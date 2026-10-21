import type { Metadata } from "next";
import MarketChart from "@/components/MarketChart";
import MarketHeader from "@/components/MarketHeader";
import MarketNews from "@/components/MarketNews";
import { pageMetadata } from "@/lib/seo/metadata";
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
  return pageMetadata({
    title: `${symbol} Market Data and News`,
    description: `Market profile, chart and related financial news for ${symbol}. Market data may be delayed.`,
    path: `/markets/${encodeURIComponent(symbol)}`,
  });
}

export default async function MarketDetailPage({ params }: MarketPageProps) {
  const resolvedParams = await params;
  const symbol = toDisplaySymbol(decodeURIComponent(resolvedParams.symbol).toUpperCase());
  const data = await fetchMarketPageData(symbol, "1M");

  return (
    <div className="site-container space-y-10 px-4 py-10 md:px-6 lg:py-12">
      {data.partial ? (
        <p role="status" className="rounded-control bg-surface px-4 py-3 text-subhead text-ink-2">
          Some details aren’t available for this symbol, so you’re seeing what we have.
        </p>
      ) : null}
      <MarketHeader symbol={symbol} profile={data.profile} quote={data.quote} />
      <MarketChart symbol={symbol} initialData={data.candles} initialTimeframe="1M" />
      <MarketNews news={data.news} />
    </div>
  );
}
