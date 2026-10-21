import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';

// Metadata for this route lives here because the page itself is a client component.
export const metadata: Metadata = pageMetadata({
  title: 'Search',
  description: 'Search news, analysis and market coverage from The Market Stories.',
  path: '/search',
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
