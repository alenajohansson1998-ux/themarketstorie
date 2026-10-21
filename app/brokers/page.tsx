"use client";
import { useEffect, useMemo, useState } from "react";
import BrokerCard from "@/components/BrokerCard";
import BrokerGuides from "@/components/BrokerGuides";

interface Broker {
  _id: string;
  name: string;
  slug?: string;
  logoUrl: string;
  rating: number;
  ratingText: string;
  assets: string;
  reviews: number;
  accounts: string;
  badge?: string;
  description?: string;
  terms?: string;
  website?: string;
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Split "Stocks, Forex & Futures" into ["Stocks", "Forex", "Futures"]. */
function assetTags(assets: string) {
  return assets
    .split(/,|&|\/|\band\b/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

const ALL = "All brokers";

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [filter, setFilter] = useState(ALL);

  useEffect(() => {
    fetch("/api/admin/brokers")
      .then((res) => res.json())
      .then((data) => {
        setBrokers(Array.isArray(data.brokers) ? data.brokers : []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  // Filters come from the brokers' own asset lists, so every option returns results.
  const filters = useMemo(() => {
    const counts = new Map<string, number>();
    brokers.forEach((broker) => {
      new Set(assetTags(broker.assets || "")).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });
    return [ALL, ...Array.from(counts.keys()).sort()];
  }, [brokers]);

  const visible =
    filter === ALL ? brokers : brokers.filter((broker) => assetTags(broker.assets || "").includes(filter));

  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <header className="mx-auto max-w-2xl text-center">
        <p className="section-label">Brokers</p>
        <h1 className="mt-1 text-title1 text-ink sm:text-display">Compare trading brokers</h1>
        <p className="mt-4 text-title3 font-normal text-ink-2">
          Ratings, assets, account numbers and offers from the brokers we review.
        </p>
      </header>

      {filters.length > 2 ? (
        <div className="mt-8 flex justify-center">
          <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
            <div role="group" aria-label="Filter by asset" className="inline-flex min-w-max gap-0.5 rounded-control bg-fill p-1">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                  className={`inline-flex h-9 items-center whitespace-nowrap rounded-md px-4 text-subhead font-medium transition-colors ${
                    filter === item ? "bg-canvas text-ink shadow-sm" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <section aria-label="Brokers" className="mx-auto mt-10 max-w-4xl">
        <p className="sr-only" aria-live="polite">
          {status === "ready" ? `${visible.length} brokers shown` : ""}
        </p>
        {status === "loading" ? (
          <div className="space-y-6" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-media bg-surface" />
            ))}
          </div>
        ) : status === "error" ? (
          <p className="text-center text-body text-ink-2">Brokers didn’t load. Refresh the page to try again.</p>
        ) : visible.length === 0 ? (
          <p className="text-center text-body text-ink-2">No brokers match this filter.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {visible.map((broker) => (
              <BrokerCard
                key={broker._id}
                name={broker.name}
                logo={broker.logoUrl}
                rating={broker.rating}
                ratingText={broker.ratingText}
                assets={broker.assets}
                reviews={broker.reviews}
                accounts={broker.accounts}
                badge={broker.badge}
                description={broker.description}
                terms={broker.terms}
                detailUrl={`/brokers/${broker.slug || slugify(broker.name)}`}
                websiteUrl={broker.website || undefined}
              />
            ))}
          </div>
        )}
      </section>

      <BrokerGuides />

      <section className="article-body mx-auto mt-16 border-t border-line-soft pt-8">
        <h2>How to choose a broker</h2>
        <p>
          Compare regulation, the assets you want to trade, fees and the platform you’ll use every day. Our reviews
          list each broker’s ratings, tradable assets and account numbers so you can compare them side by side. We
          update reviews regularly.
        </p>
      </section>
    </div>
  );
}
