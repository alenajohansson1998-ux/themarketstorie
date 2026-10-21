"use client";

import useSWR from "swr";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import SafeImage from '@/components/SafeImage';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    price_btc: number;
    data?: {
      price_change_percentage_24h?: { usd?: number };
      price?: string;
    };
  };
}

export default function TrendingSection() {
  const { data, isLoading } = useSWR("/api/crypto/trending", fetcher, {
    refreshInterval: 300_000,
  });

  const coins: TrendingCoin[] = data?.coins?.slice(0, 8) ?? [];

  return (
    <section aria-labelledby="trending-coins">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp size={18} className="text-ink-2" aria-hidden="true" />
        <h2 id="trending-coins" className="text-headline text-ink">
          Trending coins
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-card bg-surface" />
          ))}
        </div>
      ) : coins.length === 0 ? (
        <p className="text-subhead text-ink-2">Trending coins are unavailable right now.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {coins.map(({ item }) => {
            const change = item.data?.price_change_percentage_24h?.usd;
            const isPos = (change ?? 0) >= 0;
            return (
              <li key={item.coin_id}>
                <Link
                  href={`/crypto-converter/${item.id}-to-usd`}
                  className="group block h-full rounded-card bg-surface p-4 transition-colors hover:bg-fill"
                >
                  <div className="flex items-center gap-2">
                    {item.thumb ? (
                      <SafeImage src={item.thumb} alt="" className="h-6 w-6 rounded-full" />
                    ) : null}
                    <span className="text-subhead font-semibold text-ink">{item.symbol.toUpperCase()}</span>
                    {item.market_cap_rank ? (
                      <span className="ml-auto text-caption text-ink-2">#{item.market_cap_rank}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-footnote text-ink-2">{item.name}</p>
                  {change !== undefined ? (
                    <p className={`mt-1 text-footnote font-medium tabular-nums ${isPos ? "text-up" : "text-down"}`}>
                      {isPos ? "+" : "−"}
                      {Math.abs(change).toFixed(2)}%
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
