import type { RadarCategory } from '@/lib/market-impact/types';

export const CATEGORY_LABELS: Record<RadarCategory, string> = {
  'monetary-policy': 'Monetary policy', economy: 'Economic data', earnings: 'Earnings',
  corporate: 'Corporate', geopolitics: 'Geopolitics', energy: 'Energy', crypto: 'Crypto',
  technology: 'Technology', regulation: 'Regulation', markets: 'Markets',
};

export function formatRadarTime(value: string, includeDate = false) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Time unavailable';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', ...(includeDate ? { day: '2-digit', month: 'short' } : {}),
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date) + ' IST';
}

export function formatRadarPrice(value: number | null, currency = 'USD') {
  if (value === null || !Number.isFinite(value)) return '\u2014';
  if (currency === 'PTS') return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value)} pts`;
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency', currency, maximumFractionDigits: value < 10 ? 4 : 2,
  }).format(value);
}

export function formatRadarChange(value: number | null, suffix = '%') {
  return value === null || !Number.isFinite(value) ? '\u2014' : `${value > 0 ? '+' : ''}${value.toFixed(2)}${suffix}`;
}

export function safeRadarUrl(value: string) {
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '#'; }
  catch { return '#'; }
}
