"use client";

import { useEffect, useState } from "react";

const tabs = [
  "Getting Started",
  "Stocks",
  "Forex",
  "Crypto",
  "Technical Analysis",
  "Fundamental Analysis",
  "Trading Strategies",
  "Risk Management",
  "Tools Guide",
  "Glossary",
  "Financial News Impact",
  "Portfolio Diversification",
  "Trading Mistakes",
  "Reading Financial Statements",
  "Economic Indicators",
];

const tabContent = [
  // Tab 1: Getting Started
  <div key="getting-started">
    <h2>What Are Financial Markets?</h2>
    <p>Financial markets are places where people buy and sell assets such as stocks, currencies, commodities, and cryptocurrencies. These markets help businesses raise money and allow investors and traders to participate in global economic growth.</p>
    <p>Markets operate globally and are influenced by supply, demand, economic data, and global events.</p>
    <h3>Trading vs Investing</h3>
    <p>Trading focuses on short-term price movements, while investing focuses on long-term value and growth. Traders may hold positions for minutes or days, whereas investors usually hold assets for years.</p>
    <p>Both approaches require discipline, research, and risk management.</p>
    <h3>Market Types</h3>
    <ul>
      <li>Stock Market – shares of companies</li>
      <li>Forex Market – currency exchange</li>
      <li>Crypto Market – digital assets</li>
      <li>Commodities – gold, oil, metals</li>
    </ul>
  </div>,
  // Tab 2: Stocks
  <div key="stocks">
    <h2>What Are Stocks?</h2>
    <p>Stocks represent ownership in a company. When you buy a stock, you become a shareholder and may benefit from price appreciation and dividends.</p>
    <h3>Stock Exchanges & Indices</h3>
    <p>Stocks are traded on exchanges such as major global stock markets. Indices like the S&amp;P 500 or NASDAQ track the performance of groups of stocks and represent overall market sentiment.</p>
    <h3>Why Stock Prices Move</h3>
    <ul>
      <li>Company earnings</li>
      <li>Economic conditions</li>
      <li>Industry performance</li>
      <li>News and market sentiment</li>
    </ul>
  </div>,
  // Tab 3: Forex
  <div key="forex">
    <h2>What Is Forex Trading?</h2>
    <p>Forex trading involves exchanging one currency for another. It is the largest and most liquid financial market in the world, operating 24 hours a day.</p>
    <h3>Currency Pairs Explained</h3>
    <p>Currencies are traded in pairs:</p>
    <ul>
      <li>Base currency (first)</li>
      <li>Quote currency (second)</li>
    </ul>
    <p>Example: EUR/USD shows how much USD is needed to buy 1 EUR.</p>
    <h3>Pips, Lots &amp; Leverage</h3>
    <ul>
      <li>Pip: smallest price movement</li>
      <li>Lot: trade size</li>
      <li>Leverage: borrowed capital to increase exposure</li>
    </ul>
    <p>Leverage increases both profit potential and risk.</p>
  </div>,
  // Tab 4: Crypto
  <div key="crypto">
    <h2>What Is Cryptocurrency?</h2>
    <p>Cryptocurrency is a digital asset secured by cryptography and built on blockchain technology. Bitcoin was the first cryptocurrency, followed by thousands of others.</p>
    <h3>Crypto Market Characteristics</h3>
    <ul>
      <li>High volatility</li>
      <li>24/7 trading</li>
      <li>Influenced by adoption, regulation, and technology</li>
    </ul>
    <h3>Risks in Crypto</h3>
    <p>Crypto markets can move very fast. Prices can change sharply due to news, regulation, or market sentiment. Risk management is essential.</p>
  </div>,
  // Tab 5: Technical Analysis
  <div key="technical-analysis">
    <h2>What Is Technical Analysis?</h2>
    <p>Technical analysis studies price charts and indicators to identify trends and potential trading opportunities.</p>
    <h3>Charts &amp; Patterns</h3>
    <p>Common chart types:</p>
    <ul>
      <li>Candlestick</li>
      <li>Line</li>
      <li>Area</li>
    </ul>
    <p>Patterns help traders identify trend continuation or reversals.</p>
    <h3>Indicators</h3>
    <p>Popular indicators include:</p>
    <ul>
      <li>Moving Averages</li>
      <li>RSI</li>
      <li>MACD</li>
    </ul>
    <p>Indicators help measure momentum, trend strength, and overbought or oversold conditions.</p>
  </div>,
  // Tab 6: Fundamental Analysis
  <div key="fundamental-analysis">
    <h2>What Is Fundamental Analysis?</h2>
    <p>Fundamental analysis evaluates an asset’s real value by studying financial data, economic indicators, and market conditions.</p>
    <h3>Economic Factors</h3>
    <ul>
      <li>Interest rates</li>
      <li>Inflation</li>
      <li>Employment data</li>
      <li>Central bank decisions</li>
    </ul>
    <p>These factors strongly influence markets.</p>
    <h3>Company Analysis</h3>
    <ul>
      <li>Revenue</li>
      <li>Profitability</li>
      <li>Balance sheets</li>
      <li>Growth potential</li>
    </ul>
  </div>,
  // Tab 7: Trading Strategies
  <div key="trading-strategies">
    <h2>Common Trading Styles</h2>
    <ul>
      <li>Day Trading – same-day trades</li>
      <li>Swing Trading – multi-day trades</li>
      <li>Trend Following – trading with market direction</li>
      <li>Breakout Trading – trading price expansion</li>
    </ul>
    <h3>Strategy Discipline</h3>
    <p>A strategy must include:</p>
    <ul>
      <li>Entry rules</li>
      <li>Exit rules</li>
      <li>Risk limits</li>
    </ul>
    <p>Consistency matters more than frequency.</p>
  </div>,
  // Tab 8: Risk Management
  <div key="risk-management">
    <h2>Why Risk Management Matters</h2>
    <p>Protecting capital is more important than making profits. Losses are part of trading, but they must be controlled.</p>
    <h3>Key Risk Principles</h3>
    <ul>
      <li>Risk only what you can afford to lose</li>
      <li>Use stop losses</li>
      <li>Maintain proper risk–reward ratio</li>
      <li>Avoid emotional decisions</li>
    </ul>
    <h3>Trading Psychology</h3>
    <p>Fear and greed are common challenges. Successful traders follow rules and remain disciplined regardless of emotions.</p>
  </div>,
  // Tab 9: Tools Guide
  <div key="tools-guide">
    <h2>How to Use Market Tools</h2>
    <p>Tools help traders make informed decisions by visualizing data and identifying opportunities.</p>
    <h3>Popular Tools Explained</h3>
    <ul>
      <li>Market Heatmap – shows market strength visually</li>
      <li>Forex Heatmap – compares currency performance</li>
      <li>Screeners – filter assets by conditions</li>
      <li>Calculators – manage risk and position size</li>
    </ul>
    <p>Using tools properly improves decision quality.</p>
  </div>,
  // Tab 10: Glossary
  <div key="glossary">
    <h2>Common Market Terms</h2>
    <p>A glossary helps beginners understand trading language such as:</p>
    <ul>
      <li>Volatility</li>
      <li>Liquidity</li>
      <li>Spread</li>
      <li>Market Cap</li>
      <li>Margin</li>
    </ul>
    <p>Understanding terminology builds confidence.</p>
  </div>,
  // Tab 11: Financial News Impact
  <div key="financial-news-impact">
    <h2>How Financial News Impacts Markets</h2>
    <p>Financial news can move markets quickly. Major headlines about economic data, company earnings, or global events often cause price changes. Traders and investors watch news to anticipate market direction and adjust their strategies.</p>
    <ul>
      <li>Economic reports (GDP, jobs, inflation)</li>
      <li>Central bank announcements</li>
      <li>Political events</li>
      <li>Company news and earnings</li>
    </ul>
    <p>Learning to interpret news helps you make informed decisions and manage risk.</p>
  </div>,
  // Tab 12: Portfolio Diversification
  <div key="portfolio-diversification">
    <h2>Portfolio Diversification</h2>
    <p>Diversification means spreading your investments across different assets, sectors, or regions. This reduces risk because losses in one area may be offset by gains in another.</p>
    <ul>
      <li>Mix stocks, bonds, and other assets</li>
      <li>Invest in different industries</li>
      <li>Consider global markets</li>
    </ul>
    <p>A diversified portfolio is a key principle for long-term financial stability.</p>
  </div>,
  // Tab 13: Trading Mistakes
  <div key="trading-mistakes">
    <h2>Common Trading Mistakes</h2>
    <p>Avoiding common mistakes can improve your trading results. Beginners often:</p>
    <ul>
      <li>Trade without a plan</li>
      <li>Risk too much on one trade</li>
      <li>Let emotions drive decisions</li>
      <li>Ignore risk management</li>
      <li>Chase losses</li>
    </ul>
    <p>Learning from mistakes and following a disciplined approach helps build success.</p>
  </div>,
  // Tab 14: Reading Financial Statements
  <div key="reading-financial-statements">
    <h2>How to Read a Financial Statement</h2>
    <p>Financial statements show a company’s health and performance. Key documents include:</p>
    <ul>
      <li>Balance Sheet – assets, liabilities, equity</li>
      <li>Income Statement – revenue, expenses, profit</li>
      <li>Cash Flow Statement – money in and out</li>
    </ul>
    <p>Understanding these helps you evaluate companies and make better investment choices.</p>
  </div>,
  // Tab 15: Economic Indicators
  <div key="economic-indicators">
    <h2>Economic Indicators Explained</h2>
    <p>Economic indicators measure the health of an economy. They help predict market trends and guide investment decisions.</p>
    <ul>
      <li>Gross Domestic Product (GDP)</li>
      <li>Inflation Rate</li>
      <li>Unemployment Rate</li>
      <li>Interest Rates</li>
      <li>Consumer Confidence</li>
    </ul>
    <p>Tracking indicators helps you understand market cycles and economic changes.</p>
  </div>,
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const LESSONS = tabs.map((title, index) => ({ id: slugify(title), title, content: tabContent[index] }));

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

const LESSON_IDS = LESSONS.map((lesson) => lesson.id);

export default function LearnPage() {
  const active = useActiveSection(LESSON_IDS);

  const toc = (
    <ol className="space-y-0.5">
      {LESSONS.map((lesson, index) => (
        <li key={lesson.id}>
          <a
            href={`#${lesson.id}`}
            aria-current={active === lesson.id ? "location" : undefined}
            className="flex min-h-9 items-center gap-2 rounded-control px-2 text-subhead text-ink-2 transition-colors hover:text-ink aria-[current=location]:bg-surface aria-[current=location]:font-medium aria-[current=location]:text-ink"
          >
            <span className="w-5 shrink-0 text-footnote tabular-nums text-ink-3">{index + 1}</span>
            {lesson.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <header className="mb-10 max-w-3xl">
        <p className="section-label">Learn</p>
        <h1 className="mt-1 text-title1 text-ink">Trading and investing basics</h1>
        <p className="mt-3 text-title3 font-normal text-ink-2">
          Fifteen short lessons, from how markets work to reading financial statements. Read in order or jump to a
          topic.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="Lessons" className="lg:sticky lg:top-20 lg:self-start">
          <details className="rounded-card bg-surface p-3 lg:hidden">
            <summary className="flex min-h-11 cursor-pointer items-center px-2 text-headline text-ink">
              All 15 lessons
            </summary>
            <div className="mt-2">{toc}</div>
          </details>
          <div className="hidden lg:block">
            <h2 className="mb-2 px-2 text-footnote font-semibold uppercase tracking-wide text-ink-2">On this page</h2>
            {toc}
          </div>
        </nav>

        <div className="min-w-0">
          {LESSONS.map((lesson, index) => (
            <section
              key={lesson.id}
              id={lesson.id}
              aria-labelledby={`${lesson.id}-label`}
              className="scroll-mt-20 border-t border-line-soft pb-10 pt-8 first:border-t-0 first:pt-0"
            >
              <p id={`${lesson.id}-label`} className="section-label mb-2">
                Lesson {index + 1} · {lesson.title}
              </p>
              <div className="article-body">{lesson.content}</div>
            </section>
          ))}
          <p className="max-w-[68ch] rounded-card bg-surface px-4 py-3 text-subhead text-ink-2">
            These lessons are for education only and aren’t financial advice. Markets carry risk, including the loss of
            capital.
          </p>
        </div>
      </div>
    </div>
  );
}
