import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';


export interface MarketTickerItem {
  symbol: string;
  price: number;
  change24h: number | null;
  iconUrl?: string; // Optional: icon URL for asset
}

interface MarketTickerBarProps {
  data: MarketTickerItem[];
}

const toMarketHref = (symbol: string) => {
  const upper = symbol.trim().toUpperCase();
  if (!upper) return '/markets';

  if (upper.includes(':') || upper.endsWith('USDT') || upper.endsWith('USD')) {
    return `/markets/${encodeURIComponent(upper)}`;
  }

  if (/^[A-Z0-9]{2,10}$/.test(upper)) {
    if (upper === 'USDT') {
      return `/markets/${encodeURIComponent('USDTUSD')}`;
    }
    return `/markets/${encodeURIComponent(`${upper}USDT`)}`;
  }

  return `/markets/${encodeURIComponent(upper)}`;
};

const MarketTickerBar: React.FC<MarketTickerBarProps> = ({ data }) => {
  const [paused, setPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate data for seamless loop
  const items = data.length > 0 ? [...data, ...data] : [];

  // Animation for continuous scroll
  useEffect(() => {
    if (!tickerRef.current || !scrollRef.current) return;
    let animationId: number;
    let start: number | null = null;
    let scrollLeft = 0;
    const speed = 0.10; // px per ms (slower for readability)

    const animate = (timestamp: number) => {
      if (paused || !tickerRef.current || !scrollRef.current) return;
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      if (!tickerRef.current) return;
      tickerRef.current.scrollLeft = scrollLeft + elapsed * speed;
      // Reset for seamless loop
      if (tickerRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
        tickerRef.current.scrollLeft = 0;
        scrollLeft = 0;
        start = timestamp;
      }
      animationId = requestAnimationFrame(animate);
    };

    if (!paused) {
      scrollLeft = tickerRef.current.scrollLeft;
      start = null;
      animationId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationId);
  }, [paused, data]);

  // Touch scroll for mobile
  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    let isTouching = false;
    let startX = 0;
    let scrollStart = 0;
    const onTouchStart = (e: TouchEvent) => {
      isTouching = true;
      setPaused(true);
      startX = e.touches[0].clientX;
      scrollStart = el.scrollLeft;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isTouching) return;
      const dx = startX - e.touches[0].clientX;
      el.scrollLeft = scrollStart + dx;
    };
    const onTouchEnd = () => {
      isTouching = false;
      setPaused(false);
    };
    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchmove', onTouchMove);
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div
      className="market-ticker-bar"
      style={{
        width: '100%',
        background: '#fff',
        color: '#222',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        fontSize: 13,
        fontFamily: 'Inter, Arial, sans-serif',
        fontWeight: 500,
        letterSpacing: 0.1,
        position: 'relative',
        cursor: 'pointer',
        borderTop: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={tickerRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          ref={scrollRef}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {items.map((item, i) => (
            <Link
              key={i + item.symbol}
              href={toMarketHref(item.symbol)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '100%',
                padding: '0 18px',
                gap: 7,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'background 0.2s',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {/* Asset icon (optional) */}
              {item.iconUrl && (
                <Image src={item.iconUrl} alt={item.symbol} width={16} height={16} style={{ marginRight: 6, borderRadius: 8 }} />
              )}
              <span style={{ color: '#222', fontWeight: 600, marginRight: 4 }}>{item.symbol}</span>
              <span style={{ color: '#374151', opacity: 0.92, marginRight: 4 }}>${item.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              {item.change24h !== null && (
                <span
                  style={{
                    color: item.change24h > 0 ? '#16a34a' : item.change24h < 0 ? '#dc2626' : '#6b7280',
                    fontWeight: 700,
                  }}
                >
                  {item.change24h > 0 ? '+' : ''}{item.change24h?.toFixed(2)}%
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
      {/* Fade effect at edges */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 24,
        height: '100%',
        background: 'linear-gradient(to right, #050507 80%, transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: 24,
        height: '100%',
        background: 'linear-gradient(to left, #050507 80%, transparent)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};

export default MarketTickerBar;
