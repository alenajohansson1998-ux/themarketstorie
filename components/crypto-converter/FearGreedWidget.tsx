"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Gauge zone colors. They mark position on the dial only; the reading is always printed as text.
function getColor(value: number): string {
  if (value <= 20) return "#e5484d";
  if (value <= 40) return "#f76b15";
  if (value <= 60) return "#ffb224";
  if (value <= 80) return "#7bc950";
  return "#30a46c";
}

export default function FearGreedWidget() {
  const { data, error, isLoading } = useSWR("/api/crypto/fear-greed", fetcher, {
    refreshInterval: 3_600_000,
  });

  const hasValue = typeof data?.value === "number";
  const value: number = hasValue ? data.value : 50;
  const classification: string = data?.classification ?? "Neutral";
  const color = getColor(value);

  // Half-circle dial: 0 sits at the left end, 100 at the right, 50 straight up.
  const radius = 70;
  const cx = 90;
  const cy = 88;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const needleAngle = 180 + (value / 100) * 180;
  const needleX = cx + (radius - 14) * Math.cos(toRad(needleAngle));
  const needleY = cy + (radius - 14) * Math.sin(toRad(needleAngle));
  const valueX = cx + radius * Math.cos(toRad(needleAngle));
  const valueY = cy + radius * Math.sin(toRad(needleAngle));
  
  return (
    <section aria-labelledby="fear-greed-heading" className="rounded-card bg-surface p-6">
      <h2 id="fear-greed-heading" className="text-headline text-ink">
        Market sentiment
      </h2>
      <p className="text-footnote text-ink-2">Crypto Fear &amp; Greed Index</p>

      {error || (!isLoading && !hasValue) ? (
        <p className="mt-6 text-subhead text-ink-2">The index is unavailable right now.</p>
      ) : (
        <div className="mt-2 flex flex-col items-center">
          <svg
            viewBox="0 0 180 112"
            className="h-auto w-48"
            role="img"
            aria-label={isLoading ? "Loading index" : `${value} out of 100, ${classification}`}
          >
            <path
              d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
              fill="none"
              stroke="var(--color-fill)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {!isLoading ? (
              <>
                <path
                  d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${valueX} ${valueY}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r="5" fill="var(--color-ink)" />
                <text x={cx} y={cy + 22} textAnchor="middle" fill="var(--color-ink)" fontSize="20" fontWeight="700">
                  {value}
                </text>
              </>
            ) : null}
          </svg>
          <p className="mt-1 inline-flex items-center gap-2 text-headline text-ink">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
            {isLoading ? "Loading…" : classification}
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-between text-caption text-ink-2" aria-hidden="true">
        <span>Extreme fear</span>
        <span>Neutral</span>
        <span>Extreme greed</span>
      </div>
    </section>
  );
}
