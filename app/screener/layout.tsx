import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';

// Metadata for this route lives here because the page itself is a client component.
export const metadata: Metadata = pageMetadata({
  title: 'Free Stock Screener',
  description: 'Filter stocks by market cap, price, performance, valuation, fundamentals and technical rating with a free stock screener powered by TradingView data.',
  path: '/screener',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
