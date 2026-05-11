"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { POPULAR_PAIRS } from "@/lib/crypto-tokens";

interface PriceData {
  usd?: number;
  inr?: number;
  usd_24h_change?: number;
  inr_24h_change?: number;
  usd_market_cap?: number;
  [key: string]: number | undefined;
}

interface PricesMap {
  [coinId: string]: PriceData;
}

const TABLE_AMOUNTS = [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10, 25, 50, 100, 500];

function formatPrice(n: number, sign: string): string {
  if (!n) return "—";
  if (n >= 1_000_000_000) return `${sign}${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${sign}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${sign}${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (n >= 1) return `${sign}${n.toLocaleString("en-US", { maximumFractionDigits: 4 })}`;
  if (n >= 0.000001) return `${sign}${n.toFixed(8)}`;
  return `${sign}${n.toExponential(3)}`;
}

function formatVal(n: number): string {
  if (!n) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  if (n >= 0.000001) return n.toFixed(8);
  return n.toExponential(3);
}

const PAIR_CONTENT: Record<string, {
  title: string;
  about: string;
  body: (price: string, change: string, isPos: boolean, mcap: string) => string;
  cta: string;
}> = {
  "bitcoin-usd": {
    title: "BTC/USD — Bitcoin to US Dollar",
    about: "The world's biggest cryptocurrency paired with the world's largest fiat currency.",
    body: (price, change, isPos, mcap) =>
      `Bitcoin is currently trading at ${price}. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours. With a market capitalisation of ${mcap}, Bitcoin remains the dominant store of value in the digital asset space. As the largest cryptocurrency, Bitcoin trends often impact the entire crypto market — making BTC/USD the definitive benchmark pair for every trader and investor worldwide.`,
    cta: "Learn how to buy Bitcoin",
  },
  "bitcoin-inr": {
    title: "BTC/INR — Bitcoin to Indian Rupee",
    about: "The most searched cryptocurrency conversion in India.",
    body: (price, change, isPos, _mcap) =>
      `Bitcoin is currently trading at ${price} in Indian Rupees. The price has ${isPos ? "risen" : "fallen"} by ${change}% in the last 24 hours. BTC/INR is consistently the highest-volume crypto pair on Indian exchanges including WazirX, CoinDCX, and Zebpay. With growing retail and institutional adoption across India, the BTC/INR rate is closely watched by millions of investors as a key indicator of crypto market sentiment in the country.`,
    cta: "Convert BTC to INR live",
  },
  "ethereum-usd": {
    title: "ETH/USD — Ethereum to US Dollar",
    about: "The second largest cryptocurrency and the world's leading smart contract platform.",
    body: (price, change, isPos, mcap) =>
      `Ethereum is currently trading at ${price}. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours, with a market cap of ${mcap}. Ethereum is a decentralised computing platform that powers a vast universe of DeFi applications, NFT marketplaces, and Layer 2 networks. Following its transition to Proof-of-Stake (The Merge), ETH became deflationary under high network usage — a key driver of long-term demand from institutional investors and developers alike.`,
    cta: "Learn how to buy Ethereum",
  },
  "ethereum-inr": {
    title: "ETH/INR — Ethereum to Indian Rupee",
    about: "Ethereum priced in Indian Rupees — the gateway for Indian DeFi users.",
    body: (price, change, isPos, _mcap) =>
      `Ethereum is currently trading at ${price} in Indian Rupees. The price has ${isPos ? "moved up" : "moved down"} by ${change}% over the last 24 hours. ETH/INR is the second most traded crypto pair in India, driven by a growing community of developers, DeFi users, and NFT creators building on the Ethereum network. Gas fees, network upgrades, and global risk sentiment are the key factors that influence the ETH/INR exchange rate on a daily basis.`,
    cta: "Convert ETH to INR live",
  },
  "solana-usd": {
    title: "SOL/USD — Solana to US Dollar",
    about: "The fastest Layer 1 blockchain — now a top-5 cryptocurrency by market cap.",
    body: (price, change, isPos, mcap) =>
      `Solana is currently trading at ${price}. The price has ${isPos ? "gained" : "lost"} ${change}% in the last 24 hours, giving it a market cap of ${mcap}. Solana is a high-performance blockchain capable of processing 65,000+ transactions per second at a fraction of a cent per transaction. Its growing DeFi ecosystem, NFT marketplaces like Magic Eden, and the emergence of spot SOL ETF filings have made SOL/USD one of the most actively traded altcoin pairs in the world.`,
    cta: "Convert SOL to USD live",
  },
  "solana-inr": {
    title: "SOL/INR — Solana to Indian Rupee",
    about: "Solana in Indian Rupees — fast, cheap, and increasingly popular in India.",
    body: (price, change, isPos, _mcap) =>
      `Solana is currently trading at ${price} in Indian Rupees. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours. SOL/INR has become one of the fastest-growing pairs on Indian crypto exchanges. Solana's low transaction costs (often less than ₹0.01) and high throughput make it particularly attractive to Indian developers and retail traders looking for an alternative to the higher gas fees on Ethereum.`,
    cta: "Convert SOL to INR live",
  },
  "dogecoin-usd": {
    title: "DOGE/USD — Dogecoin to US Dollar",
    about: "From internet meme to top-10 cryptocurrency — Dogecoin's journey is unlike any other.",
    body: (price, change, isPos, mcap) =>
      `Dogecoin is currently trading at ${price}. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours, with a market cap of ${mcap}. Originally created in 2013 as a joke inspired by the Doge meme, DOGE evolved into a legitimate cryptocurrency accepted by Tesla merchandise stores and SpaceX. Its fast 1-minute block time and active community make it one of the most recognised names in crypto — and DOGE/USD one of the most watched pairs by retail investors globally.`,
    cta: "Convert DOGE to USD live",
  },
  "dogecoin-inr": {
    title: "DOGE/INR — Dogecoin to Indian Rupee",
    about: "A favourite entry point for first-time Indian crypto investors.",
    body: (price, change, isPos, _mcap) =>
      `Dogecoin is currently trading at ${price} in Indian Rupees. The price has ${isPos ? "moved up" : "moved down"} by ${change}% over the last 24 hours. DOGE/INR is one of the most popular pairs for first-time buyers in India — its low unit price makes it accessible to investors with smaller budgets. Social media sentiment, particularly from influencers and celebrities, plays a significant role in short-term DOGE price movements, making it one of the most volatile and exciting pairs to track.`,
    cta: "Convert DOGE to INR live",
  },
  "ripple-usd": {
    title: "XRP/USD — XRP to US Dollar",
    about: "Built for cross-border payments — XRP settles in 3–5 seconds at near-zero cost.",
    body: (price, change, isPos, mcap) =>
      `XRP is currently trading at ${price}. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours, with a market cap of ${mcap}. XRP is the native asset of the XRP Ledger, designed specifically for fast and low-cost international money transfers. Used by over 300 financial institutions globally, XRP's price is closely tied to Ripple Labs' regulatory developments, central bank digital currency (CBDC) partnerships, and the broader adoption of blockchain-based payment rails.`,
    cta: "Convert XRP to USD live",
  },
  "shiba-inu-inr": {
    title: "SHIB/INR — Shiba Inu to Indian Rupee",
    about: "The 'Dogecoin Killer' — now powering its own Layer 2 blockchain.",
    body: (price, change, isPos, _mcap) =>
      `Shiba Inu is currently trading at ${price} in Indian Rupees. The price has ${isPos ? "gained" : "lost"} ${change}% in the last 24 hours. SHIB is an Ethereum-based meme token that has grown far beyond its origins, now featuring its own decentralised exchange (ShibaSwap) and the Shibarium Layer 2 network. SHIB/INR is one of the most searched crypto pairs in India due to its ultra-low unit price, giving retail investors the feeling of holding millions of tokens for a modest investment.`,
    cta: "Convert SHIB to INR live",
  },
  "pepe-usd": {
    title: "PEPE/USD — Pepe to US Dollar",
    about: "The internet's favourite meme coin — launched in 2023 and already top 50 by market cap.",
    body: (price, change, isPos, mcap) =>
      `Pepe is currently trading at ${price}. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours, with a market cap of ${mcap}. Launched in April 2023, PEPE is a tribute to the iconic Pepe the Frog internet meme. It reached the top 50 cryptocurrencies within weeks of launch — driven entirely by community enthusiasm and social media momentum. PEPE/USD is an extremely volatile pair with no underlying utility, making it a high-risk, high-reward trade popular among meme-coin traders on Binance, OKX, and Bybit.`,
    cta: "Convert PEPE to USD live",
  },
  "binancecoin-usd": {
    title: "BNB/USD — BNB to US Dollar",
    about: "The native token of the world's largest crypto exchange ecosystem.",
    body: (price, change, isPos, mcap) =>
      `BNB is currently trading at ${price}. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours, with a market cap of ${mcap}. BNB is the utility token powering the Binance exchange and BNB Chain — a high-throughput blockchain used by over 300 million users. Holders use BNB to pay trading fees at a discount, participate in Binance Launchpad token sales, and fuel smart contract transactions on BNB Chain. Quarterly token burns reduce supply over time, supporting long-term price dynamics.`,
    cta: "Convert BNB to USD live",
  },
};

