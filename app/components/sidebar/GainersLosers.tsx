"use client";
import useSWR from "swr";

export default function GainersLosers() {
  const { data } = useSWR("/api/finnhub/gainers-losers", url =>
    fetch(url).then(r => r.json())
  );

  if (!data) return null;

  return (
    <div className="border rounded-xl p-3 space-y-3">
      <Block title="Top Gainers" items={data.gainers} positive />
      <Block title="Top Losers" items={data.losers} />
    </div>
  );
}

function Block({ title, items, positive }: any) {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      {items.map((i: any) => (
        <div key={i.symbol} className="flex justify-between text-sm py-1">
          <span>{i.symbol}</span>
          <span className={positive ? "text-green-600" : "text-red-600"}>
            {i.change.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}
