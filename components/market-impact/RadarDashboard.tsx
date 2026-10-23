'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bookmark, Building2, CalendarDays, ChartNoAxesCombined, Check, ChevronRight, CircleHelp, ExternalLink, FileText, Globe2, Layers3, LoaderCircle, Network, Radar, RefreshCw, Search, SlidersHorizontal, WifiOff, X } from 'lucide-react';
import type { RadarAssetClass, RadarEntity, RadarEvent, RadarFeed, RadarQuote, RadarSnapshot } from '@/lib/market-impact/types';
import { getNyseStatus } from '@/lib/marketStatus';
import ImpactMap from './ImpactMap';
import ObservedReaction from './ObservedReaction';
import { useRadarWatchlist } from './useRadarWatchlist';
import { CATEGORY_LABELS, formatRadarChange, formatRadarPrice, formatRadarTime, safeRadarUrl } from './format';
import styles from './Radar.module.css';
import { radarLocation, type RadarView } from './navigation';
export type { RadarView } from './navigation';

const MarketTerminal = dynamic(() => import('./MarketTerminal'), { loading: () => <div role="status" className={styles.empty}>Loading market terminal…</div> });
const EconomicCalendar = dynamic(() => import('./MarketTerminal').then((module) => module.EconomicCalendar), { loading: () => <div role="status" className={styles.empty}>Loading economic calendar…</div> });
const NAVIGATION = [
  { id: 'radar', label: 'Event radar', icon: Radar },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'sectors', label: 'Sectors', icon: Layers3 },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'watchlist', label: 'My radar', icon: Bookmark },
  { id: 'terminal', label: 'Market terminal', icon: ChartNoAxesCombined },
] as const;
const ASSET_CLASSES: RadarAssetClass[] = ['Equities', 'Bonds', 'Commodities', 'Currencies', 'Crypto'];

export function isRadarView(value: string | undefined): value is RadarView {
  return NAVIGATION.some((item) => item.id === value);
}

function Sparkline({ points }: { points: RadarQuote['points'] }) {
  if (points.length < 2) return null;
  const prices = points.map((point) => point.value);
  const low = Math.min(...prices), span = Math.max(...prices) - low || 1;
  const path = prices.map((price, index) => `${index ? 'L' : 'M'}${index / (prices.length - 1) * 74},${22 - (price - low) / span * 20}`).join(' ');
  return <svg aria-hidden="true" viewBox="0 0 75 24" width="64" height="22"><path d={path} stroke="#6aa4bd" strokeWidth="1.4" fill="none" /></svg>;
}

function MarketSnapshot({ snapshot }: { snapshot: RadarSnapshot }) {
  return <section aria-label="Market snapshot" className={styles.quotes}>
    {snapshot.quotes.length ? snapshot.quotes.map((quote) => <article key={quote.symbol} className={styles.quote}>
      <div className={styles.quoteTop}><span className={styles.quoteName}>{quote.name}</span><span title={quote.proxyFor || quote.exchange}>{quote.symbol.replace(/^NSE:/, '')}</span></div>
      <p className={styles.quotePrice}>{formatRadarPrice(quote.price, quote.currency)}</p>
      <div className={styles.quoteBottom}>
        <span className={quote.changePercent === null ? styles.muted : quote.changePercent >= 0 ? styles.positive : styles.negative} title={`Absolute change: ${formatRadarChange(quote.change, '')}`}>
          {quote.changePercent !== null ? quote.changePercent >= 0 ? <ArrowUpRight size={11} className="mr-0.5 inline" /> : <ArrowDownRight size={11} className="mr-0.5 inline" /> : null}{formatRadarChange(quote.changePercent)}
        </span>
        <Sparkline points={quote.points} />
      </div>
      <p className={styles.quoteTime}>{quote.timestamp ? formatRadarTime(quote.timestamp, true) : 'Observation unavailable'}</p>
      <a className="mt-1 inline-block text-[9px] text-slate-500 hover:text-cyan-200" href={safeRadarUrl(quote.sourceUrl)} target="_blank" rel="noopener noreferrer" title={quote.reason || quote.proxyFor || `${quote.provider} data`}>
        {quote.status === 'unavailable' ? quote.market === 'India' ? `${quote.provider} · Unavailable` : 'Unavailable' : `${quote.provider} · ${quote.status}`}{quote.proxyFor ? ' · Proxy' : ''}
      </a>
    </article>) : <div className="col-span-full px-5 py-7 text-xs text-slate-400">Market quotes are unavailable. The event radar remains available below.</div>}
  </section>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div><p className={styles.metricLabel}>{label}</p><p className={styles.metricValue}>{value}<span className="ml-0.5 text-[10px] text-slate-500">/100</span></p><div className={styles.metricTrack} aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} /></div></div>;
}

