'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="site-container px-4 py-20 text-center md:px-6 lg:py-28">
      <h1 className="text-title1 text-ink sm:text-display">This page didn’t load</h1>
      <p className="mx-auto mt-4 max-w-md text-title3 font-normal text-ink-2">
        Something went wrong on our side. Try again, and if it keeps happening, come back in a few minutes.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center rounded-control bg-ink px-7 text-headline text-canvas transition-opacity hover:opacity-85"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-control bg-fill px-7 text-headline text-ink transition-colors hover:bg-fill-2"
        >
          Go to the home page
        </Link>
      </div>
    </div>
  );
}
