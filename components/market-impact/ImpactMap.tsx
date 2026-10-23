'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ChevronDown, ChevronRight, Crosshair, Expand, GitBranch, Minus, Move, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import type { RadarEvent, RadarImpact } from '@/lib/market-impact/types';
import styles from './ImpactMap.module.css';

type ExposureFilter = 'all' | 'direct' | 'indirect';
type View = { zoom: number; x: number; y: number };
type Point = { x: number; y: number };

function wrapLabel(value: string, maxLength: number, maxLines = 2) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current && `${current} ${word}`.length > maxLength) {
      lines.push(current);
      current = word;
    } else current = current ? `${current} ${word}` : word;
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, maxLength - 1)}…`;
  }
  return lines;
}

function sourceLink(url: string) {
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : null;
  } catch {
    return null;
  }
}

export default function ImpactMap({ event }: { event: RadarEvent }) {
  const [query, setQuery] = useState('');
  const [exposure, setExposure] = useState<ExposureFilter>('all');
  const [indirectCollapsed, setIndirectCollapsed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });
  const [compact, setCompact] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; point: Point; origin: Point; moved: boolean } | null>(null);
  const titleId = useId();
  const searchId = useId();
  const filterId = useId();
  const patternId = useId().replace(/:/g, '');

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 620));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const impacts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return event.impacts.filter(impact => {
      if (exposure !== 'all' && impact.exposure !== exposure) return false;
      if (indirectCollapsed && impact.exposure === 'indirect') return false;
      return !normalized || `${impact.entity.name} ${impact.entity.symbol ?? ''} ${impact.entity.assetClass} ${impact.channel}`.toLowerCase().includes(normalized);
    });
  }, [event.impacts, exposure, indirectCollapsed, query]);

  const selected = impacts.find(impact => impact.entity.id === selectedId) ?? impacts[0];
  const indirectCount = event.impacts.filter(impact => impact.exposure === 'indirect').length;
  const width = compact ? 560 : 960;
  const rows = Math.ceil(impacts.length / 2);
  const height = compact ? Math.max(500, 200 + rows * 112) : Math.max(430, rows * 118 + 60);
  const center = { x: width / 2, y: compact ? 76 : height / 2 };
  const nodeWidth = compact ? 228 : 220;
  const nodeHeight = 82;

  function nodePosition(index: number): Point {
    if (compact) return { x: index % 2 === 0 ? 138 : 422, y: 234 + Math.floor(index / 2) * 112 };
    const side = index % 2;
    const sideCount = Math.ceil((impacts.length - side) / 2);
    const row = Math.floor(index / 2);
    return { x: side === 0 ? 154 : width - 154, y: height / 2 + (row - (sideCount - 1) / 2) * 118 };
  }

  function edgePath(point: Point) {
    if (compact) {
      const start = { x: center.x + (point.x < center.x ? -38 : 38), y: center.y + 52 };
      return `M ${start.x} ${start.y} C ${start.x} ${start.y + 42}, ${point.x} ${point.y - 78}, ${point.x} ${point.y - nodeHeight / 2}`;
    }
    const direction = point.x < center.x ? -1 : 1;
    const start = center.x + direction * 137;
    const end = point.x - direction * nodeWidth / 2;
    return `M ${start} ${center.y} C ${start + direction * 72} ${center.y}, ${end - direction * 72} ${point.y}, ${end} ${point.y}`;
  }

  function changeZoom(delta: number) {
    setView(current => ({ ...current, zoom: Math.min(1.8, Math.max(0.65, Number((current.zoom + delta).toFixed(2)))) }));
  }

  function clearFilters() {
    setQuery('');
    setExposure('all');
    setIndirectCollapsed(false);
  }

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <div className={styles.heading}>
        <div>
          <div className={styles.eyebrow}><GitBranch size={13} aria-hidden="true" /> EXPLORE THE CONNECTIONS</div>
          <h2 id={titleId}>Impact network</h2>
          <p>One event. The channels that could transmit its impact.</p>
        </div>
        <span className={styles.connectionCount}>{event.impacts.length} connections</span>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={15} aria-hidden="true" />
          <label htmlFor={searchId} className={styles.srOnly}>Search entities and impact channels</label>
          <input id={searchId} type="search" placeholder="Find a connection…" value={query} onChange={e => setQuery(e.target.value)} />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear connection search"><X size={14} /></button>}
        </div>
        <div className={styles.exposureFilter}>
          <SlidersHorizontal size={13} aria-hidden="true" />
          <label htmlFor={filterId} className={styles.srOnly}>Filter by exposure</label>
          <select id={filterId} value={exposure} onChange={e => setExposure(e.target.value as ExposureFilter)}>
            <option value="all">All exposure</option>
            <option value="direct">Direct exposure</option>
            <option value="indirect">Indirect exposure</option>
          </select>
          <ChevronDown size={12} aria-hidden="true" />
        </div>
        {indirectCount > 0 && exposure !== 'indirect' && (
          <button className={styles.branchToggle} type="button" aria-pressed={indirectCollapsed} onClick={() => setIndirectCollapsed(current => !current)}>
            {indirectCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            Indirect <span>{indirectCount}</span>
          </button>
        )}
      </div>

      <div
        ref={viewportRef}
        className={`${styles.viewport} ${compact ? styles.compact : ''}`}
        onPointerDown={e => {
          if ((e.target as Element).closest('[data-map-node]') || (e.target as Element).closest('button')) return;
          dragRef.current = { pointerId: e.pointerId, point: { x: e.clientX, y: e.clientY }, origin: { x: view.x, y: view.y }, moved: false };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== e.pointerId) return;
          const bounds = e.currentTarget.getBoundingClientRect();
          const deltaX = (e.clientX - drag.point.x) * width / bounds.width;
          const deltaY = (e.clientY - drag.point.y) * height / bounds.height;
          drag.moved = Math.abs(deltaX) + Math.abs(deltaY) > 4;
          setView(current => ({ ...current, x: Math.max(-width / 2, Math.min(width / 2, drag.origin.x + deltaX)), y: Math.max(-height / 2, Math.min(height / 2, drag.origin.y + deltaY)) }));
        }}
        onPointerUp={e => {
          dragRef.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => { dragRef.current = null; }}
      >
        {impacts.length ? (
          <svg
            className={styles.graph}
            viewBox={`0 0 ${width} ${height}`}
            role="group"
            aria-label={`Impact network for ${event.title}. Select a connection for its explanation. Use arrow keys to pan, plus and minus to zoom, and zero to reset.`}
            tabIndex={0}
            onKeyDown={e => {
              if (e.target !== e.currentTarget) return;
              const step = 30;
              if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '0'].includes(e.key)) e.preventDefault();
              if (e.key === 'ArrowLeft') setView(current => ({ ...current, x: Math.max(-width / 2, current.x - step) }));
              if (e.key === 'ArrowRight') setView(current => ({ ...current, x: Math.min(width / 2, current.x + step) }));
              if (e.key === 'ArrowUp') setView(current => ({ ...current, y: Math.max(-height / 2, current.y - step) }));
              if (e.key === 'ArrowDown') setView(current => ({ ...current, y: Math.min(height / 2, current.y + step) }));
              if (e.key === '+' || e.key === '=') changeZoom(0.15);
              if (e.key === '-') changeZoom(-0.15);
              if (e.key === '0') setView({ zoom: 1, x: 0, y: 0 });
            }}
          >
            <defs>
              <pattern id={patternId} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.75" fill="#2a333a" /></pattern>
            </defs>
            <rect width={width} height={height} fill={`url(#${patternId})`} />
            <g transform={`translate(${width / 2 + view.x} ${height / 2 + view.y}) scale(${view.zoom}) translate(${-width / 2} ${-height / 2})`}>
              {impacts.map((impact, index) => {
                const point = nodePosition(index);
                const active = impact.entity.id === selected?.entity.id;
                return <path key={`edge-${impact.entity.id}`} d={edgePath(point)} fill="none" stroke={active ? '#65cfcd' : impact.exposure === 'direct' ? '#466c72' : '#36444d'} strokeWidth={active ? 2 : 1.25} strokeDasharray={impact.exposure === 'indirect' ? '5 5' : undefined} opacity={active ? 1 : 0.8} />;
              })}
              <g transform={`translate(${center.x - 137} ${center.y - 52})`}>
                <rect width="274" height="104" rx="10" fill="#15262b" stroke="#4c858c" />
                <circle cx="19" cy="21" r="3.5" fill="#76d8d4" />
                <text x="31" y="25" fill="#81c5c7" fontSize="9.5" fontWeight="600" letterSpacing="1.2">SELECTED EVENT</text>
                {wrapLabel(event.title, 34, 3).map((line, index) => <text key={index} x="17" y={48 + index * 17} fill="#edf3f5" fontSize="12" fontWeight="600">{line}</text>)}
              </g>
              {impacts.map((impact, index) => {
                const point = nodePosition(index);
                const active = impact.entity.id === selected?.entity.id;
                return (
                  <g
                    key={impact.entity.id}
                    data-map-node="true"
                    className={styles.node}
                    transform={`translate(${point.x - nodeWidth / 2} ${point.y - nodeHeight / 2})`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={active}
                    aria-label={`${impact.entity.name}, ${impact.exposure} exposure. ${impact.channel}. View supporting evidence.`}
                    onClick={() => setSelectedId(impact.entity.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedId(impact.entity.id);
                      }
                    }}
                  >
                    <rect className={styles.nodeRect} width={nodeWidth} height={nodeHeight} rx="8" fill={active ? '#16272c' : '#141c23'} stroke={active ? '#6ac9ca' : '#34404b'} strokeWidth={active ? 1.5 : 1} />
                    <text x="14" y="20" fill={active ? '#81c5c7' : '#93a3af'} fontSize="9" letterSpacing="0.9">{impact.entity.type.toUpperCase()}{impact.entity.symbol ? ` · ${impact.entity.symbol}` : ''}</text>
                    {wrapLabel(impact.entity.name, 29).map((line, lineIndex) => <text key={lineIndex} x="14" y={40 + lineIndex * 15} fill="#e8eef2" fontSize="12.5" fontWeight="600">{line}</text>)}
                    <text x="14" y="70" fill="#8f9da8" fontSize="9">{impact.exposure === 'direct' ? 'Direct exposure' : 'Indirect exposure'}</text>
                    <circle cx={nodeWidth - 17} cy="18" r="3" fill={active ? '#78d4d1' : '#697b86'} />
                  </g>
                );
              })}
            </g>
          </svg>
        ) : (
          <div className={styles.empty}>
            <GitBranch size={30} strokeWidth={1.25} aria-hidden="true" />
            <h3>{event.impacts.length ? 'No matching connections' : 'Connections are not available yet'}</h3>
            <p>{event.impacts.length ? 'Try another search or include more exposure types.' : 'This event needs supporting relationship evidence before it can be mapped.'}</p>
            {event.impacts.length > 0 && <button type="button" onClick={clearFilters}>Clear filters</button>}
          </div>
        )}
        <div className={styles.graphCorner}><span className={styles.cornerMarker} /> EVENT → EXPOSURE</div>
        <div className={styles.controls} aria-label="Impact network view controls">
          <button type="button" onClick={() => changeZoom(0.15)} disabled={view.zoom >= 1.8} aria-label="Zoom in on impact network"><Plus size={16} /></button>
          <span aria-live="polite">{Math.round(view.zoom * 100)}%</span>
          <button type="button" onClick={() => changeZoom(-0.15)} disabled={view.zoom <= 0.65} aria-label="Zoom out of impact network"><Minus size={16} /></button>
          <span className={styles.controlDivider} />
          <button type="button" onClick={() => setView({ zoom: 1, x: 0, y: 0 })} aria-label="Reset impact network view"><Expand size={15} /></button>
        </div>
      </div>

      <div className={styles.legend}>
        <div><span className={styles.solidLine} /> Direct exposure <span className={styles.dashedLine} /> Indirect exposure</div>
        <span className={styles.panHint}><Move size={12} /> Drag to pan · Select to explore</span>
      </div>

      {impacts.length > 0 && (
        <div className={styles.entityTabs} aria-label="Explore mapped entities">
          {impacts.map(impact => <button key={impact.entity.id} type="button" aria-pressed={selected?.entity.id === impact.entity.id} className={selected?.entity.id === impact.entity.id ? styles.entityTabActive : ''} onClick={() => setSelectedId(impact.entity.id)}>{impact.entity.name}<ArrowDownRight size={12} /></button>)}
        </div>
      )}

      {selected && <ImpactDetails impact={selected} />}
      <div className={styles.footnote}><Crosshair size={12} aria-hidden="true" /><span>Connections describe potential transmission channels. They do not establish causation or predict price direction.</span></div>
    </section>
  );
}

