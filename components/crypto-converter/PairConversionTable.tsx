"use client";

import useSWR from "swr";

const AMOUNTS = [0.001, 0.01, 0.1, 0.5, 1, 5, 10, 25, 50, 100, 500, 1000];

interface PairConversionTableProps {
  fromId: string;
  fromSymbol: string;
  /** CoinGecko id when converting to another coin */
  toCryptoId?: string;
  /** Fiat code (e.g. "USD") when converting to a currency */
  toFiat?: string;
  toSymbol: string;
  toSign?: string;
}

type PriceResponse = Record<string, Record<string, number>>;

const fetcher = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error("price"))));

function format(value: number) {
  if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return value.toLocaleString("en-US", { maximumSignificantDigits: 6 });
}

/** Amount table for a single pair, filled from live prices. */
export default function PairConversionTable({
  fromId,
  fromSymbol,
  toCryptoId,
  toFiat,
  toSymbol,
  toSign = "",
}: PairConversionTableProps) {
  const vs = (toFiat ?? "usd").toLowerCase();
  const ids = toCryptoId ? `${fromId},${toCryptoId}` : fromId;
  const { data, error, isLoading } = useSWR<PriceResponse>(
    `/api/crypto/prices?ids=${ids}&vs_currencies=${vs},usd`,
    fetcher,
    { refreshInterval: 30_000 }
  );

  let rate: number | null = null;
  if (data?.[fromId]) {
    if (toCryptoId) {
      const fromUsd = data[fromId]?.usd;
      const toUsd = data[toCryptoId]?.usd;
      rate = fromUsd && toUsd ? fromUsd / toUsd : null;
    } else {
      rate = data[fromId]?.[vs] ?? null;
    }
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-card border border-line-soft">
        <table className="w-full text-subhead tabular-nums">
          <caption className="sr-only">
            {fromSymbol} to {toSymbol} conversion amounts
          </caption>
          <thead>
            <tr className="border-b border-line-soft">
              <th scope="col" className="px-5 py-3 text-left text-footnote font-semibold text-ink-2">
                {fromSymbol}
              </th>
              <th scope="col" className="px-5 py-3 text-right text-footnote font-semibold text-ink-2">
                {toSymbol}
              </th>
            </tr>
          </thead>
          <tbody aria-busy={isLoading}>
            {AMOUNTS.map((amount) => (
              <tr key={amount} className="border-b border-line-soft last:border-0">
                <td className="px-5 py-3 text-ink">
                  {amount} {fromSymbol}
                </td>
                <td className="px-5 py-3 text-right font-medium text-ink">
                  {rate !== null ? (
                    `${toSign}${format(rate * amount)} ${toSymbol}`
                  ) : isLoading ? (
                    <span className="inline-block h-3 w-20 animate-pulse rounded bg-fill" aria-hidden="true" />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-footnote text-ink-2">
        {error ? "Prices are unavailable right now." : "Live prices from CoinGecko, refreshed every 30 seconds."}
      </p>
    </div>
  );
}
