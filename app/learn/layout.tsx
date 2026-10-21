import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';

// Metadata for this route lives here because the page itself is a client component.
export const metadata: Metadata = pageMetadata({
  title: 'Learn Trading and Investing: 15 Free Lessons',
  description: 'Free, plain-English lessons on how financial markets work: stocks, forex, crypto, technical and fundamental analysis, risk management and reading financial statements.',
  path: '/learn',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
