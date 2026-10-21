"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import type { FinnhubCompanyProfile, FinnhubQuote } from "@/lib/finnhub";

interface MarketHeaderProps {
  symbol: string;
  profile: FinnhubCompanyProfile;
  quote: FinnhubQuote;
}

const WATCHLIST_STORAGE_KEY = "market-watchlist-v1";

function formatPrice(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function signed(value: number, digits = 2) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(digits)}`;
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

  const up = quote.d >= 0;

  return (
    <header className="flex flex-col gap-5 border-b border-line-soft pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="section-label">
          {symbol}
          {profile.exchange ? ` · ${profile.exchange}` : ""}
        </p>
        <h1 className="mt-1 text-title1 text-ink">{profile.name || symbol}</h1>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums">
          <p className="text-display text-ink">{formatPrice(quote.c)}</p>
          <p className={`text-headline ${up ? "text-up" : "text-down"}`}>
            {signed(quote.d)} ({signed(quote.dp)}%)
            <span className="sr-only">{up ? " up" : " down"} today</span>
          </p>
        </div>
        {profile.finnhubIndustry ? <p className="mt-1 text-footnote text-ink-2">{profile.finnhubIndustry}</p> : null}
      </div>

      <button
        type="button"
        onClick={toggleWatchlist}
        disabled={!isReady}
        aria-pressed={isWatched}
        className={`inline-flex h-11 items-center gap-2 self-start rounded-control px-4 text-headline transition-colors md:self-auto ${
          isWatched ? "bg-tint/10 text-tint hover:bg-tint/15" : "bg-fill text-ink hover:bg-fill-2"
        }`}
      >
        <Star className={`h-4 w-4 ${isWatched ? "fill-current" : ""}`} aria-hidden="true" />
        {isWatched ? "In watchlist" : "Add to watchlist"}
      </button>
    </header>
  );
}