function EventCard({ event, selected, saved, saving, onSelect, onSave }: { event: RadarEvent; selected: boolean; saved: boolean; saving: boolean; onSelect: () => void; onSave: () => void }) {
  const source = event.sources[0];
  return <article className={styles.feedItem} data-selected={selected}>
    <button type="button" onClick={onSelect} aria-pressed={selected} className={styles.eventButton}>
      <div className={styles.eventMeta}><span className={styles.category}>{CATEGORY_LABELS[event.category]}</span><span>{event.region}</span><span>·</span><time dateTime={event.publishedAt}>{formatRadarTime(event.publishedAt, true)}</time></div>
      <h3 className={styles.eventTitle}>{event.title}</h3>
      <p className={`${styles.eventSummary} line-clamp-2`}>{event.summary}</p>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-500"><span title="A transparent rules-based importance score, not a prediction">Significance <strong className="font-medium text-slate-300">{event.significance}</strong></span><span>Evidence <strong className="font-medium text-slate-400">{event.evidenceConfidence}</strong></span><span>{event.impacts.length} connections</span></div>
    </button>
    <div className={styles.eventFooter}>
      {source ? <a href={safeRadarUrl(source.url)} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-[85%] items-center gap-1 truncate">{source.publisher}<ExternalLink size={9} className="shrink-0" />{event.sources.length > 1 ? ` +${event.sources.length - 1}` : ''}</a> : <span>No traceable source</span>}
      <button type="button" className={styles.saveButton} aria-label={`${saved ? 'Unsave' : 'Save'} ${event.title}`} aria-pressed={saved} disabled={saving} onClick={onSave}><Bookmark size={13} fill={saved ? 'currentColor' : 'none'} /></button>
    </div>
  </article>;
}

function EventWorkspace({ event, quotes, market, saved, saving, onSave }: { event: RadarEvent; quotes: RadarQuote[]; market: 'india' | 'global'; saved: boolean; saving: boolean; onSave: () => void }) {
  return <div className={styles.detail}>
    <section className={styles.panel} aria-label="Selected event analysis">
      <div className={styles.eventIntro}>
        <div className={styles.eventMeta}><span className={styles.category}>{CATEGORY_LABELS[event.category]}</span><span>{event.region}</span><span>·</span><span>{event.analysisType === 'ai' ? 'AI-assisted context' : 'Rules-based context'}</span></div>
        <h2 className={styles.eventHeading}>{event.title}</h2>
        <p className={styles.introText}>{event.summary}</p>
        <p className="mt-3 text-[10px] text-slate-500">Reported {formatRadarTime(event.publishedAt, true)} · {event.sources.length} source{event.sources.length === 1 ? '' : 's'} · {event.eventOccurredAt ? 'Event occurrence time available' : 'Event occurrence time unverified'}</p>
        <div className={styles.actions}>
          <Link href={`/market-impact/events/${event.slug}`} className={`${styles.button} ${styles.primary}`}>Read full analysis <ArrowRight size={13} /></Link>
          <button type="button" onClick={onSave} disabled={saving} aria-pressed={saved} className={styles.button}>{saved ? <Check size={13} /> : <Bookmark size={13} />}{saved ? 'Saved to my radar' : 'Save event'}</button>
          <Link href="/market-impact/methodology" className={styles.textLink}><CircleHelp size={12} /> How we assess events</Link>
        </div>
      </div>
      <div className={styles.metrics}><Metric label="Event significance" value={event.significance} /><Metric label="Source evidence" value={event.evidenceConfidence} /><Metric label="Impact uncertainty" value={event.uncertainty} /></div>
    </section>
    <ImpactMap key={event.id} event={event} />
    <div className={styles.insightGrid}>
      <section className={`${styles.panel} ${styles.insight}`}><h3>Why it may matter</h3><p>{event.whyItMatters}</p></section>
      <section className={`${styles.panel} ${styles.insight}`}><h3>What to watch next</h3><ul>{event.whatToWatch.map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-3 text-[9px] text-slate-500">Research checkpoints; scheduled dates are only shown in the sourced calendar.</p></section>
    </div>
    <ObservedReaction key={market} event={event} quotes={quotes} initialSymbol={market === 'india' ? 'NSE:NIFTY' : 'SPY'} />
    <div className={styles.insightGrid}>
      <section className={`${styles.panel} ${styles.insight}`}><h3>Evidence &amp; reporting</h3><div className={styles.sources}>{event.sources.map((source) => <div className={styles.source} key={source.id}><FileText size={13} className="mt-0.5 shrink-0 text-slate-500" /><div><a href={safeRadarUrl(source.url)} target="_blank" rel="noopener noreferrer">{source.publisher} <ExternalLink size={9} className="inline" /></a><p className="mt-0.5 text-[9px] text-slate-500">{source.type} · {formatRadarTime(source.publishedAt, true)}</p></div></div>)}</div>{event.coverageUrl ? <Link href={event.coverageUrl} className={`${styles.textLink} mt-4`}>Our related coverage <ArrowRight size={12} /></Link> : null}</section>
      <section className={`${styles.panel} ${styles.insight}`}><h3>Other possible outcomes</h3><ul>{event.alternativeScenarios.map((item) => <li key={item}>{item}</li>)}</ul>{event.evidenceLimitations.length ? <details className="mt-4 text-[10px] text-slate-500"><summary className="cursor-pointer">Evidence limitations</summary><ul className="mt-2">{event.evidenceLimitations.map((item) => <li key={item}>{item}</li>)}</ul></details> : null}</section>
    </div>
  </div>;
}

function EntityBrowser({ entities, events, title, search, followed, loading, onToggle, onOpen }: { entities: RadarEntity[]; events: RadarEvent[]; title: string; search: string; followed: string[]; loading: boolean; onToggle: (id: string) => void; onOpen: (slug: string) => void }) {
  const filtered = entities.filter((entity) => `${entity.name} ${entity.symbol || ''} ${entity.description}`.toLowerCase().includes(search.toLowerCase()));
  return <section aria-label={title}>
    <div className={styles.sectionHeading}><h2>{title}</h2><span className={styles.fineprint}>{filtered.length} entities connected to sourced events</span></div>
    {filtered.length ? <div className={styles.entityGrid}>{filtered.map((entity) => {
      const related = events.filter((event) => event.entities.some((item) => item.id === entity.id) || event.impacts.some((impact) => impact.entity.id === entity.id));
      return <article className={`${styles.panel} ${styles.entityCard}`} key={entity.id}>
        <div className="flex items-center justify-between gap-3"><span className={styles.category}>{entity.symbol || entity.assetClass}</span><button type="button" className={styles.saveButton} aria-label={`${followed.includes(entity.id) ? 'Unfollow' : 'Follow'} ${entity.name}`} aria-pressed={followed.includes(entity.id)} disabled={loading} onClick={() => onToggle(entity.id)}><Bookmark size={13} fill={followed.includes(entity.id) ? 'currentColor' : 'none'} /></button></div>
        <h2>{entity.name}</h2><p>{entity.description}</p>
        <p className="mt-4 text-[10px] text-slate-500">{related.length} relevant event{related.length === 1 ? '' : 's'}</p>
        {related.slice(0, 3).map((event) => <button type="button" key={event.id} onClick={() => onOpen(event.slug)} className="mt-2 flex w-full items-start gap-2 text-left text-[11px] leading-relaxed text-slate-300 hover:text-cyan-200"><ChevronRight size={12} className="mt-0.5 shrink-0" /><span className="line-clamp-2">{event.title}</span></button>)}
      </article>;
    })}</div> : <div className={`${styles.panel} ${styles.empty} mt-5`}><Building2 size={26} /><strong>No matching {title.toLowerCase()}</strong>Try a different search or check back when new sourced coverage is available.</div>}
  </section>;
}

export default function RadarDashboard({ initialFeed, initialSnapshot, initialView = 'radar', initialEventSlug, initialMarketTab, initialMarket = 'india' }: { initialFeed: RadarFeed; initialSnapshot: RadarSnapshot; initialView?: RadarView; initialEventSlug?: string; initialMarketTab?: string; initialMarket?: 'india' | 'global' }) {
  const [feed, setFeed] = useState(initialFeed);
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [view, setView] = useState<RadarView>(initialView);
  const [market, setMarket] = useState(initialMarket);
  const [marketTab, setMarketTab] = useState(initialMarketTab || 'indices');
  const [selectedSlug, setSelectedSlug] = useState(initialEventSlug || initialFeed.events.find((event) => event.impacts.length > 0)?.slug || initialFeed.events[0]?.slug || '');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('all');
  const [asset, setAsset] = useState('all');
  const [period, setPeriod] = useState('all');
  const [significance, setSignificance] = useState('all');
  const [sort, setSort] = useState('significance');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const searchId = useId();
  const tabsId = useId();
  const watchlist = useRadarWatchlist();
  const status = getNyseStatus(new Date(snapshot.asOf));
  const marketQuotes = snapshot.quotes.filter(quote => market === 'india' ? quote.market === 'India' || quote.symbol.startsWith('NSE:') : quote.market !== 'India' && !quote.symbol.startsWith('NSE:'));
  const growwStatus = snapshot.providers?.find(provider => provider.name === 'Groww');

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);
  useEffect(() => () => requestRef.current?.abort(), []);

  const allEntities = useMemo(() => {
    const entities = new Map<string, RadarEntity>();
    feed.events.forEach((event) => [...event.entities, ...event.impacts.map((impact) => impact.entity)].forEach((entity) => entities.set(entity.id, entity)));
    return [...entities.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [feed.events]);
  const regions = useMemo(() => [...new Set(feed.events.map((event) => event.region))].sort(), [feed.events]);
  const visibleEvents = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    const cutoff = period === 'all' ? 0 : Date.parse(feed.asOf) - Number(period) * 86_400_000;
    return feed.events.filter((event) => {
      const searchable = `${event.title} ${event.summary} ${CATEGORY_LABELS[event.category]} ${event.entities.map((entity) => `${entity.name} ${entity.symbol || ''}`).join(' ')} ${event.impacts.map((impact) => `${impact.entity.name} ${impact.entity.symbol || ''} ${impact.channel}`).join(' ')}`.toLowerCase();
      return (!query || searchable.includes(query)) && (category === 'all' || event.category === category) &&
        (region === 'all' || event.region === region) && (asset === 'all' || event.assetClasses.includes(asset as RadarAssetClass)) &&
        Date.parse(event.publishedAt) >= cutoff && (significance === 'all' || event.significance >= Number(significance));
    }).sort((a, b) => sort === 'recent' ? Date.parse(b.publishedAt) - Date.parse(a.publishedAt) : b.significance - a.significance || Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }, [feed, debouncedSearch, category, region, asset, period, significance, sort]);
  const selected = visibleEvents.find((event) => event.slug === selectedSlug) || visibleEvents[0] || null;
  const hasFilters = !!search || category !== 'all' || region !== 'all' || asset !== 'all' || period !== 'all' || significance !== 'all';
  const savedEventSlugs = watchlist.eventSlugs.filter((slug) => {
    const event = feed.events.find((item) => item.slug === slug);
    return !debouncedSearch || `${slug} ${event?.title || ''} ${event?.summary || ''}`.toLowerCase().includes(debouncedSearch.toLowerCase());
  });
  const knownFollowedEntities = allEntities.filter((entity) => watchlist.entityIds.includes(entity.id));
  const missingFollowedEntities = watchlist.entityIds.filter((id) => !allEntities.some((entity) => entity.id === id) && (!debouncedSearch || id.toLowerCase().includes(debouncedSearch.toLowerCase())));

  function selectView(next: RadarView) {
    setView(next);
    window.history.replaceState(null, '', radarLocation(window.location.href, next, marketTab));
  }
  function selectMarket(next: 'india' | 'global') {
    setMarket(next);
    const url = new URL(window.location.href);
    if (next === 'india') url.searchParams.delete('market');
    else url.searchParams.set('market', next);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }
  function clearFilters() { setSearch(''); setCategory('all'); setRegion('all'); setAsset('all'); setPeriod('all'); setSignificance('all'); }
  function selectEvent(slug: string) {
    setSelectedSlug(slug);
    window.history.replaceState(null, '', radarLocation(window.location.href, 'radar', marketTab, slug));
    if (window.matchMedia('(max-width: 900px)').matches) {
      window.requestAnimationFrame(() => document.getElementById(`${tabsId}-selected`)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start',
      }));
    }
  }
  function openEvent(slug: string) {
    clearFilters(); setView('radar'); selectEvent(slug);
  }
  function selectMarketTab(id: string) {
    setMarketTab(id);
    window.history.replaceState(null, '', radarLocation(window.location.href, 'terminal', id));
  }
  async function refreshData() {
    requestRef.current?.abort();
    const controller = new AbortController(); requestRef.current = controller;
    setRefreshing(true); setRefreshError(null);
    try {
      const responses = await Promise.allSettled([
        fetch('/api/market-impact/events?limit=60', { signal: controller.signal }).then(async (response) => { if (!response.ok) throw new Error('Event refresh failed.'); return response.json() as Promise<RadarFeed>; }),
        fetch('/api/market-impact/snapshot', { signal: controller.signal }).then(async (response) => { if (!response.ok) throw new Error('Market refresh failed.'); return response.json() as Promise<RadarSnapshot>; }),
      ]);
      if (controller.signal.aborted) return;
      if (responses[0].status === 'fulfilled') setFeed(responses[0].value);
      if (responses[1].status === 'fulfilled') setSnapshot(responses[1].value);
      if (responses.some((response) => response.status === 'rejected')) setRefreshError('Some data could not refresh. Last available observations are still shown.');
    } catch { if (!controller.signal.aborted) setRefreshError('Data could not refresh. Please try again.'); }
    finally { if (!controller.signal.aborted) setRefreshing(false); }
  }

  return <div className={styles.radar}>
    <div className={styles.shell}>
      <header className={styles.masthead}>
        <div><p className={styles.eyebrow}><Network size={13} /> The Market Stories <span className="text-slate-600">/</span> Intelligence</p><h1 className={styles.title}>Market Impact Radar<span className="ml-3 inline-block rounded border border-slate-600/60 px-1.5 py-0.5 align-middle text-[8px] font-medium tracking-widest text-slate-400">BETA</span></h1><p className={styles.subtitle}>Understand the story. Explore the connections. Check the evidence.</p></div>
        <div className={styles.toolbar}>{view !== 'calendar' && view !== 'terminal' ? <div className={styles.search}><label htmlFor={searchId} className="sr-only">Search events, companies, symbols, and sectors</label><Search size={16} /><input id={searchId} type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events, companies, sectors…" />{search.trim() !== debouncedSearch ? <LoaderCircle size={13} className="absolute right-3 top-4 animate-spin" /> : null}</div> : null}<button type="button" disabled={refreshing} aria-label="Refresh radar and market data" onClick={() => void refreshData()} className={styles.iconButton}><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /></button></div>
      </header>
      <div className={styles.navRow}><nav role="tablist" aria-label="Radar workspace" className={styles.nav} onKeyDown={(event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const index = NAVIGATION.findIndex((item) => item.id === view);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? NAVIGATION.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + NAVIGATION.length) % NAVIGATION.length;
        selectView(NAVIGATION[next].id);
        document.getElementById(`${tabsId}-${NAVIGATION[next].id}`)?.focus();
      }}>
        {NAVIGATION.map((item) => <button key={item.id} id={`${tabsId}-${item.id}`} role="tab" type="button" tabIndex={view === item.id ? 0 : -1} aria-selected={view === item.id} aria-controls={`${tabsId}-panel`} onClick={() => selectView(item.id)}><item.icon size={14} />{item.label}{item.id === 'watchlist' && watchlist.eventSlugs.length + watchlist.entityIds.length > 0 ? <span className={styles.count}>{watchlist.eventSlugs.length + watchlist.entityIds.length}</span> : null}</button>)}
      </nav><span className={styles.session} title={market === 'india' ? 'Indian stocks and indices from Groww. Display times use Indian Standard Time.' : `${status.label}. Regular sessions; early closes are not modeled.`}><span className={styles.sessionDot} />{market === 'india' ? 'NSE · Groww · IST' : `${status.short} · Session estimate`}</span></div>
      <div className={styles.freshness}><div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-1.5"><Activity size={12} /> Market snapshot</span><div className={styles.marketSwitch} role="group" aria-label="Choose market"><button type="button" aria-pressed={market === 'india'} onClick={() => selectMarket('india')}>India · Groww</button><button type="button" aria-pressed={market === 'global'} onClick={() => selectMarket('global')}>Global</button></div></div><span>Retrieved {formatRadarTime(snapshot.asOf, true)} · {market === 'india' ? '1-minute' : '5-minute'} provider cache</span></div>
      <MarketSnapshot snapshot={{ ...snapshot, quotes: marketQuotes }} />
      {market === 'india' && growwStatus?.status === 'unavailable' ? <div className={styles.warning} role="status"><WifiOff size={14} className="mt-0.5 shrink-0" /><p>{growwStatus.detail || 'Groww is currently unavailable. Indian quotes will appear when the connection is available.'} <button type="button" onClick={() => void refreshData()} disabled={refreshing} className="ml-1 text-cyan-200 underline">Retry Groww</button></p></div> : null}
      {feed.status !== 'ready' || refreshError || watchlist.error ? <div className={styles.warning} role="status"><WifiOff size={14} className="mt-0.5 shrink-0" /><p>{refreshError || watchlist.error || `Some source or archive services are unavailable. ${feed.events.length ? 'Available source reporting is still shown.' : 'No verified event feed is available right now.'}`}{watchlist.error ? <button type="button" onClick={() => window.location.reload()} className="ml-2 text-cyan-200 underline">Reload watchlist</button> : null}</p></div> : null}

      <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${view}`} tabIndex={0}>
        {view === 'radar' ? <div className={styles.workspace}>
          <section className={styles.panel} aria-labelledby={`${tabsId}-feed`}>
            <div className={styles.panelHeader}><h2 className={styles.panelTitle} id={`${tabsId}-feed`}><Radar size={15} /> Event radar <span className={styles.count}>{visibleEvents.length}</span></h2><select aria-label="Sort event feed" className={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}><option value="significance">Significance</option><option value="recent">Most recent</option></select></div>
            <div className={styles.filterGrid}>
              <select aria-label="Filter event category" className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All event types</option>{Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <select aria-label="Filter region" className={styles.select} value={region} onChange={(e) => setRegion(e.target.value)}><option value="all">All regions</option>{regions.map((value) => <option key={value}>{value}</option>)}</select>
              <select aria-label="Filter asset class" className={styles.select} value={asset} onChange={(e) => setAsset(e.target.value)}><option value="all">All asset classes</option>{ASSET_CLASSES.map((value) => <option key={value}>{value}</option>)}</select>
              <select aria-label="Filter publication date" className={styles.select} value={period} onChange={(e) => setPeriod(e.target.value)}><option value="all">All available dates</option><option value="1">Past 24 hours</option><option value="7">Past 7 days</option><option value="30">Past 30 days</option></select>
              <select aria-label="Minimum significance score" className={styles.select} value={significance} onChange={(e) => setSignificance(e.target.value)}><option value="all">Any significance</option><option value="50">50+ significance</option><option value="70">70+ significance</option><option value="85">85+ significance</option></select>
              {hasFilters ? <button type="button" onClick={clearFilters} className="inline-flex min-h-9 items-center justify-center gap-1 text-[10px] text-cyan-200"><X size={12} /> Clear filters</button> : <span className="inline-flex items-center gap-1 px-1 text-[9px] text-slate-500"><SlidersHorizontal size={10} /> Source-led filtering</span>}
            </div>
            <div className={styles.feed}>
              {visibleEvents.length ? visibleEvents.map((event) => <EventCard key={event.id} event={event} selected={selected?.id === event.id} saved={watchlist.eventSlugs.includes(event.slug)} saving={watchlist.loading} onSelect={() => selectEvent(event.slug)} onSave={() => void watchlist.toggleEvent(event.slug)} />) : <div className={styles.empty}><Search size={27} /><strong>{feed.events.length ? 'No matching events' : 'Waiting for sourced events'}</strong>{feed.events.length ? 'Try another company, sector, or filter.' : 'The radar will populate when a configured news source is available.'}{hasFilters ? <button type="button" onClick={clearFilters} className={`${styles.button} mt-4`}>Clear filters</button> : <button type="button" onClick={() => void refreshData()} disabled={refreshing} className={`${styles.button} mt-4`}>Retry sources</button>}</div>}
            </div>
            <div className="border-t border-slate-700/60 px-4 py-3"><p className={styles.fineprint}>Scores describe importance and evidence, not a probability of a price move. <Link href="/market-impact/methodology" className="text-cyan-200/70 hover:underline">Methodology</Link></p></div>
          </section>
          {selected ? <div id={`${tabsId}-selected`} className="min-w-0 scroll-mt-20"><EventWorkspace event={selected} quotes={snapshot.quotes} market={market} saved={watchlist.eventSlugs.includes(selected.slug)} saving={watchlist.loading} onSave={() => void watchlist.toggleEvent(selected.slug)} /></div> : <div className={`${styles.panel} ${styles.empty}`}><Network size={34} /><strong>Your next story starts with a source.</strong>Select an event to explore documented exposures and supporting evidence.</div>}
        </div> : null}
        {view === 'companies' || view === 'sectors' ? <EntityBrowser title={view === 'companies' ? 'Companies' : 'Sectors & economic exposures'} entities={allEntities.filter((entity) => view === 'companies' ? entity.type === 'company' : entity.type !== 'company')} events={feed.events} search={debouncedSearch} followed={watchlist.entityIds} loading={watchlist.loading} onToggle={(id) => void watchlist.toggleEntity(id)} onOpen={openEvent} /> : null}
        {view === 'watchlist' ? <section aria-label="My saved radar">
          <div className={styles.sectionHeading}><div><h2>My radar</h2><p className="mt-2 text-xs text-slate-400">{watchlist.scope === 'account' ? 'Saved to your account.' : 'Saved in this browser. Sign in from the site header to keep an account watchlist.'}</p></div><span className={styles.count}>{watchlist.eventSlugs.length} events · {watchlist.entityIds.length} entities</span></div>
          {watchlist.loading ? <div className={`${styles.panel} ${styles.empty} mt-5`} role="status">Loading your saved radar…</div> : watchlist.eventSlugs.length ? savedEventSlugs.length ? <div className={`${styles.panel} mt-5 divide-y divide-slate-700/60`}>{savedEventSlugs.map((slug) => {
            const event = feed.events.find((item) => item.slug === slug);
            return <article key={slug} className="flex items-start justify-between gap-4 p-5"><div><p className="text-[10px] text-slate-500">{event ? CATEGORY_LABELS[event.category] : 'Saved analysis'}</p><Link href={`/market-impact/events/${slug}`} className="mt-2 block text-sm font-medium leading-relaxed text-slate-200 hover:text-cyan-200">{event?.title || 'Open saved event analysis'}</Link>{event ? <button type="button" className={`${styles.textLink} mt-3`} onClick={() => openEvent(slug)}>Explore impact map <ArrowRight size={12} /></button> : null}</div><button type="button" aria-label={`Remove ${event?.title || slug} from my radar`} onClick={() => void watchlist.toggleEvent(slug)} className={styles.saveButton}><X size={13} /></button></article>;
          })}</div> : <div className={`${styles.panel} ${styles.empty} mt-5`}><Search size={24} /><strong>No saved events match this search.</strong><button type="button" className={`${styles.button} mt-3`} onClick={() => setSearch('')}>Clear search</button></div> : <div className={`${styles.panel} ${styles.empty} mt-5`}><Bookmark size={28} /><strong>Keep the stories that matter to you.</strong>Save an event with the bookmark button or follow a company or sector.<div><button type="button" className={`${styles.button} mt-4`} onClick={() => selectView('radar')}>Explore the radar <ArrowRight size={12} /></button></div></div>}
          {knownFollowedEntities.length ? <EntityBrowser title="Following" entities={knownFollowedEntities} events={feed.events} search={debouncedSearch} followed={watchlist.entityIds} loading={watchlist.loading} onToggle={(id) => void watchlist.toggleEntity(id)} onOpen={openEvent} /> : null}
          {missingFollowedEntities.length ? <section aria-label="Followed entities outside the current feed"><h2 className="mt-6 text-sm font-medium text-slate-300">Outside the current event feed</h2><div className={styles.entityGrid}>{missingFollowedEntities.map((id) => <article className={`${styles.panel} ${styles.entityCard}`} key={id}><div className="flex items-center justify-between gap-3"><h2 className="break-all">{id}</h2><button type="button" disabled={watchlist.loading} onClick={() => void watchlist.toggleEntity(id)} aria-label={`Unfollow saved entity ${id}`} className={styles.saveButton}><X size={13} /></button></div><p>This entity is outside the current feed. It remains saved until you remove it.</p></article>)}</div></section> : null}
        </section> : null}
        {view === 'calendar' ? <div><div className={styles.sectionHeading}><div><h2>Upcoming catalysts</h2><p className="mt-2 text-xs leading-relaxed text-slate-400">Economic releases from the TradingView calendar. Scheduled times and estimates are provider data.</p></div><CalendarDays size={20} className="text-slate-500" /></div><EconomicCalendar /></div> : null}
        {view === 'terminal' ? <MarketTerminal key="terminal" value={marketTab} onTabChange={selectMarketTab} /> : null}
      </div>
      <footer className={styles.footer}><p className="inline-flex items-center gap-1.5"><Globe2 size={11} /> {feed.events.length} sourced events · {feed.methodologyVersion} · Retrieved {formatRadarTime(feed.asOf, true)}</p><div className="flex gap-4"><Link href="/market-impact/methodology">Sources &amp; methodology</Link><span>Research context. Not a price forecast.</span></div></footer>
    </div>
  </div>;
}
