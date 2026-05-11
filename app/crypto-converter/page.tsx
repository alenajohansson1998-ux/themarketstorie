import type { Metadata } from "next";
import ConverterCard from "@/components/crypto-converter/ConverterCard";
import TrendingSection from "@/components/crypto-converter/TrendingSection";
import FAQSection from "@/components/crypto-converter/FAQSection";
import FearGreedWidget from "@/components/crypto-converter/FearGreedWidget";
import ConversionTablesContent from "@/components/crypto-converter/ConversionTablesContent";

export const metadata: Metadata = {
  title: "Crypto Converter — Live Cryptocurrency Price Calculator | TheMarketStories",
  description:
    "Convert Bitcoin, Ethereum, and 65+ cryptocurrencies to USD, INR, EUR, and 30+ fiat currencies in real time. Live prices from CoinGecko, refreshed every 5 seconds.",
  alternates: { canonical: "/crypto-converter" },
  openGraph: {
    title: "Crypto Converter — Live Cryptocurrency Price Calculator",
    description: "Convert 65+ cryptocurrencies to 30+ fiat currencies in real time.",
    type: "website",
  },
};

export default function CryptoConverterPage() {
  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <div className="site-container px-4 md:px-6 xl:px-8">

        {/* Hero */}
        <section className="py-12 md:py-16 border-b border-[#1e2535]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left — copy */}
            <div>
              <p className="section-label mb-4">Crypto Converter</p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] mb-5"
                style={{ color: "#ffffff" }}
              >
                Live crypto prices,{" "}
                <span className="text-[#c9a96e] italic font-serif">instant</span>{" "}
                conversion.
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
                Convert Bitcoin, Ethereum, and 65+ cryptocurrencies to USD, INR,
                EUR, and 30+ fiat currencies. Prices refreshed every 5 seconds
                from CoinGecko.
              </p>
              <div className="flex flex-wrap gap-6">
                {[
                  { value: "65+", label: "Cryptocurrencies" },
                  { value: "30+", label: "Fiat Currencies" },
                  { value: "5s", label: "Refresh Rate" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-black text-white" style={{ color: "#ffffff" }}>
                      {s.value}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — converter card */}
            <div>
              <ConverterCard />
            </div>
          </div>
        </section>

        {/* Fear & Greed + Trending */}
        <section className="py-12 border-b border-[#1e2535]">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <FearGreedWidget />
            <TrendingSection />
          </div>
        </section>

        {/* Conversion tables editorial content */}
        <section className="py-12 border-b border-[#1e2535]">
          <ConversionTablesContent />
        </section>

        {/* FAQ */}
        <section className="py-12">
          <FAQSection />
        </section>

      </div>
    </div>
  );
}