export default function PopularConversions() {
  const [prices, setPrices] = useState<PricesMap | null>(null);

  useEffect(() => {
    const ids = [...new Set(POPULAR_PAIRS.map((p) => p.from))].join(",");
    fetch(`/api/crypto/prices?ids=${ids}&vs_currencies=usd,inr`)
      .then((r) => r.json())
      .then(setPrices)
      .catch(() => {});
  }, []);

  return (
    <section>
      {/* Intro */}
      <div className="mb-10 pb-8 border-b border-[#1e2535]">
        <p className="section-label mb-2">Conversion Tables</p>
        <h2 className="text-2xl font-black text-white mb-4" style={{ color: "#ffffff" }}>
          Get the latest conversion rates for popular cryptocurrencies
        </h2>
        <p className="text-gray-400 text-base leading-relaxed max-w-3xl">
          Live conversion rates for Bitcoin, Ethereum, Solana, Dogecoin, and more — including the most
          common trading pairs like BTC/USD and ETH/INR. Prices update every 30 seconds from CoinGecko,
          making it easier to understand exactly how the market is moving right this minute.
        </p>
      </div>

      {/* Pair sections */}
      <div className="space-y-14">
        {POPULAR_PAIRS.map((pair) => {
          const vs = pair.toDisplay.toLowerCase() as "usd" | "inr";
          const sign = vs === "inr" ? "₹" : "$";
          const metaKey = `${pair.from}-${vs}`;
          const content = PAIR_CONTENT[metaKey];

          const data = prices?.[pair.from];
          const rate = data?.[vs] ?? 0;
          const change = data?.["usd_24h_change"] ?? 0;
          const mcap = data?.["usd_market_cap"] ?? 0;
          const isPos = change >= 0;

          const priceStr = formatPrice(rate, sign);
          const changeStr = Math.abs(change).toFixed(2);
          const mcapStr = formatPrice(mcap, "$");

          return (
            <div key={metaKey} id={metaKey} className="scroll-mt-24">
              {/* Heading + badge */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-black text-white leading-snug" style={{ color: "#ffffff" }}>
                    {content?.title ?? `${pair.fromSymbol}/${pair.toDisplay}`}
                  </h3>
                  {content?.about && (
                    <p className="text-[#c9a96e] text-sm mt-1">{content.about}</p>
                  )}
                </div>
                <Link
                  href={`/crypto-converter/${pair.from}-to-${vs}`}
                  className="shrink-0 self-start text-xs font-semibold text-[#c9a96e] hover:text-amber-300 border border-[#c9a96e]/30 hover:border-[#c9a96e]/60 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Live Converter →
                </Link>
              </div>

              {/* Live price line */}
              {rate > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-white font-bold text-lg" style={{ color: "#ffffff" }}>
                    1 {pair.fromSymbol} = {priceStr}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPos ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                    {isPos ? "▲" : "▼"} {changeStr}% (24h)
                  </span>
                </div>
              )}

              {/* Two-column layout: text left, table right */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
                {/* Description */}
                <div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {content?.body
                      ? content.body(priceStr, changeStr, isPos, mcapStr)
                      : `${pair.fromSymbol} is currently trading at ${priceStr}. The price has ${isPos ? "increased" : "decreased"} by ${changeStr}% in the last 24 hours.`}
                  </p>
                  {content?.cta && (
                    <Link
                      href={`/crypto-converter/${pair.from}-to-${vs}`}
                      className="inline-block mt-4 text-sm text-[#c9a96e] hover:text-amber-300 underline underline-offset-4 transition-colors"
                    >
                      {content.cta} →
                    </Link>
                  )}
                </div>

                {/* Compact table */}
                <div className="bg-[#0d1117] border border-[#1e2535] rounded-xl overflow-hidden">
                  <div className="grid grid-cols-2 border-b border-[#1e2535]">
                    <span className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                      {pair.fromSymbol}
                    </span>
                    <span className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray-500 font-medium text-right">
                      {pair.toDisplay}
                    </span>
                  </div>
                  {TABLE_AMOUNTS.map((amt) => (
                    <div
                      key={amt}
                      className="grid grid-cols-2 border-b border-[#0f1520] last:border-0 hover:bg-[#111827] transition-colors"
                    >
                      <span className="px-4 py-2 text-gray-400 font-mono text-xs">
                        {amt} {pair.fromSymbol}
                      </span>
                      <span className="px-4 py-2 text-right text-white font-mono text-xs">
                        {rate ? formatVal(rate * amt) : <span className="text-gray-600">—</span>}
                      </span>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t border-[#1e2535]">
                    <p className="text-[10px] text-gray-600">Source: CoinGecko · Updates every 30s</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="mt-10 border-b border-[#1e2535]" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
