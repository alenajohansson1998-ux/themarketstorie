"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CURRENCIES } from '../../../lib/forex/currencies';
import { formatPercent, getHeatmapColor } from './colorScale';
import CurrencyFlag from '@/components/forex/CurrencyFlag';

const TIME_FILTERS = ['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD', 'All'];

type Cell = { base: string; quote: string; changePercent: number } | null;

const emptyMatrix = (): Cell[][] =>
  Array(CURRENCIES.length)
    .fill(null)
    .map(() => Array(CURRENCIES.length).fill(null));

export default function HeatmapTable({ showAbout = true }: { showAbout?: boolean }) {
  const [matrix, setMatrix] = useState<Cell[][]>(emptyMatrix);
  const [filter, setFilter] = useState('1D');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    fetch(`/api/tools/forex-heatmap?filter=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data.matrix) && data.matrix.length === CURRENCIES.length) {
          setMatrix(data.matrix);
          setStatus('ready');
        } else {
          setMatrix(emptyMatrix());
          setStatus('error');
        }
      })
      .catch(() => {
        if (!active) return;
        setMatrix(emptyMatrix());
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [filter]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Period" className="no-scrollbar inline-flex max-w-full overflow-x-auto rounded-control bg-fill p-1">
          {TIME_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`inline-flex h-9 min-w-11 items-center justify-center rounded-md px-2.5 text-subhead font-medium transition-colors ${
                filter === f ? 'bg-canvas text-ink shadow-sm' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Link
          href="/tools/forex-heatmap/all-rates"
          className="inline-flex min-h-11 items-center text-subhead font-medium text-tint hover:underline"
        >
          All rates and cross rates
        </Link>
      </div>

      {status === 'error' ? (
        <p role="status" className="mb-4 rounded-control bg-surface px-4 py-3 text-subhead text-ink-2">
          Currency data didn’t load. Choose a period to try again.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-card border border-line-soft">
        <table className="w-full min-w-max border-separate border-spacing-0 text-subhead tabular-nums" aria-busy={status === 'loading'}>
          <caption className="sr-only">
            Percentage change of each base currency (rows) against each quote currency (columns) over {filter}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 top-0 z-20 bg-canvas p-3">
                <span className="sr-only">Base currency</span>
              </th>
              {CURRENCIES.map((c) => (
                <th
                  key={c.code}
                  scope="col"
                  className="sticky top-0 z-10 whitespace-nowrap border-b border-line-soft bg-canvas px-3 py-3 text-center font-semibold text-ink"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <CurrencyFlag code={c.code} />
                    {c.code}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CURRENCIES.map((base, rowIdx) => (
              <tr key={base.code}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 whitespace-nowrap border-r border-line-soft bg-canvas px-3 py-3 text-left font-semibold text-ink"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <CurrencyFlag code={base.code} />
                    {base.code}
                  </span>
                </th>
                {CURRENCIES.map((quote, colIdx) => {
                  if (rowIdx === colIdx) {
                    return <td key={quote.code} className="border-b border-r border-canvas bg-surface" aria-hidden="true" />;
                  }
                  const cell = matrix[rowIdx]?.[colIdx] ?? null;
                  const value = cell ? formatPercent(cell.changePercent) : null;
                  return (
                    <td
                      key={quote.code}
                      title={value ? `${base.code}/${quote.code} ${value}` : undefined}
                      className={`min-w-16 border-b border-r border-canvas px-3 py-3 text-center font-semibold transition-colors ${
                        cell ? getHeatmapColor(cell.changePercent) : 'bg-surface text-ink-3'
                      }`}
                    >
                      {status === 'loading' ? (
                        <span className="inline-block h-3 w-10 animate-pulse rounded bg-fill" aria-hidden="true" />
                      ) : value ? (
                        <>
                          <span className="sr-only">
                            {base.code} against {quote.code}:{' '}
                          </span>
                          {value}
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

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-footnote text-ink-2" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-up" /> Stronger</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-down" /> Weaker</span>
        <span>Rates from the European Central Bank, updated on business days.</span>
      </div>

      {showAbout ? (
        <section className="article-body mt-12 border-t border-line-soft pt-8">
          <h2>About the forex heatmap</h2>
          <p>
            Each cell shows how much the base currency (row) moved against the quote currency (column) over the
            selected period. Green means the base currency strengthened; red means it weakened. Darker shades mean a
            bigger move.
          </p>
          <h3>How traders use it</h3>
          <ul>
            <li>Find the strongest and weakest currencies at a glance</li>
            <li>Confirm a trend before looking at an individual pair</li>
            <li>Compare short-term momentum with longer periods (1D against 1M or YTD)</li>
          </ul>
          <h3>Currencies covered</h3>
          <p>US dollar, euro, British pound, Japanese yen, Swiss franc, Australian dollar, Canadian dollar, Chinese yuan and Indian rupee.</p>
          <p>Rates are indicative and for analysis only. They may differ from prices on trading platforms.</p>
        </section>
      ) : null}
    </>
  );
}
