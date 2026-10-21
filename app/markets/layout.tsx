import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';

// Metadata for this route lives here because the page itself is a client component.
export const metadata: Metadata = pageMetadata({
  title: 'Live Markets: Indices, Stocks, Crypto, Commodities and Forex',
  description: 'Live prices and charts for global and Indian stock indices, large-cap stocks, crypto, commodities, government bonds, ETFs and currency pairs, plus an economic calendar.',
  path: '/markets',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
