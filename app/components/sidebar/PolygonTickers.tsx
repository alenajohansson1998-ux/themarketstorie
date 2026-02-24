"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());


export default function PolygonTickers() {
  const { data: crypto } = useSWR("/api/twelvedata/crypto", fetcher);

  const renderSection = (title: string, data: any) => {
    if (!data) return <div className="text-gray-400 text-sm">Loading...</div>;
    if (data.error) return <div className="text-red-500 text-sm">{data.error}</div>;
    if (!Array.isArray(data) || data.length === 0) return <div className="text-gray-400 text-sm">No data available.</div>;
    return data.map((t: any) => (
      <Row key={t.ticker} name={t.ticker} value={t.todaysChangePerc} />
    ));
  };

  return (
    <div className="space-y-4">
      <Section title="Crypto">
        {renderSection("Crypto", crypto)}
      </Section>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="border rounded-xl p-3">
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Row({ name, value }: any) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span>{name}</span>
      <span className={value >= 0 ? "text-green-600" : "text-red-600"}>
        {value?.toFixed(2)}%
      </span>
    </div>
  );
}
