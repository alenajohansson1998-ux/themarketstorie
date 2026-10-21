import type { Metadata } from 'next';
import Link from 'next/link';
import { PopularScreens } from '../components/popular-screens';
import TradingViewChart from '../components/news-section';
import { AnalysisOpinionSection } from '../components/analysis-opinion';
import HomeTopNewsGrid from '../components/HomeTopNewsGrid';
import NewsCategoryGrid from '../components/NewsCategoryGrid';
import StockMarketsCategoryGrid from '../components/StockMarketsCategoryGrid';
import HeroBanner from '../components/HeroBanner';
import FeaturedAiArticlesSection from '../components/FeaturedAiArticlesSection';
import LazyMount from '../components/LazyMount';
import { getHeaderCategories, listArticles, listPosts } from '@/lib/server/content';
import { pageMetadata } from '@/lib/seo/metadata';
import { JsonLd, organizationSchema, webPageSchema, websiteSchema } from '@/lib/seo/jsonld';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  EDITORIAL_POLICY_PATH,
  ORGANIZATION_ID,
  RISK_DISCLOSURE_PATH,
} from '@/lib/seo/site';

// The homepage is rebuilt at most every five minutes.
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: DEFAULT_TITLE,
  absoluteTitle: true,
  description: DEFAULT_DESCRIPTION,
  path: '/',
  image: DEFAULT_OG_IMAGE,
});

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

const LEARN_LINKS = [
  { title: 'Trading and investing basics', description: 'Fifteen short lessons, from how markets work to reading financial statements.', href: '/learn' },
  { title: 'Risk management', description: 'Why protecting capital comes first, and the principles traders use.', href: '/learn#risk-management' },
  { title: 'Crypto converter', description: 'Convert 65+ cryptocurrencies into 30+ currencies at live prices.', href: '/crypto-converter' },
  { title: 'Forex heatmap', description: 'See which major currencies are strengthening or weakening.', href: '/tools/forex-heatmap' },
];

export default async function Home() {
  const [trending, latest, aiArticles, stockMarkets, news, analysis, sections] = await Promise.all([
    listPosts({ trending: true, limit: 10 }),
    listPosts({ limit: 7 }),
    listArticles({ aiOnly: true, limit: 9 }),
    listPosts({ categorySlug: 'stock-markets', limit: 9 }),
    listPosts({ categorySlug: 'news', limit: 6 }),
    listPosts({ categorySlug: 'analysis--opinion', limit: 4 }),
    getHeaderCategories(),
  ]);

  return (
    <div className="pb-16">
      <JsonLd
        data={[
          organizationSchema(),
          websiteSchema(),
          webPageSchema({
            path: '/',
            name: DEFAULT_TITLE,
            description: DEFAULT_DESCRIPTION,
            extra: { about: { '@id': ORGANIZATION_ID } },
          }),
        ]}
      />

      <HeroBanner />

      <div className="site-container space-y-14 px-4 pt-12 md:px-6">
        <section aria-labelledby="top-stories">
          <SectionHeading
            id="top-stories"
            eyebrow="Top stories"
            title="Today’s top market stories"
            intro="Stock market updates, analysis and context across global and Indian markets: equities, crypto, commodities and the economy."
          />
          <HomeTopNewsGrid initialTrending={trending?.data as never} initialLatest={latest?.data as never} />
        </section>

        <FeaturedAiArticlesSection initialArticles={aiArticles?.data as never} />

        {sections.length > 0 ? (
          <section aria-labelledby="coverage" className="border-t border-line-soft pt-12">
            <SectionHeading id="coverage" eyebrow="Coverage" title="Browse by section" />
            <ul className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <li key={section._id}>
                  <Link
                    href={`/category/${section.slug}`}
                    className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-subhead font-medium text-ink transition-colors hover:bg-fill"
                  >
                    {section.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="markets-glance" className="border-t border-line-soft pt-12">
          <SectionHeading id="markets-glance" eyebrow="Markets" title="Markets at a glance" />
          <LazyMount minHeight={452} label="Market overview">
            <PopularScreens />
          </LazyMount>
        </section>

        <section aria-labelledby="stock-markets" className="border-t border-line-soft pt-12">
          <SectionHeading
            id="stock-markets"
            eyebrow="Stock markets"
            title="Latest stock market news"
            intro="Market-moving headlines and developments, as they happen."
          />
          <StockMarketsCategoryGrid initialPosts={stockMarkets?.data as never} />
        </section>

        <section aria-labelledby="news" className="border-t border-line-soft pt-12">
          <SectionHeading id="news" eyebrow="News" title="Business and world news" />
          <NewsCategoryGrid posts={(news?.data ?? []) as never} />
        </section>

        <section aria-labelledby="analysis" className="border-t border-line-soft pt-12">
          <SectionHeading id="analysis" eyebrow="Analysis" title="Market analysis and opinion" />
          <AnalysisOpinionSection initialPosts={analysis?.data as never} />
        </section>

        <section aria-labelledby="live-chart" className="border-t border-line-soft pt-12">
          <SectionHeading
            id="live-chart"
            eyebrow="Charts"
            title="Live chart and technical analysis"
            intro="Search any symbol and add indicators. Charts by TradingView."
          />
          <LazyMount minHeight={460} label="Live chart">
            <TradingViewChart height={460} />
          </LazyMount>
        </section>

        <section aria-labelledby="learn-tools" className="border-t border-line-soft pt-12">
          <SectionHeading id="learn-tools" eyebrow="Learn" title="Learn the basics and use our tools" />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEARN_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block h-full rounded-card bg-surface p-5 transition-colors hover:bg-fill">
                  <span className="block text-headline text-ink">{item.title}</span>
                  <span className="mt-1 block text-subhead text-ink-2">{item.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="about-us" className="border-t border-line-soft pt-12">
          <div className="max-w-3xl">
            <p className="section-label">About us</p>
            <h2 id="about-us" className="mt-1 text-title2 text-ink">
              About The Market Stories
            </h2>
            <p className="mt-3 text-body text-ink-2">
              The Market Stories is a digital publication covering global and Indian financial markets,
              business, the economy, technology and cryptocurrencies. We publish news and analysis for information and
              education. Nothing we publish is financial advice.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-subhead">
              <li>
                <Link href="/about" className="inline-flex min-h-11 items-center font-medium text-tint hover:underline">
                  About us
                </Link>
              </li>
              <li>
                <Link href={EDITORIAL_POLICY_PATH} className="inline-flex min-h-11 items-center font-medium text-tint hover:underline">
                  Editorial policy
                </Link>
              </li>
              <li>
                <Link href={RISK_DISCLOSURE_PATH} className="inline-flex min-h-11 items-center font-medium text-tint hover:underline">
                  Risk disclosure
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex min-h-11 items-center font-medium text-tint hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
