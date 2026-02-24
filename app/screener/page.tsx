"use client";
import { useEffect, useRef, useState } from "react";

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

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      {faqData.map((faq, idx) => (
        <div key={idx} className="border-b border-gray-200 pb-2">
          <button
            className="w-full text-left font-semibold text-lg text-gray-900 flex justify-between items-center py-2 focus:outline-none"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            aria-expanded={openIndex === idx}
          >
            {faq.question}
            <span className="ml-2 text-gray-400">{openIndex === idx ? "▲" : "▼"}</span>
          </button>
          {openIndex === idx && (
            <div className="mt-2 text-gray-700 animate-fade-in">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ScreenerPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load TradingView Screener widget script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": 700,
      "defaultColumn": "overview",
      "defaultScreen": "general",
      "market": "stocks",
      "showToolbar": true,
      "colorTheme": "dark",
      "locale": "en",
      "isTransparent": false,
      "largeChartUrl": "",
      "showSymbolLogo": true,
      "screen": "most_capitalized",
      "save_image": false
    });
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }
    // Cleanup
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#f3f6fa] to-[#e9ecf3] py-10 px-4 w-full">
      <section className="w-full mb-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight drop-shadow-lg">Stock Screener</h1>
        <p className="text-lg text-gray-600 mb-8 font-medium max-w-2xl mx-auto">
          Explore and filter stocks by market cap, price, performance, and more. Powered by TradingView.
        </p>
      </section>
      <section className="w-full px-4">
        <div className="glass p-6 md:p-10 flex flex-col items-center rounded-2xl shadow-lg">
          <div ref={containerRef} style={{ width: "100%" }} />
          <p className="mt-6 text-gray-500 text-center max-w-2xl">
            This is a TradingView-powered stock screener. Use the filters, search, and tabs to explore stocks by market cap, price, performance, and more.
          </p>
        </div>
        {/* Stock Screener Info Section */}
        <section className="mt-12 bg-white/90 rounded-2xl shadow p-8 w-full px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Stock Screener – Find the Best Stocks Faster</h2>
          <p className="mb-4 text-gray-700">The Stock Screener on TheMarketStories helps traders and investors quickly identify stocks that match their strategy. Powered by real-time market data, this tool allows you to filter stocks based on price, market capitalization, volume, performance, technical indicators, and fundamentals — all in one place.</p>
          <p className="mb-4 text-gray-700">Whether you are a short-term trader, swing trader, or long-term investor, this screener helps you save time and focus only on high-potential opportunities.</p>
          <h3 className="text-xl font-semibold mt-8 mb-2 text-gray-900">How the Stock Screener Works</h3>
          <p className="mb-4 text-gray-700">Our stock screener scans thousands of listed stocks and organizes them into a powerful, easy-to-read table. You can instantly sort and filter stocks using key metrics such as price movement, trading volume, valuation ratios, and technical ratings.</p>
          <p className="mb-4 text-gray-700">With just a few clicks, you can narrow down the market and find stocks that align with your trading or investment goals.</p>
          <h3 className="text-xl font-semibold mt-8 mb-2 text-gray-900">Key Features of Our Stock Screener</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li className="mb-2"><strong>Real-Time Market Data</strong><br />Track live stock prices, percentage changes, and trading volumes to stay updated with current market movements.</li>
            <li className="mb-2"><strong>Technical Rating Insights</strong><br />Use built-in technical ratings like Buy, Strong Buy, Neutral, or Sell to understand market momentum at a glance.</li>
            <li className="mb-2"><strong>Fundamental Metrics</strong><br />Analyze important financial data such as market cap, P/E ratio, EPS, and company size to evaluate stock strength.</li>
            <li className="mb-2"><strong>Sector-Wise Stock Discovery</strong><br />Filter stocks by industry and sector to identify opportunities in trending or undervalued segments.</li>
            <li className="mb-2"><strong>Advanced Filtering & Sorting</strong><br />Customize your view by sorting stocks based on performance, volume spikes, valuation metrics, or technical signals.</li>
          </ul>
          <h3 className="text-xl font-semibold mt-8 mb-2 text-gray-900">Who Should Use This Stock Screener?</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Traders looking for high-momentum stocks</li>
            <li>Investors searching for fundamentally strong companies</li>
            <li>Beginners exploring the stock market with guided insights</li>
            <li>Professionals who need fast, data-driven stock filtering</li>
          </ul>
          <p className="mb-4 text-gray-700">No matter your experience level, the screener helps you make informed decisions faster.</p>
          <h3 className="text-xl font-semibold mt-8 mb-2 text-gray-900">Why Use TheMarketStories Stock Screener?</h3>
          <p className="mb-4 text-gray-700">Unlike basic stock lists, our screener combines technical analysis, fundamental data, and real-time updates into a single interface. This makes it easier to identify trends, spot breakouts, and avoid weak stocks.</p>
          <p className="mb-4 text-gray-700">You don’t need multiple tools — everything is available in one powerful screener.</p>
          <h3 className="text-xl font-semibold mt-8 mb-2 text-gray-900">Important Risk Disclaimer</h3>
          <p className="mb-4 text-gray-700">Stock market investments involve risk, and prices can fluctuate rapidly. The data and technical ratings provided on this page are for informational and educational purposes only and should not be considered financial advice. Always perform your own research or consult a qualified financial advisor before making investment decisions.</p>
          <h3 className="text-xl font-semibold mt-8 mb-2 text-gray-900">Start Screening Stocks Today</h3>
          <p className="mb-4 text-gray-700">Use the filters, search options, and technical insights above to discover stocks that match your strategy. Whether you’re tracking market movers or building a long-term portfolio, the Stock Screener gives you the clarity you need.</p>
          <div className="mt-8 text-xs text-gray-400 text-center">
            <strong>Related search terms:</strong><br />
            stock screener, live stock screener, technical stock screener, stock market screener, best stock screener, real-time stock screening, filter stocks by market cap, tradingview stock screener
          </div>
        </section>
        {/* FAQ Section */}
        <section className="mt-12 bg-white/90 rounded-2xl shadow p-8 w-full px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
          <FAQAccordion />
        </section>
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
    </main>
  );
}

