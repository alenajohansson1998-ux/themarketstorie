import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="site-container px-4 py-20 text-center md:px-6 lg:py-28">
      <p className="section-label">Error 404</p>
      <h1 className="mt-2 text-title1 text-ink sm:text-display">We couldn’t find that page</h1>
      <p className="mx-auto mt-4 max-w-md text-title3 font-normal text-ink-2">
        It may have moved, or the link may be mistyped. Try one of these instead.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-control bg-ink px-7 text-headline text-canvas transition-opacity hover:opacity-85"
        >
          Go to the home page
        </Link>
        <Link
          href="/search"
          className="inline-flex h-12 items-center justify-center rounded-control bg-fill px-7 text-headline text-ink transition-colors hover:bg-fill-2"
        >
          Search the site
        </Link>
      </div>
      <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-subhead">
        {[
          { label: 'Latest news', href: '/blog' },
          { label: 'Markets', href: '/markets' },
          { label: 'Tools', href: '/tools' },
          { label: 'Learn', href: '/learn' },
        ].map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="inline-flex min-h-11 items-center font-medium text-tint hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
