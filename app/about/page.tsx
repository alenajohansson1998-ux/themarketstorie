import type { Metadata } from 'next';
import Link from 'next/link';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'About TheMarketStories | Global Financial News & Market Insights',
    description: 'TheMarketStories is a global financial news and market insights platform covering stocks, crypto, business, technology, and economic trends.',
    alternates: { canonical: '/about' },
  };
};

const COVERAGE = [
  { title: 'Stocks and equities', body: 'Daily price moves, earnings seasons, index performance and long-term trends across global exchanges.' },
  { title: 'Crypto and blockchain', body: 'Bitcoin, Ethereum, altcoins, DeFi and the regulation that shapes digital assets, covered with the same rigour as traditional finance.' },
  { title: 'Economics and banking', body: 'Central bank decisions, interest rates, inflation data and the institutions that move the financial system.' },
  { title: 'Commodities and forex', body: 'Oil, gold, silver and agricultural markets, alongside currency pairs and the macro forces behind them.' },
  { title: 'Technology and business', body: 'Corporate earnings, deals, start-up funding and the tech companies shaping markets and society.' },
  { title: 'Geopolitics and emerging markets', body: 'IPOs, emerging economies and the world events that always end up in the numbers.' },
];

// Statements of practice, not a sequence, so no numbering.
const PRINCIPLES = [
  {
    title: 'Independent editorial',
    body: 'Our newsroom operates independently. No advertiser, sponsor or investor influences what we publish or how we cover it.',
  },
  {
    title: 'Verified before published',
    body: 'Every claim is checked against sources before it goes live. We would rather be second and right than first and wrong.',
  },
  {
    title: 'Open about sponsorship',
    body: 'When content is paid for, we say so clearly. We never disguise advertising as editorial.',
  },
];

// Audience figures. Keep these in step with your analytics before publishing.
const FACTS = [
  { value: '500K+', label: 'Monthly readers' },
  { value: '120+', label: 'Countries reached' },
  { value: '40K+', label: 'Newsletter subscribers' },
  { value: '24/7', label: 'Market coverage' },
];

export default function AboutPage() {
  return (
    <div className="site-container px-4 md:px-6">
      <section className="border-b border-line-soft py-14 lg:py-20">
        <p className="section-label">About TheMarketStories</p>
        <h1 className="mt-3 max-w-4xl text-title1 text-ink sm:text-display lg:text-[3.75rem] lg:leading-[1.05]">
          We exist to make financial news <span className="font-serif italic font-normal text-ink-2">honest,</span> fast and
          genuinely useful.
        </h1>
      </section>

      <section className="grid grid-cols-1 gap-12 border-b border-line-soft py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <div className="max-w-[68ch] space-y-5 text-body text-ink-2 sm:text-title3 sm:font-normal">
          <h2 className="section-label">Who we are</h2>
          <p>
            TheMarketStories is a global financial news and market insights platform for investors, traders and anyone
            trying to understand what’s happening in the world economy.
          </p>
          <p>
            We cover stocks, crypto, business, technology, commodities and economic trends with clarity rather than
            sensationalism. Every story is written to help you make sense of the markets.
          </p>
          <p>
            We are independent. We aren’t backed by a bank, a brokerage or a hedge fund, so our only job is to inform
            you.
          </p>
          <p>
            Our team of financial journalists, market analysts and data journalists works around the clock so every
            story is accurate, timely and useful, from breaking earnings to long-form analysis.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 self-start rounded-media bg-surface p-8">
          {FACTS.map((fact) => (
            <div key={fact.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-footnote text-ink-2">{fact.label}</dt>
              <dd className="text-title1 tabular-nums text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-b border-line-soft py-14">
        <blockquote className="max-w-4xl">
          <p className="text-title2 text-ink sm:text-title1">
            “Good financial journalism doesn’t just report what happened. It explains why it matters to{' '}
            <span className="font-serif italic font-normal text-ink-2">you.</span>”
          </p>
        </blockquote>
      </section>

      <section className="border-b border-line-soft py-14" aria-labelledby="coverage">
        <h2 id="coverage" className="text-title2 text-ink">
          What we cover
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {COVERAGE.map((item) => (
            <div key={item.title}>
              <h3 className="text-headline text-ink">{item.title}</h3>
              <p className="mt-1.5 text-subhead text-ink-2">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-line-soft py-14" aria-labelledby="how-we-work">
        <h2 id="how-we-work" className="text-title2 text-ink">
          How we work
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="border-t border-line pt-4">
              <h3 className="text-headline text-ink">{p.title}</h3>
              <p className="mt-1.5 text-subhead text-ink-2">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col justify-between gap-8 py-14 sm:flex-row sm:items-end lg:py-20">
        <h2 className="max-w-lg text-title1 text-ink">Stay ahead of every market move.</h2>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link href="/blog" className="inline-flex h-12 items-center justify-center rounded-control bg-ink px-7 text-headline text-canvas transition-opacity hover:opacity-85">
            Read the latest news
          </Link>
          <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-control bg-fill px-7 text-headline text-ink transition-colors hover:bg-fill-2">
            Contact us
          </Link>
        </div>
      </section>
    </div>
  );
}
