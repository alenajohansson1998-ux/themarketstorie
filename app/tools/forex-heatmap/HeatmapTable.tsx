"use client";
import React, { useState, useEffect, useRef } from 'react';
import { CURRENCIES } from '../../../lib/forex/currencies';
import { getHeatmapColor } from './colorScale';

const FLAG_API_KEY = process.env.NEXT_PUBLIC_NINJAS_API_KEY || '';
const codeToCountry: Record<string, string> = {
  EUR: 'EU', USD: 'US', GBP: 'GB', JPY: 'JP', CHF: 'CH', AUD: 'AU', CNY: 'CN', CAD: 'CA', INR: 'IN',
};
function Flag({ code, alt }: { code: string; alt?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const cache = useRef<Record<string, string>>({});
  useEffect(() => {
    const country = codeToCountry[code];
    if (!country) return;
    // Try localStorage first
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

const TIME_FILTERS = ['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD', 'All'];

function Tooltip({ base, quote, value }: { base: string; quote: string; value: number | null }) {
  if (value === null) return null;
  return (
    <div className="absolute z-50 p-3 text-sm bg-white border rounded-lg shadow-lg min-w-[120px]">
      <div className="flex items-center gap-2 mb-1">
        <Flag code={base} alt={base} /> <b>{base}</b>
        <span className="text-gray-500">vs</span>
        <Flag code={quote} alt={quote} /> <b>{quote}</b>
      </div>
      <div className="font-mono text-lg font-bold">{value > 0 ? '+' : ''}{value?.toFixed(2)}%</div>
    </div>
  );
}

export default function HeatmapTable() {
  const [matrix, setMatrix] = useState<Array<Array<{ base: string; quote: string; changePercent: number } | null>>>(Array(CURRENCIES.length).fill(null).map(() => Array(CURRENCIES.length).fill(null)));
  const [filter, setFilter] = useState('1D');
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    fetch(`/api/tools/forex-heatmap?filter=${filter}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.matrix) && data.matrix.length === CURRENCIES.length) {
          setMatrix(data.matrix);
        } else {
          setMatrix(Array(CURRENCIES.length).fill(null).map(() => Array(CURRENCIES.length).fill(null)));
        }
      })
      .catch(() => {
        setMatrix(Array(CURRENCIES.length).fill(null).map(() => Array(CURRENCIES.length).fill(null)));
      });
  }, [filter]);

  return (
    <>
      <div className="overflow-auto">
        {/* ...existing code... */}
        <table className="min-w-max w-full border-separate border-spacing-0 rounded-xl shadow bg-white text-xs sm:text-base">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 bg-white z-20 rounded-tl-xl"></th>
              {CURRENCIES.map((c, colIdx) => (
                <th key={c.code} className={`sticky top-0 bg-white z-10 px-2 sm:px-4 py-2 sm:py-3 text-base font-bold border-b border-r first:rounded-tr-xl text-center`}>
                  <Flag code={c.code} alt={c.code} />
                  <span className="font-bold align-middle">{c.code}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CURRENCIES.map((base, rowIdx) => (
              <tr key={base.code}>
                <th className={`sticky left-0 bg-white z-10 px-2 sm:px-4 py-2 sm:py-3 text-base font-bold border-b border-r text-center ${rowIdx === CURRENCIES.length - 1 ? 'rounded-bl-xl' : ''}`}>
                  <Flag code={base.code} alt={base.code} />
                  <span className="font-bold align-middle">{base.code}</span>
                </th>
                {CURRENCIES.map((quote, colIdx) => {
                  const cell = matrix[rowIdx]?.[colIdx] ?? null;
                  if (rowIdx === colIdx) return <td key={quote.code} className={`border bg-gray-50 text-center ${rowIdx === CURRENCIES.length - 1 && colIdx === CURRENCIES.length - 1 ? 'rounded-br-xl' : ''}`}></td>;
                  const color = cell ? getHeatmapColor(cell.changePercent) : 'bg-gray-100';
                  return (
                    <td
                      key={quote.code}
                      className={`border text-center font-bold text-base sm:text-lg cursor-pointer relative transition-colors duration-200 ${color} px-2 sm:px-4 py-2 sm:py-3`}
                      style={{ minWidth: 56, minHeight: 40 }}
                      onMouseEnter={() => setHover({ row: rowIdx, col: colIdx })}
                      onMouseLeave={() => setHover(null)}
                    >
                      {cell ? (cell.changePercent > 0 ? '+' : '') + cell.changePercent.toFixed(2) + '%' : ''}
                      {hover?.row === rowIdx && hover?.col === colIdx && cell && (
                        <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8, zIndex: 50 }}>
                          <Tooltip base={base.code} quote={quote.code} value={cell.changePercent} />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))} 
          </tbody>
        </table>
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-2">
          <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
            {TIME_FILTERS.map(f => (
              <button
                key={f}
                className={`px-3 py-1 rounded border font-semibold ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
                onClick={() => setFilter(f)}
              >{f}</button>
            ))}
          </div>
          <a href="/tools/forex-heatmap/all-rates" className="text-blue-600 font-semibold hover:underline ml-4">See all rates ›</a>
        </div>
      </div>
      <section className="mt-8 bg-white rounded-xl shadow p-6 text-gray-800">
        <h1 className="text-2xl font-bold mb-4">Forex Heatmap – Global Currency Strength Overview</h1>
        <p className="mb-4">The Forex Heatmap displays live forex rates and global currency strength in a visual matrix. It helps users quickly identify strong and weak currencies, monitor forex market trends, and analyze currency pair performance in real time.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">What This Forex Heatmap Shows</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Live forex heatmap comparing major global currencies</li>
          <li>Currency strength meter based on percentage change</li>
          <li>Real-time forex rates with color-coded momentum</li>
          <li>Clear view of forex market sentiment</li>
          <li>Fast comparison of major and cross currency pairs</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">Currencies Covered</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>US Dollar (USD)</li>
          <li>Euro (EUR)</li>
          <li>British Pound (GBP)</li>
          <li>Japanese Yen (JPY)</li>
          <li>Swiss Franc (CHF)</li>
          <li>Australian Dollar (AUD)</li>
          <li>Canadian Dollar (CAD)</li>
          <li>Chinese Yuan (CNY)</li>
          <li>Indian Rupee (INR)</li>
        </ul>
        <p className="mb-4">Supports analysis of major forex pairs, cross rates, and global currency movements.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Timeframe Analysis</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>1D, 1W, 1M, 3M, 6M</li>
          <li>1Y, YTD, All</li>
        </ul>
        <p className="mb-4">Allows tracking of intraday forex trends, short-term momentum, and long-term currency performance.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">How Traders Use This Forex Tool</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Find the strongest and weakest currencies today</li>
          <li>Confirm forex trend direction</li>
          <li>Monitor currency strength vs weakness</li>
          <li>Analyze forex market momentum across sessions</li>
          <li>Support technical and fundamental analysis</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">Market Session Coverage</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Asian forex session</li>
          <li>European forex session</li>
          <li>US forex session</li>
        </ul>
        <p className="mb-4">Reflects 24-hour global forex market activity.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Data & Update Information</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Live forex market data</li>
          <li>Updates every 5–10 minutes</li>
          <li>Indicative prices for market analysis and education</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">Designed For</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Forex traders</li>
          <li>Currency market analysts</li>
          <li>Investors tracking exchange rates</li>
          <li>Users monitoring global forex markets</li>
        </ul>
      </section>
    </>
  );
}
