import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';

// Shared canonical metadata for the markets intelligence workspace.
export const metadata: Metadata = pageMetadata({
  title: 'Market Impact Radar: News, Market Connections and Evidence',
  description: 'Explore source-linked market events, documented economic exposures, observed price history, and your personal radar. Compare potential impacts with actual market observations.',
  path: '/markets',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
