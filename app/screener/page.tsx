"use client";
import { useEffect, useRef } from "react";
import { useColorScheme } from "@/lib/useColorScheme";

// FAQ Data and Accordion Component
const faqData = [
  {
    question: "What is a stock screener?",
    answer:
      "A stock screener is a tool that helps traders and investors filter stocks based on specific criteria such as price, market capitalization, volume, performance, and technical indicators. It allows users to quickly find stocks that match their trading or investment strategy.",
  },
  {
    question: "Is this stock screener free to use?",
    answer:
      "Yes, the stock screener on TheMarketStories is free to access. Users can explore stocks, apply filters, and analyze market data without any subscription.",
  },
  {
    question: "Is the stock screener data real-time?",
    answer:
      "The screener uses near real-time market data powered by TradingView. However, slight delays may occur depending on the exchange and market conditions.",
  },
  {
    question: "Can beginners use this stock screener?",
    answer:
      "Absolutely. The stock screener is designed for both beginners and experienced traders. Built-in technical ratings like Buy, Strong Buy, Neutral, and Sell make it easy to understand market sentiment.",
  },
  {
    question: "What filters are available in the stock screener?",
    answer:
      "Users can filter stocks by price, percentage change, trading volume, market capitalization, sector, valuation metrics, and technical indicators.",
  },
  {
    question: "Does this stock screener provide investment advice?",
    answer:
      "No. The stock screener is an informational and analytical tool only. It does not provide financial or investment advice. Users should always do their own research before making trading decisions.",
  },
  {
    question: "Can I use this screener for intraday trading?",
    answer:
      "Yes, the screener is suitable for intraday, swing, and long-term trading strategies. Traders can identify momentum stocks, volume spikes, and trending sectors efficiently.",
  },
  {
    question: "How often is the stock data updated?",
    answer:
      "Stock data is updated automatically based on live market feeds. Updates occur frequently during market hours.",
  },
];

function FAQList() {
  return (
    <div className="divide-y divide-line-soft border-y border-line-soft">
      {faqData.map((faq) => (
        <details key={faq.question} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-headline text-ink [&::-webkit-details-marker]:hidden">
            {faq.question}
            <span className="text-ink-2 transition-transform group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <p className="pb-4 text-body text-ink-2">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

export default function ScreenerPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scheme = useColorScheme();
  const injected = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    // Re-inject only when the theme changes; a repeat run would orphan the loading script.
    if (!container || injected.current === scheme) return;
    injected.current = scheme;
    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 700,
      defaultColumn: "overview",
      defaultScreen: "general",
      market: "stocks",
      showToolbar: true,
      colorTheme: scheme,
      locale: "en",
      isTransparent: true,
      largeChartUrl: "",
      showSymbolLogo: true,
      screen: "most_capitalized",
      save_image: false,
    });
    container.appendChild(script);
  }, [scheme]);

  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <header className="mb-8 max-w-3xl">
        <p className="section-label">Tools</p>
        <h1 className="mt-1 text-title1 text-ink">Stock screener</h1>
        <p className="mt-3 text-title3 font-normal text-ink-2">
          Filter stocks by market cap, price, performance, valuation and technical rating.
        </p>
      </header>

      <div
        ref={containerRef}
        role="region"
        aria-label="Stock screener by TradingView"
        className="w-full overflow-hidden rounded-card border border-line-soft"
        style={{ minHeight: 700 }}
      />
      <p className="mt-2 text-footnote text-ink-2">Screener data by TradingView. Prices may be delayed.</p>

      <section className="article-body mt-14 border-t border-line-soft pt-8">
        <h2>Find stocks that match your strategy</h2>
        <p>
          The screener scans thousands of listed stocks and lets you sort and filter them by price movement, trading
          volume, valuation ratios, fundamentals and technical ratings, in one table.
        </p>
        <h3>What you can filter by</h3>
        <ul>
          <li><strong>Live market data:</strong> prices, percentage change and volume</li>
          <li><strong>Technical ratings:</strong> Strong Buy, Buy, Neutral, Sell and Strong Sell</li>
          <li><strong>Fundamentals:</strong> market cap, P/E ratio, EPS and company size</li>
          <li><strong>Sector and industry:</strong> find opportunities in trending or overlooked segments</li>
        </ul>
        <p>
          The screener is for information and education only. It isn’t financial advice. Do your own research or
          consult a qualified adviser before investing.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="screener-faq">
        <h2 id="screener-faq" className="mb-4 text-title2 text-ink">
          Frequently asked questions
        </h2>
        <FAQList />
      </section>

      {/* FAQ Schema for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {"@type": "Question","name": "What is a stock screener?","acceptedAnswer": {"@type": "Answer","text": "A stock screener is a tool that helps traders and investors filter stocks based on criteria such as price, market capitalization, volume, performance, and technical indicators."}},
          {"@type": "Question","name": "Is this stock screener free to use?","acceptedAnswer": {"@type": "Answer","text": "Yes, the stock screener on TheMarketStories is free to use and does not require a subscription."}},
          {"@type": "Question","name": "Is the stock screener data real-time?","acceptedAnswer": {"@type": "Answer","text": "The stock screener uses near real-time data powered by TradingView. Minor delays may occur depending on the exchange."}},
          {"@type": "Question","name": "Can beginners use this stock screener?","acceptedAnswer": {"@type": "Answer","text": "Yes, the screener is beginner-friendly and includes clear technical ratings such as Buy, Strong Buy, Neutral, and Sell."}},
          {"@type": "Question","name": "What filters are available in the stock screener?","acceptedAnswer": {"@type": "Answer","text": "You can filter stocks by price, percentage change, volume, market capitalization, sector, valuation metrics, and technical indicators."}},
          {"@type": "Question","name": "Does this stock screener provide investment advice?","acceptedAnswer": {"@type": "Answer","text": "No, the stock screener is for informational and educational purposes only and does not provide financial advice."}},
          {"@type": "Question","name": "Can I use this screener for intraday trading?","acceptedAnswer": {"@type": "Answer","text": "Yes, the stock screener is suitable for intraday, swing, and long-term trading strategies."}},
          {"@type": "Question","name": "How often is the stock data updated?","acceptedAnswer": {"@type": "Answer","text": "Stock data is updated automatically during market hours using live market feeds."}}
        ]
      }` }} />
    </div>
  );
}
