import { ImageResponse } from 'next/og';

// Social sharing card (1200×630). /og for the site, /og?title=…&eyebrow=… for a page without its own image.
export const runtime = 'edge';

const MARK_PATHS = [
  'M60 58h78l105 172 102-172h75L243 345 123 148v254l-63 13z',
  'M138 205l60 100v87l-60 10z',
  'M285 305l60-100v190l-60-10z',
  'M362 175l58-87v327l-58-7z',
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || 'Financial news, market analysis and business insights').slice(0, 140);
  const eyebrow = (searchParams.get('eyebrow') || 'The Market Stories').slice(0, 40);
  const fontSize = title.length > 90 ? 52 : title.length > 60 ? 60 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <svg width="64" height="64" viewBox="40 40 400 400" fill="#1d1d1f">
            {MARK_PATHS.map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
          <div style={{ fontSize: 34, fontWeight: 700, color: '#1d1d1f', letterSpacing: -0.5 }}>TheMarketStories</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: '#8a6a2c', textTransform: 'uppercase', letterSpacing: 2 }}>
            {eyebrow}
          </div>
          <div style={{ fontSize, fontWeight: 700, color: '#1d1d1f', lineHeight: 1.1, letterSpacing: -1 }}>{title}</div>
        </div>
        <div style={{ fontSize: 24, color: '#6e6e73' }}>themarketstories.com</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable' },
    }
  );
}
