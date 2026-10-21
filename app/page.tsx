'use client';

import React, { useEffect, useState } from 'react';
import { PopularScreens } from '../components/popular-screens';
import TradingViewChart from '../components/news-section';
import { AnalysisOpinionSection } from '../components/analysis-opinion';
import HomeTopNewsGrid from '../components/HomeTopNewsGrid';
import NewsCategoryGrid from '../components/NewsCategoryGrid';
import StockMarketsCategoryGrid from '../components/StockMarketsCategoryGrid';
import HeroBanner from '../components/HeroBanner';
import FeaturedAiArticlesSection from '../components/FeaturedAiArticlesSection';

function SectionHeading({ id, eyebrow, title, intro }: { id: string; eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="section-label">{eyebrow}</p>
      <h2 id={id} className="mt-1 text-title2 text-ink sm:text-title1">
        {title}
      </h2>
      {intro ? <p className="mt-2 text-body text-ink-2">{intro}</p> : null}
    </div>
  );
}

export default function Home() {
  const [newsPosts, setNewsPosts] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/cms/posts?publicationStatus=published&category=news&limit=6&sortBy=-createdAt');
        const data = await res.json();
        if (data.success) setNewsPosts(data.data);
      } catch {
        setNewsPosts([]);
      } finally {
        setNewsLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <div className="pb-16">
      <HeroBanner />

      <div className="site-container space-y-14 px-4 pt-12 md:px-6">
        <section aria-labelledby="top-stories">
          <SectionHeading
            id="top-stories"
            eyebrow="Top stories"
            title="Today’s top market stories"
            intro="Live stock market updates, analysis and context across global and Indian markets: equities, crypto, commodities and the economy."
          />
          <HomeTopNewsGrid />
        </section>

        <FeaturedAiArticlesSection />

        <section aria-labelledby="markets-glance" className="border-t border-line-soft pt-12">
          <SectionHeading id="markets-glance" eyebrow="Markets" title="Markets at a glance" />
          <PopularScreens />
        </section>

        <section aria-labelledby="live-chart" className="border-t border-line-soft pt-12">
          <SectionHeading
            id="live-chart"
            eyebrow="Charts"
            title="Live chart and technical analysis"
            intro="Search any symbol and add indicators. Charts by TradingView."
          />
          <TradingViewChart height={460} />
        </section>

        <section aria-labelledby="stock-markets" className="border-t border-line-soft pt-12">
          <SectionHeading
            id="stock-markets"
            eyebrow="Stock markets"
            title="Latest stock market news"
            intro="Market-moving headlines and developments, as they happen."
          />
          <StockMarketsCategoryGrid />
        </section>

        <section aria-labelledby="news" className="border-t border-line-soft pt-12">
          <SectionHeading id="news" eyebrow="News" title="Business and world news" />
          <NewsCategoryGrid posts={newsPosts} loading={newsLoading} />
        </section>

        <section aria-labelledby="analysis" className="border-t border-line-soft pt-12">
          <SectionHeading id="analysis" eyebrow="Analysis" title="Market analysis and expert opinion" />
          <AnalysisOpinionSection />
        </section>
      </div>
    </div>
  );
}
