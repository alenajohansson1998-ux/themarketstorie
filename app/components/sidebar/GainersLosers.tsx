"use client";
import useSWR from "swr";

interface Mover {
  symbol: string;
  change: number;
}

function formatPct(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

export default function GainersLosers() {
  const { data } = useSWR<{ gainers?: Mover[]; losers?: Mover[] }>("/api/finnhub/gainers-losers", (url: string) =>
    fetch(url).then((r) => r.json())
  );

  if (!data || (!data.gainers?.length && !data.losers?.length)) return null;

  return (
    <div className="space-y-5">
      <Block title="Top gainers" items={data.gainers ?? []} />
      <Block title="Top losers" items={data.losers ?? []} />
    </div>
  );
}

function Block({ title, items }: { title: string; items: Mover[] }) {
  if (items.length === 0) return null;
  return (
    <section className="border-t border-line-soft pt-4">
      <h3 className="mb-2 text-headline text-ink">{title}</h3>
      <ul className="tabular-nums">
        {items.map((item) => (
          <li key={item.symbol} className="flex justify-between py-1.5 text-subhead">
            <span className="font-medium text-ink">{item.symbol}</span>
            <span className={item.change >= 0 ? "text-up" : "text-down"}>{formatPct(item.change)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
