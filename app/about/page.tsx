
import type { Metadata } from 'next';
import Link from 'next/link';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'About TheMarketStories | Global Financial News & Market Insights',
    description: 'TheMarketStories is a global financial news and market insights platform covering stocks, crypto, business, technology, and economic trends.',
    alternates: { canonical: '/about' },
  };
};

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-900">

      {/* Opening — editorial full-width */}
      <section className="border-b border-gray-200 py-20 px-4 sm:px-8 lg:px-20">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-6">About TheMarketStories</p>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] max-w-5xl">
          We exist to make financial news <span className="italic font-serif text-gray-400">honest,</span>{" "}
          fast, and genuinely useful.
        </h1>
      </section>

      {/* Who we are */}
      <section className="border-b border-gray-200 px-4 sm:px-8 lg:px-20 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-8">Who We Are</p>

        <div className="mb-16 space-y-6">
          <p className="text-xl text-gray-600 leading-relaxed">
            TheMarketStories is a global financial news and market insights platform built for investors,
            traders, and anyone trying to understand what&apos;s actually happening in the world economy.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            We cover stocks, crypto, business, technology, commodities, and economic trends — not with
            sensationalism, but with clarity. Every story we publish is written to help you make sense
            of the markets, not just to get a click.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            We are independent. We are not backed by a bank, a brokerage, or a hedge fund.
            That matters — because our only job is to inform you, not to sell you anything.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            Founded to fill a gap in financial media — too many outlets either dumb things down or bury
            readers in jargon. We write for people who are serious about money without making them feel
            like they need a finance degree to follow along.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            Our editorial team includes experienced financial journalists, market analysts, and data
            journalists who work around the clock to ensure every story is accurate, timely, and
            genuinely useful to our readers.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            From breaking earnings reports to long-form investigations into market trends — we cover
            the full spectrum of financial news with the same commitment to quality across every story
            we publish.
          </p>
        </div>

        {/* Key facts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
          {[
            { value: "500K+", label: "Monthly Readers" },
            { value: "120+",  label: "Countries Reached" },
            { value: "40K+",  label: "Newsletter Subscribers" },
            { value: "24/7",  label: "Live Market Coverage" },
          ].map((s) => (
            <div key={s.label} className="px-8 py-10 bg-gray-50">
              <p className="text-3xl font-black text-gray-900 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pull quote */}
      <section className="bg-gray-900 text-white py-20 px-4 sm:px-8 lg:px-20 border-b border-gray-800">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-8">Our Belief</p>
        <blockquote className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight max-w-4xl">
          &ldquo;Good financial journalism doesn&apos;t just report what happened —
          it explains why it matters to{" "}
          <span className="text-blue-400 italic font-serif">you.</span>&rdquo;
        </blockquote>
      </section>

      {/* What we cover */}
      <section className="border-b border-gray-200 px-4 sm:px-8 lg:px-20 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-8">What We Cover</p>
        <div className="space-y-5">
          <p className="text-xl text-gray-600 leading-relaxed">
            Our coverage spans every major corner of the global financial landscape. We report on
            <strong className="text-gray-900"> Stocks &amp; Equities</strong> — from daily price movements and earnings seasons to long-term market trends and index performance across global exchanges.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            We cover <strong className="text-gray-900">Cryptocurrency &amp; Blockchain</strong> with the same rigour as traditional finance — tracking Bitcoin, Ethereum, altcoins, DeFi developments, and regulatory shifts that affect the entire digital asset space.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            <strong className="text-gray-900">Global Economics</strong> and <strong className="text-gray-900">Banking &amp; Finance</strong> form the backbone of our reporting — central bank decisions, interest rate policy, inflation data, and the performance of major financial institutions worldwide.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            We track <strong className="text-gray-900">Commodities</strong> including oil, gold, silver, and agricultural markets, alongside <strong className="text-gray-900">Forex</strong> currency pairs and the macroeconomic forces that move them.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            Our <strong className="text-gray-900">Technology</strong> and <strong className="text-gray-900">Business</strong> desks cover corporate earnings, M&amp;A activity, startup funding, and the tech giants shaping both markets and society.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            We also report on <strong className="text-gray-900">Emerging Markets</strong>, <strong className="text-gray-900">IPOs &amp; Earnings</strong>, in-depth <strong className="text-gray-900">Market Analysis</strong>, and the intersection of <strong className="text-gray-900">Geopolitics &amp; Markets</strong> — because what happens in the world always ends up in the numbers.
          </p>
        </div>
      </section>

      {/* Three principles — no icons, just numbers and text */}
      <section className="border-b border-gray-200 px-4 sm:px-8 lg:px-20 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-12">How We Work</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {[
            {
              num: "01",
              title: "Independent Editorial",
              body: "Our newsroom operates completely independently. No advertiser, sponsor, or investor has any influence over what we publish or how we cover it.",
            },
            {
              num: "02",
              title: "Verified Before Published",
              body: "Every claim goes through source verification before it's published. We would rather be second and right than first and wrong.",
            },
            {
              num: "03",
              title: "Transparent About Sponsorship",
              body: "When content is paid for, we say so — clearly and prominently. We never disguise advertising as editorial.",
            },
          ].map((p) => (
            <div key={p.num} className="py-8 md:py-0 md:px-10 first:md:pl-0 last:md:pr-0">
              <p className="text-5xl font-black text-gray-100 mb-4">{p.num}</p>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{p.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Bottom CTA — minimal */}
      <section className="px-4 sm:px-8 lg:px-20 py-20 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">Get Started</p>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight max-w-lg">
            Stay ahead of every market move.
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <Link
            href="/"
            className="bg-gray-900 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
          >
            Read Latest News
          </Link>
          <Link
            href="/contact"
            className="border border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
          >
            Contact Us
          </Link>
        </div>
      </section>

    </div>
  );
}
