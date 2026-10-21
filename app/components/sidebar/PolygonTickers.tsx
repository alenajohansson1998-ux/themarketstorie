"use client";
import useSWR from "swr";

interface TickerRow {
  ticker: string;
  todaysChangePerc: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatPct(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

export default function PolygonTickers() {
  const { data, error } = useSWR<TickerRow[] | { error: string }>("/api/twelvedata/crypto", fetcher);

  const rows = Array.isArray(data) ? data : [];
  const failed = Boolean(error) || (data && !Array.isArray(data));

  return (
    <section className="border-t border-line-soft pt-4">
      <h3 className="mb-2 text-headline text-ink">Crypto</h3>
      {!data && !error ? (
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-fill" />
          ))}
        </div>
      ) : failed || rows.length === 0 ? (
        <p className="text-subhead text-ink-2">Crypto prices are unavailable right now.</p>
      ) : (
        <ul className="tabular-nums">
          {rows.map((row) => (
            <li key={row.ticker} className="flex justify-between py-1.5 text-subhead">
              <span className="font-medium text-ink">{row.ticker}</span>
              <span className={row.todaysChangePerc >= 0 ? "text-up" : "text-down"}>
                {formatPct(row.todaysChangePerc ?? 0)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
