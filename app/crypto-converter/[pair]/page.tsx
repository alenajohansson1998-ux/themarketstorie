import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PairConversionTable from "@/components/crypto-converter/PairConversionTable";
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
    <div className="site-container px-4 md:px-6">
      <section className="grid grid-cols-1 items-center gap-10 border-b border-line-soft py-10 lg:grid-cols-2 lg:py-14">
        <div>
          <nav aria-label="Breadcrumb" className="text-footnote text-ink-2">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/crypto-converter" className="hover:text-ink hover:underline">
                  Crypto converter
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li aria-current="page" className="text-ink">
                {fromToken.symbol} to {toSymbol}
              </li>
            </ol>
          </nav>
          <h1 className="mt-2 text-title1 text-ink sm:text-display">
            {fromToken.name} to {toName}
          </h1>
          <p className="mt-4 max-w-lg text-title3 font-normal text-ink-2">
            Convert {fromToken.symbol} to {toSymbol} at live prices from CoinGecko, refreshed every 5 seconds.
          </p>
        </div>
        <ConverterCard defaultFrom={fromToken.id} defaultTo={toSlug} />
      </section>

      <section className="border-b border-line-soft py-12" aria-labelledby="pair-table">
        <h2 id="pair-table" className="mb-4 text-title2 text-ink">
          {fromToken.symbol} to {toSymbol} conversion table
        </h2>
        <div className="max-w-2xl">
          <PairConversionTable
            fromId={fromToken.id}
            fromSymbol={fromToken.symbol}
            toCryptoId={toCrypto?.id}
            toFiat={toFiat?.symbol}
            toSymbol={toSymbol}
            toSign={toFiat?.sign}
          />
        </div>
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
