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
    <div className="site-container px-4 md:px-6">
      <section className="grid grid-cols-1 items-center gap-10 border-b border-line-soft py-10 lg:grid-cols-2 lg:py-14">
        <div>
          <p className="section-label">Tools</p>
          <h1 className="mt-1 text-title1 text-ink sm:text-display">Crypto converter</h1>
          <p className="mt-4 max-w-lg text-title3 font-normal text-ink-2">
            Convert Bitcoin, Ethereum and 65+ cryptocurrencies into USD, INR, EUR and 30+ other currencies at live
            prices.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {[
              { value: "65+", label: "Cryptocurrencies" },
              { value: "30+", label: "Currencies" },
              { value: "5 s", label: "Price refresh" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="text-footnote text-ink-2">{s.label}</dt>
                <dd className="text-title2 tabular-nums text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ConverterCard />
      </section>

      <section className="grid grid-cols-1 gap-8 border-b border-line-soft py-12 lg:grid-cols-[280px_1fr]">
        <FearGreedWidget />
        <TrendingSection />
      </section>

      <section className="border-b border-line-soft py-12">
        <ConversionTablesContent />
      </section>

      <section className="py-12">
        <FAQSection />
      </section>
    </div>
  );
}
