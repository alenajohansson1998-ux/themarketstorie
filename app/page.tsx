'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';


// MarketOverview component removed
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
          <div className="site-container">
            {/* SEO H1 Heading */}
            <div className="mt-5 w-full sm:mt-6">
              <h1 className="mb-4 text-center text-3xl font-black tracking-tight text-[#17130f] drop-shadow-sm sm:text-4xl">
                Smart Market Insights for Investors, Traders & Analysts
              </h1>
            </div>
            {/* Top News Grid Section */}
            <div className="w-full rounded-2xl border-b border-gray-200 bg-white py-4 shadow-sm sm:py-6">
              <div className="w-full px-4 md:px-6">
                <p className="section-label">Top Stories</p>
                <h2 className="mt-1 mb-4 text-2xl font-black tracking-tight text-[#17130f] sm:text-3xl">Today&apos;s Top Market Stories</h2>
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
                <p className="section-label">Markets</p>
                <h2 className="mt-1 mb-4 text-2xl font-black tracking-tight text-[#17130f] sm:text-3xl">Live Stock Market Charts & Technical Analysis</h2>
                <TradingViewChart />
              </section>
              <div className="border-b border-gray-300 my-8"></div>
              {/* Stock Markets Category Grid */}
              <section className="mb-12">
                <p className="section-label">Stock Markets</p>
                <h2 className="mt-1 mb-4 text-2xl font-black tracking-tight text-[#17130f] sm:text-3xl">Latest Stock Market News</h2>
                <p className="seo-subtext mb-6">
                  Breaking updates, market-moving headlines, and real-time stock market developments.
                </p>
                <StockMarketsCategoryGrid />
              </section>
              <div className="border-b border-gray-300 my-8"></div>
              {/* Markets Overview removed per request */}
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
                <p className="section-label">Analysis</p>
                <h2 className="mt-1 mb-4 text-2xl font-black tracking-tight text-[#17130f] sm:text-3xl">Market Analysis & Expert Opinions</h2>
                <AnalysisOpinionSection />
              </section>
              <div className="border-b border-gray-300 my-8"></div>
              {/* Personalized/Welcome Section */}
              <section className="mb-12">
                {session ? (
                  <div className="text-center">
                    <p className="section-label">Community</p>
                    <h2 className="mt-1 text-3xl font-black text-[#17130f] mb-4 tracking-tight">
                      Welcome back, <span className="text-[#17130f] underline underline-offset-4">{session.user?.name}</span>!
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
                    <p className="section-label">Community</p>
                    <h2 className="mt-1 text-3xl font-black text-[#17130f] mb-4 tracking-tight">
                      Stay Informed with <span className="text-[#17130f] underline underline-offset-4">NewsDay</span>
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

