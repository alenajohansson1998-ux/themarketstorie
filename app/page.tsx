'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';


import MarketOverview from '../components/MarketOverview';
import { PopularScreens } from '../components/popular-screens';
import TradingViewChart from '../components/news-section';
import { AnalysisOpinionSection } from '../components/analysis-opinion';
import HomeBodyLayout from '../components/HomeBodyLayout';
import HomeTopNewsGrid from '../components/HomeTopNewsGrid';
import NewsCategoryGrid from '../components/NewsCategoryGrid';
import StockMarketsCategoryGrid from '../components/StockMarketsCategoryGrid';
import TickerBarClientWrapper from '../components/TickerBarClientWrapper';
import HeroBanner from '../components/HeroBanner';
import FeaturedAiArticlesSection from '../components/FeaturedAiArticlesSection';
import WorldMarketHeatMapSection from '../components/WorldMarketHeatMapSection';


import React, { useEffect, useState } from 'react';
import Head from "next/head";


export default function Home() {
  const { data: session, status } = useSession();

  // Fetch news posts for NewsCategoryGrid
  const [newsPosts, setNewsPosts] = useState([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/cms/posts?publicationStatus=published&category=news&limit=6&sortBy=-createdAt');
        const data = await res.json();
        if (data.success) {
          setNewsPosts(data.data);
        }
      } catch {
        setNewsPosts([]);
      }
    }
    fetchNews();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <link rel="canonical" href="https://themarketstories.com/" />
      </Head>
      <div className="min-h-screen flex flex-col custom-scrollbar">
        <main className="flex-1 w-full bg-gray-50 pb-4 pt-0 sm:pb-6">
          {/* Hero Banner at the very top */}
          <HeroBanner />
          {/* Add ticker bar directly after hero banner, before all main content */}
          <TickerBarClientWrapper />
          <FeaturedAiArticlesSection />
          <div className="site-shell w-full px-4 md:px-6 xl:px-8">
            {/* SEO H1 Heading */}
            <div className="mt-5 w-full sm:mt-6">
              <h1 className="mb-4 text-center text-3xl font-extrabold tracking-tight text-black drop-shadow-sm sm:text-4xl">
                Smart Market Insights for Investors, Traders & Analysts
              </h1>
            </div>
            {/* Top News Grid Section */}
            <div className="w-full rounded-2xl border-b border-gray-200 bg-white py-4 shadow-sm sm:py-6">
              <div className="w-full px-4 md:px-6">
                <h2 className="mb-4 text-xl font-bold tracking-tight text-black sm:text-2xl">Today&apos;s Top Market Stories</h2>
                <HomeTopNewsGrid />
                <p className="mt-4 text-base text-gray-700 w-full text-left">
                  TheMarketStories is a trusted financial news platform offering live stock market updates, in-depth market analysis, and real-time insights across global and Indian markets. We cover equities, cryptocurrencies, commodities, economic events, and technical analysis to help traders and investors understand market movements and identify opportunities with confidence.
                </p>
              </div>
            </div>
            <WorldMarketHeatMapSection />
            <div className="w-full mt-8">
              <HomeBodyLayout>
              {/* News Section */}
              <section className="mb-12">
                <h2 className="mb-4 text-xl font-bold text-black sm:text-2xl">Live Stock Market Charts & Technical Analysis</h2>
                <TradingViewChart />
              </section>
              <div className="border-b border-gray-300 my-8"></div>
              {/* Stock Markets Category Grid */}
              <section className="mb-12">
                <h2 className="mb-4 text-xl font-bold text-black sm:text-2xl">Latest Stock Market News</h2>
                <p className="seo-subtext mb-6">
                  Breaking updates, market-moving headlines, and real-time stock market developments.
                </p>
                <StockMarketsCategoryGrid />
              </section>
              <div className="border-b border-gray-300 my-8"></div>
              {/* Markets Overview */}
              <section className="mb-12">
                <h2 className="mb-4 text-xl font-bold text-black sm:text-2xl">Market Performance Overview</h2>
                <p className="seo-text mb-6">
                  Track real-time market performance across global stock indices, commodities, and cryptocurrencies. This section provides live prices, daily changes, and percentage movements to help investors quickly assess overall market trends and identify key opportunities across major asset classes.
                </p>
                <MarketOverview />
              </section>
              <div className="border-b border-gray-300 my-8"></div>
              {/* News Category Grid */}
              <section className="mb-12">
                <NewsCategoryGrid posts={newsPosts} />
              </section>
              <div className="border-b border-gray-300 my-8"></div>
              {/* Popular Screens */}
              <section className="mb-12">
                <PopularScreens />
              </section>
              <div className="border-b border-gray-300 my-8"></div>
              {/* Analysis & Opinion */}
              <section className="mb-12">
                <h2 className="mb-4 text-xl font-bold text-black sm:text-2xl">Market Analysis & Expert Opinions</h2>
                <AnalysisOpinionSection />
              </section>
              <div className="border-b border-gray-300 my-8"></div>
              {/* Personalized/Welcome Section */}
              <section className="mb-12">
                {session ? (
                  <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-black mb-4 tracking-tight">
                      Welcome back, <span className="text-black underline underline-offset-4">{session.user?.name}</span>!
                    </h2>
                    <p className="text-lg text-gray-800 mb-8">
                      You&apos;re logged in as a <span className="font-semibold text-black underline underline-offset-4">{session.user?.role}</span>
                    </p>
                    {session.user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors shadow"
                      >
                        Go to Admin Dashboard
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-black mb-4 tracking-tight">
                      Stay Informed with <span className="text-black underline underline-offset-4">NewsDay</span>
                    </h2>
                    <p className="text-lg text-gray-800 mb-8">
                      Get the latest news, updates, and insights delivered to you.
                    </p>
                  </div>
                )}
              </section>
              </HomeBodyLayout>
            </div>
          </div>
        </main>
      {/* Custom Scrollbar Style */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          background: #f3f4f6;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
    </>
  );
}

