"use client";

import React from "react";
import CurrencyFlag from "@/components/forex/CurrencyFlag";

interface CrossRatesTableProps {
  matrix: (number | null)[][] | null;
  currencies: { code: string; name: string; flag: string }[];
}

const CrossRatesTable: React.FC<CrossRatesTableProps> = ({ matrix, currencies }) => (
  <div className="overflow-x-auto rounded-card border border-line-soft">
    <table className="w-full min-w-max border-separate border-spacing-0 text-subhead tabular-nums">
      <caption className="sr-only">Units of the quote currency (columns) for one unit of the base currency (rows)</caption>
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
              if (rowIdx === colIdx) return <td key={quote.code} className="border-b border-line-soft bg-surface" aria-hidden="true" />;
              const cell = matrix?.[rowIdx]?.[colIdx] ?? null;
              const display =
                cell !== null && Number.isFinite(Number(cell))
                  ? Number(cell).toLocaleString(undefined, { maximumSignificantDigits: 6 })
                  : "—";
              return (
                <td key={quote.code} className="border-b border-line-soft px-3 py-3 text-right text-ink">
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
