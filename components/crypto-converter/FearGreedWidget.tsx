"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getColor(value: number): string {
  if (value <= 20) return "#ef4444";
  if (value <= 40) return "#f97316";
  if (value <= 60) return "#eab308";
  if (value <= 80) return "#84cc16";
  return "#22c55e";
}

export default function FearGreedWidget() {
  const { data } = useSWR("/api/crypto/fear-greed", fetcher, {
    refreshInterval: 3_600_000,
  });

  const value: number = data?.value ?? 50;
  const classification: string = data?.classification ?? "Neutral";
  const color = getColor(value);

  const angle = -135 + (value / 100) * 270;
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcStart = { x: cx + radius * Math.cos(toRad(-135)), y: cy + radius * Math.sin(toRad(-135)) };
  const arcEnd = { x: cx + radius * Math.cos(toRad(135)), y: cy + radius * Math.sin(toRad(135)) };

  const needleX = cx + (radius - 10) * Math.cos(toRad(angle));
  const needleY = cy + (radius - 10) * Math.sin(toRad(angle));

  return (
    <div className="bg-[#0d1117] border border-[#1e2535] rounded-2xl p-6">
      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">Market Sentiment</p>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 180 120" className="w-44 h-auto">
          <path
            d={`M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 1 1 ${arcEnd.x} ${arcEnd.y}`}
            fill="none"
            stroke="#1e2535"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="5" fill={color} />
          <text x={cx} y={cy + 22} textAnchor="middle" fill="white" fontSize="22" fontWeight="900">
            {value}
          </text>
        </svg>
        <p className="text-sm font-bold mt-1" style={{ color }}>
          {classification}
        </p>
        <p className="text-xs text-gray-500 mt-1">Fear & Greed Index</p>
      </div>

      <div className="flex justify-between mt-4 text-[10px] text-gray-600">
        <span>Extreme Fear</span>
        <span>Greed</span>
        <span>Extreme Greed</span>
      </div>
    </div>
  );
}
