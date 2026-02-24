"use client";




import React from "react";
import { CURRENCIES } from '@/lib/forex/currencies';

// Use the same Flag component as HeatmapTable
const FLAG_API_KEY = process.env.NEXT_PUBLIC_NINJAS_API_KEY || '';
const codeToCountry: Record<string, string> = {
  EUR: 'EU', USD: 'US', GBP: 'GB', JPY: 'JP', CHF: 'CH', AUD: 'AU', NZD: 'NZ', HKD: 'HK', TWD: 'TW', SGD: 'SG', CNY: 'CN', KRW: 'KR', AED: 'AE', ZAR: 'ZA', CAD: 'CA', INR: 'IN'
};
function Flag({ code, alt }: { code: string; alt?: string }) {
  const [url, setUrl] = React.useState<string | null>(null);
  const cache = React.useRef<Record<string, string>>({});
  React.useEffect(() => {
    const country = codeToCountry[code];
    if (!country) return;
    const localKey = `flag_url_${country}`;
    const stored = typeof window !== 'undefined' ? localStorage.getItem(localKey) : null;
    if (stored) {
      setUrl(stored);
      cache.current[country] = stored;
      return;
    }
    if (cache.current[country]) {
      setUrl(cache.current[country]);
      return;
    }
    fetch(`https://api.api-ninjas.com/v1/countryflag?country=${country}`, {
      headers: { 'X-Api-Key': FLAG_API_KEY },
    })
      .then(res => res.json())
      .then(data => {
        if (data.rectangle_image_url) {
          cache.current[country] = data.rectangle_image_url;
          setUrl(data.rectangle_image_url);
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(localKey, data.rectangle_image_url);
            }
          } catch {}
        }
      })
      .catch(() => setUrl(null));
  }, [code]);
  if (!url) return <span className="inline-block mr-2 text-xl align-middle">{code}</span>;
  return <img src={url} alt={alt || code} className="inline-block w-6 h-6 mr-2 align-middle rounded-full border" />;
}

interface CrossRatesTableProps {
  matrix: any[][] | null;
  currencies: { code: string; name: string; flag: string }[];
}

const CrossRatesTable: React.FC<CrossRatesTableProps> = ({ matrix, currencies }) => (
  <div className="overflow-auto">
    <table className="min-w-max w-full border-separate border-spacing-0 rounded-xl shadow bg-white text-xs sm:text-base">
      <thead>
        <tr>
          <th className="sticky left-0 top-0 bg-white z-20 rounded-tl-xl"></th>
          {currencies.map((c) => (
            <th key={c.code} className="sticky top-0 bg-white z-10 px-2 sm:px-4 py-2 sm:py-3 text-base font-bold border-b border-r first:rounded-tr-xl text-center">
              <span className="align-middle mr-1 text-xs font-semibold text-gray-500">{codeToCountry[c.code] || c.code}</span>
              <Flag code={c.code} alt={c.code} />
              <span className="font-bold align-middle">{c.code}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {currencies.map((base, rowIdx) => (
          <tr key={base.code}>
            <th className="sticky left-0 bg-white z-10 px-2 sm:px-4 py-2 sm:py-3 text-base font-bold border-b border-r text-center">
              <span className="align-middle mr-1 text-xs font-semibold text-gray-500">{codeToCountry[base.code] || base.code}</span>
              <Flag code={base.code} alt={base.code} />
              <span className="font-bold align-middle">{base.code}</span>
            </th>
            {currencies.map((quote, colIdx) => {
              if (rowIdx === colIdx) return <td key={quote.code} className="border border-gray-200 bg-gray-50 text-center"></td>;
              const cell = matrix?.[rowIdx]?.[colIdx] ?? null;
              let display = "-";
              if (
                cell !== null &&
                cell !== undefined &&
                cell !== "-" &&
                !isNaN(Number(cell)) &&
                isFinite(Number(cell))
              ) {
                display = Number(cell).toLocaleString(undefined, { maximumFractionDigits: 6 });
              }
              return (
                <td key={quote.code} className="border border-gray-200 text-center font-mono text-base sm:text-lg px-2 sm:px-4 py-2 sm:py-3">
                  {display}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CrossRatesTable;
