import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Currency Exchange Rates',
  description: 'Compare major currency exchange rates and recent market moves in one table.',
  path: '/tools/forex-heatmap/all-rates',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
