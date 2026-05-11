import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConverterCard from "@/components/crypto-converter/ConverterCard";
import FAQSection from "@/components/crypto-converter/FAQSection";
import ConversionTablesContent from "@/components/crypto-converter/ConversionTablesContent";
import FearGreedWidget from "@/components/crypto-converter/FearGreedWidget";
import TrendingSection from "@/components/crypto-converter/TrendingSection";
import { CRYPTO_TOKENS, FIAT_CURRENCIES } from "@/lib/crypto-tokens";

interface Params {
  pair: string;
}

function parsePair(pair: string) {
  const lower = pair.toLowerCase();
  const sep = lower.indexOf("-to-");
  if (sep === -1) return null;

  const fromSlug = lower.slice(0, sep);
  const toSlug = lower.slice(sep + 4);

  const fromToken =
    CRYPTO_TOKENS.find((c) => c.id === fromSlug || c.symbol.toLowerCase() === fromSlug);
  if (!fromToken) return null;

  const toFiat = FIAT_CURRENCIES.find((f) => f.symbol.toLowerCase() === toSlug);
  const toCrypto = !toFiat
    ? CRYPTO_TOKENS.find((c) => c.id === toSlug || c.symbol.toLowerCase() === toSlug)
    : undefined;

  if (!toFiat && !toCrypto) return null;

  return { fromToken, toFiat, toCrypto, toSlug };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return { title: "Crypto Converter | TheMarketStories" };

  const { fromToken, toFiat, toCrypto } = parsed;
  const toName = toFiat?.name ?? toCrypto?.name ?? "";
  const toSymbol = toFiat?.symbol ?? toCrypto?.symbol ?? "";

  const title = `${fromToken.symbol} to ${toSymbol} Converter — Live ${fromToken.name} Price in ${toName} | TheMarketStories`;
  const description = `Convert ${fromToken.name} (${fromToken.symbol}) to ${toName} (${toSymbol}) with live real-time prices. 1 ${fromToken.symbol} to ${toSymbol} rate updated every 5 seconds.`;

  return {
    title,
    description,
    alternates: { canonical: `/crypto-converter/${pair}` },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  const popularPairs = [
    "bitcoin-to-usd",
    "bitcoin-to-inr",
    "ethereum-to-usd",
    "ethereum-to-inr",
    "solana-to-usd",
    "solana-to-inr",
    "ripple-to-usd",
    "dogecoin-to-usd",
    "dogecoin-to-inr",
    "binancecoin-to-usd",
    "cardano-to-usd",
    "shiba-inu-to-inr",
    "pepe-to-usd",
    "bitcoin-to-eur",
    "ethereum-to-eur",
  ];
  return popularPairs.map((pair) => ({ pair }));
}

export default async function PairPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();

  const { fromToken, toFiat, toCrypto, toSlug } = parsed;
  const toName = toFiat?.name ?? toCrypto?.name ?? "";
  const toSymbol = toFiat?.symbol ?? toCrypto?.symbol ?? "";

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <div className="site-container px-4 md:px-6 xl:px-8">

        {/* Hero */}
        <section className="py-12 md:py-16 border-b border-[#1e2535]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="section-label mb-4">Crypto Converter</p>
              <h1
                className="text-4xl sm:text-5xl font-black leading-[1.05] mb-4"
                style={{ color: "#ffffff" }}
              >
                {fromToken.name} to {toName}{" "}
                <span className="text-[#c9a96e] italic font-serif">Converter</span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-lg">
                Convert {fromToken.symbol} to {toSymbol} with live real-time prices updated every
                5 seconds. Sourced directly from CoinGecko.
              </p>

              {/* Breadcrumb schema hints */}
              <nav className="flex items-center gap-2 text-xs text-gray-600">
                <a href="/crypto-converter" className="hover:text-gray-400 transition-colors">
                  Crypto Converter
                </a>
                <span>/</span>
                <span className="text-gray-400">{fromToken.symbol} to {toSymbol}</span>
              </nav>
            </div>

            <div>
              <ConverterCard defaultFrom={fromToken.id} defaultTo={toSlug} />
            </div>
          </div>
        </section>

        {/* Conversion table for this specific pair */}
        <section className="py-12 border-b border-[#1e2535]">
          <p className="section-label mb-4">{fromToken.symbol} to {toSymbol} Conversion Table</p>
          <div className="bg-[#0d1117] border border-[#1e2535] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2535]">
                  <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                    {fromToken.symbol}
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                    {toSymbol}
                  </th>
                </tr>
              </thead>
              <tbody id="conv-table">
                {[0.001, 0.01, 0.1, 0.5, 1, 5, 10, 25, 50, 100, 500, 1000].map((amt) => (
                  <tr key={amt} className="border-b border-[#131825] last:border-0 hover:bg-[#0d1117] transition-colors">
                    <td className="px-6 py-3 text-gray-400 font-mono text-xs">
                      {amt} {fromToken.symbol}
                    </td>
                    <td className="px-6 py-3 text-right text-white font-mono text-xs" data-amt={amt}>
                      {/* Price filled client-side via ConverterCard fetch */}
                      <span className="text-gray-600">—</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            * Live prices from the converter above. Refresh the page to update.
          </p>
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
