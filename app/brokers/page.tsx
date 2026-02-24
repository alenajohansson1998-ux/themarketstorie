"use client";

import { useEffect, useState } from "react";
import BrokerCard from "@/components/BrokerCard";
import BlogCarousel from "@/components/BlogCarousel";
import { useBrokerCategoryPosts } from "@/lib/useBrokerCategoryPosts";

interface Broker {
  _id: string;
  name: string;
  logoUrl: string;
  rating: number;
  ratingText: string;
  assets: string;
  reviews: number;
  accounts: string;
  badge?: string;
  description?: string;
}

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const { posts: blogPosts, isLoading: blogLoading } = useBrokerCategoryPosts();

  useEffect(() => {
    fetch("/api/admin/brokers")
      .then((res) => res.json())
      .then((data) => {
        setBrokers(data.brokers || []);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex-1 w-full bg-white text-black">
      {/* HERO */}
      <section className="w-full max-w-7xl mx-auto px-4 pt-24 pb-20 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-black leading-tight">
            Trade with confidence
          </h1>

          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Get trading with verified brokers today.
          </p>

          {/* FILTER PILLS */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              "All brokers",
              "Stocks",
              "Forex",
              "Futures",
              "Options",
            ].map((item, i) => (
              <button
                key={item}
                className={`px-4 py-2 rounded-full text-sm border transition ${
                  i === 0
                    ? "bg-black text-white border-black"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* LIST */}
        <section className="max-w-7xl mx-auto px-4 pb-20">
          {/* SEO H1 */}
          <h1 className="sr-only">Broker List</h1>

          <div className="flex flex-col gap-8">
            {loading ? (
              <div className="text-center text-gray-500 py-24 text-lg">
                Loading brokers…
              </div>
            ) : brokers.length === 0 ? (
              <div className="text-center text-gray-500 py-24 text-lg">
                No brokers found.
              </div>
            ) : (
              brokers.map((broker) => (
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
                  ctaUrl={`/brokers/${broker.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "")}`}
                />
              ))
            )}
          </div>

          {/* SEO CONTENT */}
          <div className="mt-24 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-3">
              How to Choose the Best Broker
            </h2>

            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Broker Comparison & Reviews
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Our comprehensive broker comparison and review section helps you make
              informed decisions by providing detailed insights into each broker’s
              offerings, reputation, and user experiences. Explore ratings,
              account types, supported assets, and more to find the best fit for
              your trading needs. We regularly update our reviews to ensure you
              have access to the latest information and expert recommendations.
            </p>
          </div>
        </section>
      </main>
    );
}

