'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// three.js and the country shapes load only when the globe is actually shown.
const WorldMarketHeatMap = dynamic(() => import('./WorldMarketHeatMap'), { ssr: false });

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/** The hero globe: skipped on phones, and started after the page is idle elsewhere. */
export default function DeferredGlobe() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 640px)');
    if (!wide.matches) return;
    const w = window as IdleWindow;
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setShow(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(() => setShow(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto hidden w-full max-w-[440px] sm:block">
      {show ? (
        <WorldMarketHeatMap showSummaryChips={false} showFootnote={false} compact />
      ) : (
        <div className="flex flex-col items-center py-1 sm:py-2" aria-hidden="true">
          <div className="aspect-square w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.16),transparent_64%)]" />
          <div className="mt-2 h-4" />
        </div>
      )}
    </div>
  );
}
