'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { ChartNoAxesCombined, ExternalLink, Info, RefreshCw } from 'lucide-react';
import type { RadarEvent, RadarQuote } from '@/lib/market-impact/types';
import type { RadarHistory } from '@/lib/market-impact/reaction';
import { GROWW_INSTRUMENTS } from '@/lib/market-impact/indian-instruments';
import { formatRadarChange, formatRadarPrice, formatRadarTime, safeRadarUrl } from './format';
import styles from './Radar.module.css';

const INSTRUMENTS = [
  ...GROWW_INSTRUMENTS.map(instrument => ({ symbol: instrument.symbol, name: instrument.name })),
  { symbol: 'SPY', name: 'S&P 500 ETF proxy' }, { symbol: 'QQQ', name: 'Nasdaq-100 ETF proxy' },
  { symbol: 'GLD', name: 'Gold ETF proxy' }, { symbol: 'USO', name: 'Oil futures fund proxy' },
  { symbol: 'EURUSD', name: 'EUR / USD' }, { symbol: 'BTCUSD', name: 'Bitcoin / USD' },
];

export default function ObservedReaction({ event, quotes = [], initialSymbol = 'SPY' }: { event: RadarEvent; quotes?: RadarQuote[]; initialSymbol?: string }) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [result, setResult] = useState<{ key: string; history: RadarHistory | null; error: string | null } | null>(null);
  const [retry, setRetry] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const selectId = useId();
  const chartTitle = useId();
  const occurrence = event.eventOccurredAt;
  const key = `${symbol}:${occurrence || 'context'}:${retry}`;

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ symbol });
    if (occurrence) params.set('eventAt', occurrence);
    fetch(`/api/market-impact/history?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Price history is unavailable.');
        if (!Array.isArray(data.points) || !Array.isArray(data.returns) || data.symbol !== symbol) throw new Error('The price provider returned an incomplete history.');
        if (!controller.signal.aborted) setResult({ key, history: data, error: null });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult({ key, history: null, error: error instanceof Error ? error.message : 'Price history is unavailable.' });
      });
    return () => controller.abort();
  }, [symbol, occurrence, key]);

  const history = result?.key === key ? result.history : null;
  const error = result?.key === key ? result.error : null;
  const loading = result?.key !== key;
  const points = history?.points || [];
  const quote = quotes.find((item) => item.symbol === symbol);
  const current = points[Math.min(activeIndex ?? points.length - 1, points.length - 1)];
  const geometry = useMemo(() => {
    if (!points.length) return null;
    const low = Math.min(...points.map((point) => point.value));
    const high = Math.max(...points.map((point) => point.value));
    const padding = (high - low || high * 0.01) * 0.15;
    const min = low - padding;
    const max = high + padding;
    const start = Date.parse(points[0].time);
    const end = Date.parse(points[points.length - 1].time);
    const span = Math.max(end - start, 1);
    const mapped = points.map((point) => ({
      x: 18 + (Date.parse(point.time) - start) / span * 660,
      y: 178 - (point.value - min) / (max - min) * 152,
    }));
    const interval = history?.interval === '1h' ? 3_600_000 : 86_400_000;
    const path = mapped.map((point, index) => {
      const gap = index > 0 && Date.parse(points[index].time) - Date.parse(points[index - 1].time) > interval * 2.5;
      return `${index === 0 || gap ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`;
    }).join(' ');
    const eventTime = occurrence ? Date.parse(occurrence) : null;
    return { min, max, mapped, path, eventX: eventTime !== null && eventTime >= start && eventTime <= end ? 18 + (eventTime - start) / span * 660 : null };
  }, [points, history?.interval, occurrence]);
  const hovered = geometry && points.length ? geometry.mapped[Math.min(activeIndex ?? points.length - 1, points.length - 1)] : null;
  const sourceUrl = history?.sourceUrl || quote?.sourceUrl;

  return (
    <section className={styles.panel} aria-labelledby={chartTitle}>
      <div className={styles.panelHeader}>
        <h2 id={chartTitle} className={styles.panelTitle}><ChartNoAxesCombined size={16} className="text-cyan-300/70" /> Observed market data</h2>
        <div className="flex min-w-0 items-center gap-2">
          <label className="sr-only" htmlFor={selectId}>Market instrument</label>
          <select id={selectId} className={styles.select} value={symbol} onChange={(e) => { setSymbol(e.target.value); setActiveIndex(null); }}>
            {INSTRUMENTS.map((item) => <option key={item.symbol} value={item.symbol}>{item.symbol.startsWith('NSE:') ? `${item.name} · NSE` : item.symbol}</option>)}
          </select>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800" aria-label="Retry price history" onClick={() => setRetry((value) => value + 1)}><RefreshCw size={14} /></button>
        </div>
      </div>
      <div className="px-4 pb-5 pt-4 sm:px-5">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-xs text-slate-300">{history?.name || INSTRUMENTS.find((item) => item.symbol === symbol)?.name}</p>
          <p className="text-[10px] text-slate-500">{loading ? 'Loading observations' : !history || history.status === 'unavailable' ? 'History unavailable' : `${history.interval === '1h' ? 'Hourly' : 'Daily'} observed closes · Historical data`}</p>
        </div>
        {history?.proxyFor ? <p className="text-[10px] leading-relaxed text-slate-500">{history.proxyFor}</p> : null}
        {current ? (
          <div className="mt-3 flex flex-wrap items-baseline gap-3" aria-live="off">
            <strong className="text-xl font-medium tabular-nums tracking-tight text-slate-100">{formatRadarPrice(current.value, history?.currency || 'USD')}</strong>
            <span className="text-[10px] text-slate-500">Bar start {formatRadarTime(current.time, true)}</span>
          </div>
        ) : null}
        {loading ? (
          <div role="status" className="flex h-52 items-center justify-center text-xs text-slate-400">Loading observed price history…</div>
        ) : error || !geometry ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center text-xs text-slate-400">
            <ChartNoAxesCombined size={26} className="text-slate-600" />
            <p>{error || history?.reason || 'Verified price history is not available for this instrument.'}</p>
            <button className={styles.button} type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button>
          </div>
        ) : (
          <>
            <svg role="img" aria-label={`${symbol} observed price history. Use the slider below to inspect recorded observations.`} viewBox="0 0 760 205" className="mt-2 block w-full"
              onPointerMove={(e) => {
                const bounds = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - bounds.left) / bounds.width * 760;
                let nearest = 0;
                geometry.mapped.forEach((point, index) => { if (Math.abs(point.x - x) < Math.abs(geometry.mapped[nearest].x - x)) nearest = index; });
                setActiveIndex(nearest);
              }}>
              {[0, 1, 2, 3].map((tick) => <g key={tick}>
                <line x1="18" x2="680" y1={26 + tick * 50.7} y2={26 + tick * 50.7} stroke="#263443" strokeDasharray="3 5" />
                <text x="695" y={30 + tick * 50.7} fill="#738aa1" fontSize="10" fontFamily="monospace">{formatRadarPrice(geometry.max - (geometry.max - geometry.min) * tick / 3, history?.currency || 'USD')}</text>
              </g>)}
              {geometry.eventX !== null ? <g><line x1={geometry.eventX} x2={geometry.eventX} y1="20" y2="183" stroke="#b6a074" strokeDasharray="4 4" /><text x={Math.min(geometry.eventX + 6, 590)} y="14" fill="#c0ad88" fontSize="9">Verified event time</text></g> : null}
              <path d={geometry.path} fill="none" stroke="#7bc8df" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              {hovered ? <g><line x1={hovered.x} x2={hovered.x} y1="22" y2="181" stroke="#5e7e95" strokeDasharray="2 4" /><circle cx={hovered.x} cy={hovered.y} r="4" fill="#9adbea" stroke="#101721" strokeWidth="2" /></g> : null}
              <text x="18" y="201" fill="#748ba2" fontSize="10">{formatRadarTime(points[0].time, true)}</text>
              <text x="680" y="201" textAnchor="end" fill="#748ba2" fontSize="10">{formatRadarTime(points[points.length - 1].time, true)}</text>
            </svg>
            {points.length > 1 ? <input type="range" min="0" max={points.length - 1} value={activeIndex ?? points.length - 1} onChange={(e) => setActiveIndex(Number(e.target.value))} aria-label={`Inspect ${symbol} historical observations`} aria-valuetext={current ? `${formatRadarPrice(current.value, history?.currency || 'USD')}, bar starting ${formatRadarTime(current.time, true)}` : undefined} className="mt-2 h-4 w-full accent-cyan-300" /> : null}
          </>
        )}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(history?.returns || [{ label: '≥1h', changePercent: null, reason: 'Awaiting verified event time' }, { label: '≥4h', changePercent: null, reason: 'Awaiting verified event time' }, { label: '≥24h', changePercent: null, reason: 'Awaiting verified event time' }]).map((window) => (
            <div key={window.label} title={window.reason} className="rounded-md border border-slate-700/50 bg-slate-950/20 px-3 py-2.5">
              <p className="text-[9px] text-slate-500">{window.label} after event</p>
              <p className={`mt-1 text-sm font-medium tabular-nums ${window.changePercent === null ? 'text-slate-500' : window.changePercent >= 0 ? styles.positive : styles.negative}`}>{formatRadarChange(window.changePercent)}</p>
              {window.changePercent === null && window.reason ? <p className="mt-1 text-[9px] leading-relaxed text-slate-500">{window.reason}</p> : null}
              {'observed' in window && window.observed ? <p className="mt-1 text-[8px] leading-relaxed text-slate-500">Sample ends {formatRadarTime(window.observed.intervalEnd, true)}</p> : null}
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-slate-500"><Info size={12} className="mt-0.5 shrink-0" />{occurrence ? 'Price moves are observations, not evidence that this event caused the change. Sampling uses completed intervals.' : 'Actual event time is unverified. This chart shows market context; article publication time is not used to calculate a reaction.'}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[9px] text-slate-500">
          <span>{history?.provider || 'Market data provider'}{history?.fetchedAt ? ` · Retrieved ${formatRadarTime(history.fetchedAt, true)}` : ''}</span>
          {sourceUrl ? <a href={safeRadarUrl(sourceUrl)} target="_blank" rel="noopener noreferrer" className={styles.textLink}>Provider source <ExternalLink size={10} /></a> : null}
        </div>
        {history?.limitations ? <details className="mt-3 text-[10px] text-slate-500"><summary className="cursor-pointer">Sampling and data limitations</summary><ul className="mt-2 list-disc space-y-1 pl-4 leading-relaxed">{history.limitations.map((item) => <li key={item}>{item}</li>)}</ul></details> : null}
      </div>
    </section>
  );
}
