"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { POPULAR_PAIRS } from "@/lib/crypto-tokens";

interface PriceData {
  usd?: number;
  inr?: number;
  usd_24h_change?: number;
  usd_market_cap?: number;
  [key: string]: number | undefined;
}
interface PricesMap { [id: string]: PriceData; }

function fmt(n: number, sign = "$"): string {
  if (!n) return "—";
  if (n >= 1_000_000_000) return `${sign}${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${sign}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${sign}${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (n >= 1) return `${sign}${n.toFixed(4)}`;
  return `${sign}${n.toFixed(8)}`;
}

const PAIR_EDITORIAL: Record<string, {
  label: string;
  tagline: string;
  intro: string;
  bodyFn: (price: string, change: string, isPos: boolean, mcap: string, sign: string) => string[];
  closing?: string;
  closingLink?: { label: string; href: string };
}> = {
  "bitcoin-usd": {
    label: "BTC/USD",
    tagline: "The world's biggest cryptocurrency & the world's largest fiat currency.",
    intro: "",
    bodyFn: (price, change, isPos, mcap) => [
      `Bitcoin is currently trading at ${price}. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours. The current price of Bitcoin means that it has a market cap of ${mcap}. Bitcoin is still a popular asset, despite all of the changes in the crypto market.`,
      `As the largest cryptocurrency, Bitcoin trends will often impact the entire crypto market. Bitcoin's fixed supply of 21 million coins and its role as a hedge against inflation make it the most widely held digital asset by both retail and institutional investors worldwide.`,
    ],
  },
  "bitcoin-inr": {
    label: "BTC/INR",
    tagline: "The most searched cryptocurrency pair in India.",
    intro: "",
    bodyFn: (price, change, isPos) => [
      `Bitcoin is currently trading at ${price} in Indian Rupees. The price has ${isPos ? "risen" : "fallen"} by ${change}% in the last 24 hours. BTC/INR is consistently one of the highest-volume pairs on Indian exchanges including WazirX, CoinDCX, and Zebpay.`,
      `With growing retail and institutional adoption across India, the BTC/INR rate is closely watched by millions of investors as a key indicator of crypto market sentiment in the country. Regulatory developments from RBI and SEBI also play a role in shaping short-term BTC/INR movements.`,
    ],
  },
  "ethereum-usd": {
    label: "ETH/USD",
    tagline: "The second largest cryptocurrency by market cap and arguably one of the most commonly used computing platforms.",
    intro: "Ethereum is a decentralised computing platform that can run a wide range of applications — including a universe of decentralised finance (or DeFi) apps and services. With its migration to Proof-of-Stake (The Merge), Ethereum improved its blockchain security, reduced energy usage, and laid the groundwork for future scalability improvements through Layer 2 networks.",
    bodyFn: (price, change, isPos, mcap) => [
      `Ethereum is currently trading at ${price}. The price of Ethereum has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours. The current price of Ethereum means that it has a market cap of ${mcap}.`,
    ],
    closing: "Should I convert my fiat cash to crypto today? You have a lot of options when it comes to buying and trading crypto. Ethereum powers the majority of DeFi protocols, NFT platforms, and Layer 2 networks — making it a foundational asset in the digital economy.",
  },
  "ethereum-inr": {
    label: "ETH/INR",
    tagline: "Ethereum priced in Indian Rupees — the gateway for Indian DeFi users.",
    intro: "",
    bodyFn: (price, change, isPos) => [
      `Ethereum is currently trading at ${price} in Indian Rupees. The price has ${isPos ? "moved up" : "moved down"} by ${change}% over the last 24 hours. ETH/INR is the second most traded crypto pair in India, driven by a growing community of developers, DeFi users, and NFT creators.`,
      `Gas fees, network upgrades, and global risk sentiment are the primary factors that influence the ETH/INR exchange rate on a daily basis. Indian investors increasingly see ETH as a long-term portfolio holding alongside Bitcoin.`,
    ],
  },
  "solana-usd": {
    label: "SOL/USD",
    tagline: "The fastest Layer 1 blockchain — a top-5 cryptocurrency by market cap.",
    intro: "Solana is a high-performance blockchain capable of processing over 65,000 transactions per second at a fraction of a cent per transaction. Its growing DeFi ecosystem, NFT marketplaces, and the emergence of real-world asset tokenisation projects have made Solana one of the most actively developed blockchains in the world.",
    bodyFn: (price, change, isPos, mcap) => [
      `Solana is currently trading at ${price}. The price has ${isPos ? "gained" : "lost"} ${change}% in the last 24 hours, giving it a market cap of ${mcap}. SOL/USD is one of the most watched altcoin pairs among both retail traders and institutional investors.`,
    ],
  },
  "solana-inr": {
    label: "SOL/INR",
    tagline: "Solana in Indian Rupees — fast, cheap, and increasingly popular in India.",
    intro: "",
    bodyFn: (price, change, isPos) => [
      `Solana is currently trading at ${price} in Indian Rupees. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours. SOL/INR has become one of the fastest-growing pairs on Indian crypto exchanges.`,
      `Solana's low transaction costs and high throughput make it particularly attractive to Indian developers and retail traders looking for an alternative to the higher gas fees on Ethereum. The SOL/INR rate closely tracks global SOL price movements adjusted for USD/INR exchange rates.`,
    ],
  },
  "dogecoin-usd": {
    label: "DOGE/USD",
    tagline: "From internet meme to top-10 cryptocurrency.",
    intro: "Dogecoin was originally created in 2013 as a lighthearted joke inspired by the Doge meme. Despite its origins, DOGE has evolved into a legitimate cryptocurrency with merchant acceptance, a fast 1-minute block time, and one of the most loyal communities in crypto.",
    bodyFn: (price, change, isPos, mcap) => [
      `Dogecoin is currently trading at ${price}. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours, with a market cap of ${mcap}. DOGE/USD remains one of the most volatile and widely tracked pairs in the market, heavily influenced by social media sentiment and celebrity endorsements.`,
    ],
  },
  "dogecoin-inr": {
    label: "DOGE/INR",
    tagline: "A favourite entry point for first-time Indian crypto investors.",
    intro: "",
    bodyFn: (price, change, isPos) => [
      `Dogecoin is currently trading at ${price} in Indian Rupees. The price has ${isPos ? "moved up" : "moved down"} by ${change}% over the last 24 hours. DOGE/INR is one of the most popular pairs for first-time buyers in India — its low unit price makes it accessible to investors with smaller budgets.`,
      `Social media trends, particularly from influencers and public figures, play a significant role in short-term DOGE price movements, making it one of the most exciting and unpredictable pairs to track.`,
    ],
  },
  "ripple-usd": {
    label: "XRP/USD",
    tagline: "Built for cross-border payments — settles in 3–5 seconds at near-zero cost.",
    intro: "XRP is the native asset of the XRP Ledger, a blockchain designed specifically for fast and low-cost international money transfers. Unlike most cryptocurrencies, XRP was created to complement the existing financial system, and is actively used by over 300 banks and payment providers worldwide.",
    bodyFn: (price, change, isPos, mcap) => [
      `XRP is currently trading at ${price}. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours, with a market cap of ${mcap}. XRP/USD is closely watched by institutional investors and payment-focused traders due to Ripple Labs' expanding network of financial institution partnerships.`,
    ],
  },
  "shiba-inu-inr": {
    label: "SHIB/INR",
    tagline: "The 'Dogecoin Killer' — now powering its own Layer 2 blockchain.",
    intro: "Shiba Inu is an Ethereum-based meme token that has grown far beyond its origins, now featuring its own decentralised exchange (ShibaSwap), the Shibarium Layer 2 network, and an active ecosystem of companion tokens.",
    bodyFn: (price, change, isPos) => [
      `Shiba Inu is currently trading at ${price} in Indian Rupees. The price has ${isPos ? "gained" : "lost"} ${change}% in the last 24 hours. SHIB/INR is one of the most searched crypto pairs in India due to its ultra-low unit price, giving retail investors the feeling of holding millions of tokens for a modest investment.`,
    ],
  },
  "pepe-usd": {
    label: "PEPE/USD",
    tagline: "The internet's favourite meme coin — launched in 2023 and already a top-50 asset.",
    intro: "Pepe is a meme cryptocurrency inspired by the iconic Pepe the Frog internet meme. Launched in April 2023 with no presale and no team allocation, it reached the top 50 cryptocurrencies within weeks purely on community momentum.",
    bodyFn: (price, change, isPos, mcap) => [
      `Pepe is currently trading at ${price}. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours, with a market cap of ${mcap}. PEPE/USD is an extremely volatile pair driven primarily by social media sentiment, crypto Twitter activity, and broader meme-coin market cycles.`,
    ],
    closing: "PEPE carries significant risk due to its speculative nature and lack of underlying utility. It is suitable only for investors who fully understand and accept the risks of meme-coin trading.",
  },
  "binancecoin-usd": {
    label: "BNB/USD",
    tagline: "The native token of the world's largest crypto exchange ecosystem.",
    intro: "BNB is the utility token powering the Binance exchange and BNB Chain — a high-throughput blockchain used by hundreds of millions of users. Holders use BNB to pay trading fees at a discount, participate in Binance Launchpad token sales, and fuel transactions on BNB Chain.",
    bodyFn: (price, change, isPos, mcap) => [
      `BNB is currently trading at ${price}. The price has ${isPos ? "increased" : "decreased"} by ${change}% in the last 24 hours, with a market cap of ${mcap}. BNB/USD is one of the most liquid altcoin pairs globally, with quarterly token burns reducing supply over time and supporting long-term price dynamics.`,
    ],
  },
};

