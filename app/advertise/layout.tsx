import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';

// Metadata for this route lives here because the page itself is a client component.
export const metadata: Metadata = pageMetadata({
  title: 'Advertise With Us',
  description: 'Advertising formats, standards and how to reach the finance-focused readers of The Market Stories.',
  path: '/advertise',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
