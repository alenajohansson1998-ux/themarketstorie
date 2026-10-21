import { ImageResponse } from 'next/og';

// Publisher logo for structured data (512×512 PNG), drawn from the same mark as the site header.
export const dynamic = 'force-static';

const MARK_PATHS = [
  'M60 58h78l105 172 102-172h75L243 345 123 148v254l-63 13z',
  'M138 205l60 100v87l-60 10z',
  'M285 305l60-100v190l-60-10z',
  'M362 175l58-87v327l-58-7z',
];

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
        <svg width="400" height="400" viewBox="40 40 400 400" fill="#1d1d1f">
          {MARK_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