function ImpactDetails({ impact }: { impact: RadarImpact }) {
  const evidence = impact.evidence.map(item => ({ ...item, href: sourceLink(item.url) })).filter(item => item.href);
  return (
    <div className={styles.details} aria-live="polite" aria-atomic="true">
      <div className={styles.detailTop}>
        <div><span className={styles.detailEyebrow}>{impact.entity.assetClass} / {impact.entity.type}</span><h3>{impact.entity.name}{impact.entity.symbol && <span>{impact.entity.symbol}</span>}</h3></div>
        <div className={styles.badges}><span>{impact.exposure} exposure</span><span className={styles.confidence}>{impact.confidence} confidence</span></div>
      </div>
      <div className={styles.detailGrid}>
        <div>
          <h4>THE TRANSMISSION CHANNEL</h4>
          <p className={styles.channel}>{impact.channel}</p>
          <p className={styles.explanation}>{impact.explanation}</p>
          {evidence.length > 0 ? <div className={styles.evidence}>{evidence.map((source, index) => <a key={`${source.url}-${index}`} href={source.href!} target="_blank" rel="noopener noreferrer" title={source.title}>{source.publisher}<ArrowUpRight size={12} aria-hidden="true" /><span className={styles.srOnly}>: {source.title} (opens in a new tab)</span></a>)}</div> : <p className={styles.missingEvidence}>Supporting relationship sources have not been attached.</p>}
        </div>
        <div className={styles.alternatives}>
          <h4>WHAT COULD CHANGE THE PICTURE</h4>
          {impact.alternatives.length ? <ul>{impact.alternatives.map((alternative, index) => <li key={index}>{alternative}</li>)}</ul> : <p>Alternative scenarios have not been assessed for this relationship.</p>}
          <span className={styles.direction}>Price direction: {impact.direction}</span>
        </div>
      </div>
    </div>
  );
}
