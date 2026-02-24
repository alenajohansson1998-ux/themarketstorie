"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import LearnSidebar from "./LearnSidebar";

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
    <h2 className="text-xl font-semibold mb-2">What Are Financial Markets?</h2>
    <p className="mb-2">Financial markets are places where people buy and sell assets such as stocks, currencies, commodities, and cryptocurrencies. These markets help businesses raise money and allow investors and traders to participate in global economic growth.</p>
    <p className="mb-2">Markets operate globally and are influenced by supply, demand, economic data, and global events.</p>
    <h3 className="font-semibold mt-4 mb-1">Trading vs Investing</h3>
    <p className="mb-2">Trading focuses on short-term price movements, while investing focuses on long-term value and growth. Traders may hold positions for minutes or days, whereas investors usually hold assets for years.</p>
    <p className="mb-2">Both approaches require discipline, research, and risk management.</p>
    <h3 className="font-semibold mt-4 mb-1">Market Types</h3>
    <ul className="list-disc ml-6 mb-2">
      <li>Stock Market – shares of companies</li>
      <li>Forex Market – currency exchange</li>
      <li>Crypto Market – digital assets</li>
      <li>Commodities – gold, oil, metals</li>
    </ul>
  </div>,
  // Tab 2: Stocks
  <div key="stocks">
    <h2 className="text-xl font-semibold mb-2">What Are Stocks?</h2>
    <p className="mb-2">Stocks represent ownership in a company. When you buy a stock, you become a shareholder and may benefit from price appreciation and dividends.</p>
    <h3 className="font-semibold mt-4 mb-1">Stock Exchanges & Indices</h3>
    <p className="mb-2">Stocks are traded on exchanges such as major global stock markets. Indices like the S&amp;P 500 or NASDAQ track the performance of groups of stocks and represent overall market sentiment.</p>
    <h3 className="font-semibold mt-4 mb-1">Why Stock Prices Move</h3>
    <ul className="list-disc ml-6 mb-2">
      <li>Company earnings</li>
      <li>Economic conditions</li>
      <li>Industry performance</li>
      <li>News and market sentiment</li>
    </ul>
  </div>,
  // Tab 3: Forex
  <div key="forex">
    <h2 className="text-xl font-semibold mb-2">What Is Forex Trading?</h2>
    <p className="mb-2">Forex trading involves exchanging one currency for another. It is the largest and most liquid financial market in the world, operating 24 hours a day.</p>
    <h3 className="font-semibold mt-4 mb-1">Currency Pairs Explained</h3>
    <p className="mb-2">Currencies are traded in pairs:</p>
    <ul className="list-disc ml-6 mb-2">
      <li>Base currency (first)</li>
      <li>Quote currency (second)</li>
    </ul>
    <p className="mb-2">Example: EUR/USD shows how much USD is needed to buy 1 EUR.</p>
    <h3 className="font-semibold mt-4 mb-1">Pips, Lots &amp; Leverage</h3>
    <ul className="list-disc ml-6 mb-2">
      <li>Pip: smallest price movement</li>
      <li>Lot: trade size</li>
      <li>Leverage: borrowed capital to increase exposure</li>
    </ul>
    <p className="mb-2">Leverage increases both profit potential and risk.</p>
  </div>,
  // Tab 4: Crypto
  <div key="crypto">
    <h2 className="text-xl font-semibold mb-2">What Is Cryptocurrency?</h2>
    <p className="mb-2">Cryptocurrency is a digital asset secured by cryptography and built on blockchain technology. Bitcoin was the first cryptocurrency, followed by thousands of others.</p>
    <h3 className="font-semibold mt-4 mb-1">Crypto Market Characteristics</h3>
    <ul className="list-disc ml-6 mb-2">
      <li>High volatility</li>
      <li>24/7 trading</li>
      <li>Influenced by adoption, regulation, and technology</li>
    </ul>
    <h3 className="font-semibold mt-4 mb-1">Risks in Crypto</h3>
    <p className="mb-2">Crypto markets can move very fast. Prices can change sharply due to news, regulation, or market sentiment. Risk management is essential.</p>
  </div>,
  // Tab 5: Technical Analysis
  <div key="technical-analysis">
    <h2 className="text-xl font-semibold mb-2">What Is Technical Analysis?</h2>
    <p className="mb-2">Technical analysis studies price charts and indicators to identify trends and potential trading opportunities.</p>
    <h3 className="font-semibold mt-4 mb-1">Charts &amp; Patterns</h3>
    <p className="mb-2">Common chart types:</p>
    <ul className="list-disc ml-6 mb-2">
      <li>Candlestick</li>
      <li>Line</li>
      <li>Area</li>
    </ul>
    <p className="mb-2">Patterns help traders identify trend continuation or reversals.</p>
    <h3 className="font-semibold mt-4 mb-1">Indicators</h3>
    <p className="mb-2">Popular indicators include:</p>
    <ul className="list-disc ml-6 mb-2">
      <li>Moving Averages</li>
      <li>RSI</li>
      <li>MACD</li>
    </ul>
    <p className="mb-2">Indicators help measure momentum, trend strength, and overbought or oversold conditions.</p>
  </div>,
  // Tab 6: Fundamental Analysis
  <div key="fundamental-analysis">
    <h2 className="text-xl font-semibold mb-2">What Is Fundamental Analysis?</h2>
    <p className="mb-2">Fundamental analysis evaluates an asset’s real value by studying financial data, economic indicators, and market conditions.</p>
    <h3 className="font-semibold mt-4 mb-1">Economic Factors</h3>
    <ul className="list-disc ml-6 mb-2">
      <li>Interest rates</li>
      <li>Inflation</li>
      <li>Employment data</li>
      <li>Central bank decisions</li>
    </ul>
    <p className="mb-2">These factors strongly influence markets.</p>
    <h3 className="font-semibold mt-4 mb-1">Company Analysis</h3>
    <ul className="list-disc ml-6 mb-2">
      <li>Revenue</li>
      <li>Profitability</li>
      <li>Balance sheets</li>
      <li>Growth potential</li>
    </ul>
  </div>,
  // Tab 7: Trading Strategies
  <div key="trading-strategies">
    <h2 className="text-xl font-semibold mb-2">Common Trading Styles</h2>
    <ul className="list-disc ml-6 mb-2">
      <li>Day Trading – same-day trades</li>
      <li>Swing Trading – multi-day trades</li>
      <li>Trend Following – trading with market direction</li>
      <li>Breakout Trading – trading price expansion</li>
    </ul>
    <h3 className="font-semibold mt-4 mb-1">Strategy Discipline</h3>
    <p className="mb-2">A strategy must include:</p>
    <ul className="list-disc ml-6 mb-2">
      <li>Entry rules</li>
      <li>Exit rules</li>
      <li>Risk limits</li>
    </ul>
    <p className="mb-2">Consistency matters more than frequency.</p>
  </div>,
  // Tab 8: Risk Management
  <div key="risk-management">
    <h2 className="text-xl font-semibold mb-2">Why Risk Management Matters</h2>
    <p className="mb-2">Protecting capital is more important than making profits. Losses are part of trading, but they must be controlled.</p>
    <h3 className="font-semibold mt-4 mb-1">Key Risk Principles</h3>
    <ul className="list-disc ml-6 mb-2">
      <li>Risk only what you can afford to lose</li>
      <li>Use stop losses</li>
      <li>Maintain proper risk–reward ratio</li>
      <li>Avoid emotional decisions</li>
    </ul>
    <h3 className="font-semibold mt-4 mb-1">Trading Psychology</h3>
    <p className="mb-2">Fear and greed are common challenges. Successful traders follow rules and remain disciplined regardless of emotions.</p>
  </div>,
  // Tab 9: Tools Guide
  <div key="tools-guide">
    <h2 className="text-xl font-semibold mb-2">How to Use Market Tools</h2>
    <p className="mb-2">Tools help traders make informed decisions by visualizing data and identifying opportunities.</p>
    <h3 className="font-semibold mt-4 mb-1">Popular Tools Explained</h3>
    <ul className="list-disc ml-6 mb-2">
      <li>Market Heatmap – shows market strength visually</li>
      <li>Forex Heatmap – compares currency performance</li>
      <li>Screeners – filter assets by conditions</li>
      <li>Calculators – manage risk and position size</li>
    </ul>
    <p className="mb-2">Using tools properly improves decision quality.</p>
  </div>,
  // Tab 10: Glossary
  <div key="glossary">
    <h2 className="text-xl font-semibold mb-2">Common Market Terms</h2>
    <p className="mb-2">A glossary helps beginners understand trading language such as:</p>
    <ul className="list-disc ml-6 mb-2">
      <li>Volatility</li>
      <li>Liquidity</li>
      <li>Spread</li>
      <li>Market Cap</li>
      <li>Margin</li>
    </ul>
    <p className="mb-2">Understanding terminology builds confidence.</p>
  </div>,
  // Tab 11: Financial News Impact
  <div key="financial-news-impact">
    <h2 className="text-xl font-semibold mb-2">How Financial News Impacts Markets</h2>
    <p className="mb-2">Financial news can move markets quickly. Major headlines about economic data, company earnings, or global events often cause price changes. Traders and investors watch news to anticipate market direction and adjust their strategies.</p>
    <ul className="list-disc ml-6 mb-2">
      <li>Economic reports (GDP, jobs, inflation)</li>
      <li>Central bank announcements</li>
      <li>Political events</li>
      <li>Company news and earnings</li>
    </ul>
    <p className="mb-2">Learning to interpret news helps you make informed decisions and manage risk.</p>
  </div>,
  // Tab 12: Portfolio Diversification
  <div key="portfolio-diversification">
    <h2 className="text-xl font-semibold mb-2">Portfolio Diversification</h2>
    <p className="mb-2">Diversification means spreading your investments across different assets, sectors, or regions. This reduces risk because losses in one area may be offset by gains in another.</p>
    <ul className="list-disc ml-6 mb-2">
      <li>Mix stocks, bonds, and other assets</li>
      <li>Invest in different industries</li>
      <li>Consider global markets</li>
    </ul>
    <p className="mb-2">A diversified portfolio is a key principle for long-term financial stability.</p>
  </div>,
  // Tab 13: Trading Mistakes
  <div key="trading-mistakes">
    <h2 className="text-xl font-semibold mb-2">Common Trading Mistakes</h2>
    <p className="mb-2">Avoiding common mistakes can improve your trading results. Beginners often:</p>
    <ul className="list-disc ml-6 mb-2">
      <li>Trade without a plan</li>
      <li>Risk too much on one trade</li>
      <li>Let emotions drive decisions</li>
      <li>Ignore risk management</li>
      <li>Chase losses</li>
    </ul>
    <p className="mb-2">Learning from mistakes and following a disciplined approach helps build success.</p>
  </div>,
  // Tab 14: Reading Financial Statements
  <div key="reading-financial-statements">
    <h2 className="text-xl font-semibold mb-2">How to Read a Financial Statement</h2>
    <p className="mb-2">Financial statements show a company’s health and performance. Key documents include:</p>
    <ul className="list-disc ml-6 mb-2">
      <li>Balance Sheet – assets, liabilities, equity</li>
      <li>Income Statement – revenue, expenses, profit</li>
      <li>Cash Flow Statement – money in and out</li>
    </ul>
    <p className="mb-2">Understanding these helps you evaluate companies and make better investment choices.</p>
  </div>,
  // Tab 15: Economic Indicators
  <div key="economic-indicators">
    <h2 className="text-xl font-semibold mb-2">Economic Indicators Explained</h2>
    <p className="mb-2">Economic indicators measure the health of an economy. They help predict market trends and guide investment decisions.</p>
    <ul className="list-disc ml-6 mb-2">
      <li>Gross Domestic Product (GDP)</li>
      <li>Inflation Rate</li>
      <li>Unemployment Rate</li>
      <li>Interest Rates</li>
      <li>Consumer Confidence</li>
    </ul>
    <p className="mb-2">Tracking indicators helps you understand market cycles and economic changes.</p>
  </div>,
];

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <main className="w-full mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Learn</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex flex-wrap gap-2">
            {tabs.map((tab, idx) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded font-medium text-sm transition-colors duration-150 glass-hover focus:outline-none focus:ring-2 focus:ring-blue-300 ${activeTab === idx ? "bg-black text-white" : "bg-white text-black"}`}
                style={{ border: activeTab === idx ? "2px solid #111" : "2px solid #e5e7eb" }}
                onClick={() => setActiveTab(idx)}
              >
                {tab}
              </button>
            ))}
          </div>
          <section className="glass blog-content p-6">
            {tabContent[activeTab]}
          </section>
        </div>
        {/* Market Sidebar for large screens */}
        <LearnSidebar />
      </div>
    </main>
  );
}