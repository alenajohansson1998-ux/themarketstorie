import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found | The Market Stories',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="site-container px-4 py-20 text-center md:px-6">
      <p className="section-label">404</p>
      <h1 className="mt-2 text-title1 text-ink">We couldn’t find that page</h1>
      <p className="mx-auto mt-3 max-w-xl text-body text-ink-2">
        The link may be outdated or the page may have moved. Browse the latest stories or return to the homepage.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/blog" className="inline-flex h-11 items-center rounded-control bg-ink px-5 text-headline text-canvas">
          Latest stories
        </Link>
        <Link href="/" className="inline-flex h-11 items-center rounded-control bg-fill px-5 text-headline text-ink hover:bg-fill-2">
          Home
        </Link>
      </div>
    </div>
  );
}
