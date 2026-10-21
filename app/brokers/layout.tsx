import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';

// Metadata for this route lives here because the page itself is a client component.
export const metadata: Metadata = pageMetadata({
  title: 'Broker Reviews and Comparison',
  description: 'Compare trading brokers by rating, tradable assets, account numbers and offers, and read The Market Stories broker reviews.',
  path: '/brokers',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
