"use client";

import useSWR from "swr";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

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
    <section>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-[#c9a96e]" />
        <p className="section-label">Trending Now</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#0d1117] border border-[#1e2535] rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#1e2535]" />
                <div className="h-4 w-16 bg-[#1e2535] rounded" />
              </div>
              <div className="h-5 w-20 bg-[#1e2535] rounded mb-1" />
              <div className="h-3 w-12 bg-[#1e2535] rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {coins.map(({ item }) => {
            const change = item.data?.price_change_percentage_24h?.usd;
            const isPos = (change ?? 0) >= 0;
            const fromId = item.id;
            const toId = "usd";

            return (
              <Link
                key={item.coin_id}
                href={`/crypto-converter/${fromId}-to-${toId}`}
                className="bg-[#0d1117] border border-[#1e2535] hover:border-[#2a3045] rounded-xl p-4 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  {item.thumb && (
                    <img src={item.thumb} alt={item.name} className="w-6 h-6 rounded-full" />
                  )}
                  <span className="text-white text-sm font-semibold group-hover:text-[#c9a96e] transition-colors">
                    {item.symbol.toUpperCase()}
                  </span>
                  {item.market_cap_rank && (
                    <span className="ml-auto text-[10px] text-gray-600">#{item.market_cap_rank}</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs truncate">{item.name}</p>
                {change !== undefined && (
                  <p className={`text-xs font-medium mt-1 ${isPos ? "text-green-400" : "text-red-400"}`}>
                    {isPos ? "+" : ""}{change.toFixed(2)}%
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
