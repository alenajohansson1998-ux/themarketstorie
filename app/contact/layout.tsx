import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';

// Metadata for this route lives here because the page itself is a client component.
export const metadata: Metadata = pageMetadata({
  title: 'Contact Us',
  description: 'Contact The Market Stories about editorial questions, corrections, advertising, partnerships or technical support.',
  path: '/contact',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