export default function ConversionTablesContent() {
  const [prices, setPrices] = useState<PricesMap | null>(null);

  useEffect(() => {
    const ids = [...new Set(POPULAR_PAIRS.map((p) => p.from))].join(",");
    fetch(`/api/crypto/prices?ids=${ids}&vs_currencies=usd,inr`)
      .then((r) => r.json())
      .then(setPrices)
      .catch(() => {});
  }, []);

  return (
    <section className="w-full">
      {/* Section heading */}
      <h2 className="text-4xl font-black text-white mb-8" style={{ color: "#ffffff" }}>
        Conversion tables
      </h2>

      {/* Intro */}
      <p className="text-gray-300 text-base leading-relaxed mb-10 max-w-none">
        Get the latest conversion rates for popular cryptocurrencies, like Bitcoin, Ethereum,
        Cardano, Solana, Dogecoin, and others. Up-to-date rates for common trading pairs, like
        BTC/USD, will make it easier to understand how the market is moving right this minute.
      </p>

      {/* Pair entries */}
      <div className="space-y-10">
        {POPULAR_PAIRS.map((pair) => {
          const vs = pair.toDisplay.toLowerCase() as "usd" | "inr";
          const sign = vs === "inr" ? "₹" : "$";
          const key = `${pair.from}-${vs}`;
          const ed = PAIR_EDITORIAL[key];
          if (!ed) return null;

          const data = prices?.[pair.from];
          const rate = data?.[vs] ?? 0;
          const change = data?.usd_24h_change ?? 0;
          const mcap = data?.usd_market_cap ?? 0;
          const isPos = change >= 0;
          const priceStr = fmt(rate, sign);
          const changeStr = Math.abs(change).toFixed(2);
          const mcapStr = fmt(mcap, "$");

          const paragraphs = ed.bodyFn(priceStr, changeStr, isPos, mcapStr, sign);

          return (
            <div key={key}>
              {/* Pair label + tagline */}
              <p className="text-white text-base leading-relaxed mb-3" style={{ color: "#ffffff" }}>
                <span className="font-bold text-[#c9a96e]">{ed.label}</span>
                {" — "}
                {ed.tagline}
              </p>

              {/* Optional intro paragraph */}
              {ed.intro && (
                <p className="text-gray-300 text-base leading-relaxed mb-3">{ed.intro}</p>
              )}

              {/* Body paragraphs with live data */}
              {paragraphs.map((p, i) => (
                <p key={i} className="text-gray-300 text-base leading-relaxed mb-3">{p}</p>
              ))}

              {/* Optional closing paragraph */}
              {ed.closing && (
                <p className="text-gray-300 text-base leading-relaxed mb-3">
                  {ed.closing}{" "}
                  {ed.closingLink && (
                    <Link href={ed.closingLink.href} className="text-[#c9a96e] underline underline-offset-2 hover:text-amber-300 transition-colors">
                      {ed.closingLink.label}
                    </Link>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
