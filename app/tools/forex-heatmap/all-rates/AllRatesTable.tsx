"use client";

import React from 'react';
import { formatPercent, getHeatmapColor } from '../colorScale';
import CurrencyFlag from '@/components/forex/CurrencyFlag';

interface AllRatesTableProps {
  matrix: ({ changePercent?: number } | null)[][] | null;
  currencies: { code: string; name: string; flag: string }[];
}

const AllRatesTable: React.FC<AllRatesTableProps> = ({ matrix, currencies }) => (
  <div className="overflow-x-auto rounded-card border border-line-soft">
    <table className="w-full min-w-max border-separate border-spacing-0 text-subhead tabular-nums">
      <caption className="sr-only">Percentage change of each base currency (rows) against each quote currency (columns), today</caption>
      <thead>
        <tr>
          <th scope="col" className="sticky left-0 top-0 z-20 bg-canvas p-3">
            <span className="sr-only">Base currency</span>
          </th>
          {currencies.map((c) => (
            <th key={c.code} scope="col" className="sticky top-0 z-10 whitespace-nowrap border-b border-line-soft bg-canvas px-3 py-3 text-center font-semibold text-ink">
              <span className="inline-flex items-center gap-1.5">
                <CurrencyFlag code={c.code} />
                {c.code}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {currencies.map((base, rowIdx) => (
          <tr key={base.code}>
            <th scope="row" className="sticky left-0 z-10 whitespace-nowrap border-r border-line-soft bg-canvas px-3 py-3 text-left font-semibold text-ink">
              <span className="inline-flex items-center gap-1.5">
                <CurrencyFlag code={base.code} />
                {base.code}
              </span>
            </th>
            {currencies.map((quote, colIdx) => {
              if (rowIdx === colIdx) return <td key={quote.code} className="border-b border-r border-canvas bg-surface" aria-hidden="true" />;
              const cell = matrix?.[rowIdx]?.[colIdx] ?? null;
              const percent = cell && typeof cell.changePercent === 'number' ? cell.changePercent : null;
              return (
                <td
                  key={quote.code}
                  className={`min-w-16 border-b border-r border-canvas px-3 py-3 text-center font-semibold ${
                    percent !== null ? getHeatmapColor(percent) : 'bg-surface text-ink-3'
                  }`}
                >
                  {percent !== null ? (
                    <>
                      <span className="sr-only">{base.code} against {quote.code}: </span>
                      {formatPercent(percent)}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AllRatesTable;
