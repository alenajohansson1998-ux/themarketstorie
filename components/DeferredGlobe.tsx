'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

function GlobePreview() {
  return (
    <svg viewBox="0 0 440 440" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <clipPath id="market-globe-clip">
          <circle cx="220" cy="220" r="198" />
        </clipPath>
        <radialGradient id="market-globe-shade" cx="34%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#163b51" />
          <stop offset="65%" stopColor="#081522" />
          <stop offset="100%" stopColor="#03070d" />
        </radialGradient>
      </defs>
      <circle cx="220" cy="220" r="198" fill="url(#market-globe-shade)" />
      <g clipPath="url(#market-globe-clip)" fill="#188b73" fillOpacity=".78">
        <path d="m57 143 20-23 34-13 24 9 17 19-12 12-4 20-17 9-6 26-17 7-8-14-15-5-10-20-21-4-13-12zM118 227l18 7 10 17-5 16 12 20-9 34-18 24-11-20-4-34-10-23 3-23zM196 111l22-13 28 7 15 16-5 17-19 8-9 16-16-6-9-18-18-9zM214 171l29-15 33 4 18 15 22-4 24 11 10 20-19 12-20-7-16 16-21 1-10 19-18 8-5 21-21 4-12-18 4-24-10-15 7-21-15-13zM278 276l22-11 20 7 11 20-7 28-18 21-15-10-12-24zM340 143l13-9 18 8 3 15-15 8-17-8z" />
      </g>
      <g clipPath="url(#market-globe-clip)" fill="none" stroke="#7dd3fc" strokeOpacity=".17">
        <ellipse cx="220" cy="220" rx="198" ry="74" />
        <ellipse cx="220" cy="220" rx="198" ry="140" />
        <ellipse cx="220" cy="220" rx="82" ry="198" />
        <ellipse cx="220" cy="220" rx="150" ry="198" />
      </g>
      <circle cx="220" cy="220" r="198" fill="none" stroke="#7dd3fc" strokeOpacity=".44" strokeWidth="2" />
    </svg>
  );
}

function GlobeLoadingPreview() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-full bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.16),transparent_64%)]">
      <GlobePreview />
      <span className="absolute inset-x-0 bottom-4 text-center text-footnote text-ink-2" role="status">
        Loading interactive market map…
      </span>
    </div>
  );
}

// Three.js and country shapes stay out of the homepage bundle until the reader requests them.
const WorldMarketHeatMap = dynamic(() => import('./WorldMarketHeatMap'), {
  ssr: false,
  loading: GlobeLoadingPreview,
});

/** The homepage uses a light preview; the interactive globe loads after an explicit request. */
export default function DeferredGlobe() {
  const [show, setShow] = useState(false);

  return (
    <div className="mx-auto hidden w-full max-w-[440px] sm:block">
      {show ? (
        <WorldMarketHeatMap showSummaryChips={false} showFootnote={false} compact />
      ) : (
        <button
          type="button"
          onClick={() => setShow(true)}
          className="group block w-full rounded-card text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tint"
          aria-label="Load the interactive market map"
        >
          <span className="relative block aspect-square w-full overflow-hidden rounded-full bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.16),transparent_64%)] transition-transform duration-300 group-hover:scale-[1.02]">
            <GlobePreview />
          </span>
          <span className="mt-2 inline-flex min-h-11 items-center text-subhead font-medium text-tint underline underline-offset-2">
            Load interactive market map
          </span>
        </button>
      )}
    </div>
  );
}
