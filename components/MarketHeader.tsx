"use client";

import { useEffect, useMemo, useState } from "react";
import type { FinnhubCompanyProfile, FinnhubQuote } from "@/lib/finnhub";

interface MarketHeaderProps {
  symbol: string;
  profile: FinnhubCompanyProfile;
  quote: FinnhubQuote;
}

const WATCHLIST_STORAGE_KEY = "market-watchlist-v1";

function formatPrice(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function MarketHeader({ symbol, profile, quote }: MarketHeaderProps) {
  const [isWatched, setIsWatched] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      const parsed = saved ? (JSON.parse(saved) as string[]) : [];
      setIsWatched(parsed.includes(symbol));
    } catch (error) {
      console.error("Failed to read watchlist from localStorage", error);
    } finally {
      setIsReady(true);
    }
  }, [symbol]);

  const toggleWatchlist = () => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      const parsed = saved ? (JSON.parse(saved) as string[]) : [];
      const exists = parsed.includes(symbol);
      const next = exists ? parsed.filter((item) => item !== symbol) : [...parsed, symbol];
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
      setIsWatched(!exists);
    } catch (error) {
      console.error("Failed to update watchlist", error);
    }
  };

  const changeClass = useMemo(
    () => (quote.d >= 0 ? "text-emerald-600" : "text-red-600"),
    [quote.d]
  );

  const changePrefix = quote.d >= 0 ? "+" : "";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            {profile.name || symbol}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {symbol} {profile.exchange ? `- ${profile.exchange}` : ""}
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="text-3xl font-semibold text-gray-900">{formatPrice(quote.c)}</p>
            <p className={`text-sm font-semibold ${changeClass}`}>
              {changePrefix}
              {quote.d.toFixed(2)} ({changePrefix}
              {quote.dp.toFixed(2)}%)
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <p className="text-sm text-gray-500">
            Industry: {profile.finnhubIndustry || "Not available"}
          </p>
          <button
            type="button"
            onClick={toggleWatchlist}
            disabled={!isReady}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              isWatched
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isWatched ? "In Watchlist" : "Add to Watchlist"}
          </button>
        </div>
      </div>
    </section>
  );
}
