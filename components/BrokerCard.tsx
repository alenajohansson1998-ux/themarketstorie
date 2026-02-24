import React from "react";

interface BrokerCardProps {
  name: string;
  logo: string;
  rating: number;
  ratingText: string;
  assets: string;
  reviews: number;
  accounts: string;
  badge?: string;
  terms?: string;
  description?: string;
  ctaUrl?: string;
}

const BrokerCard: React.FC<BrokerCardProps> = ({
  name,
  logo,
  rating,
  ratingText,
  assets,
  reviews,
  terms,
  accounts,
  badge,
  description,
  ctaUrl = "#",
}) => {
  return (
    <div className="group relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0b0b0b] via-black to-[#0b0b0b]">

      {/* OUTER BORDER */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/25 opacity-80 transition group-hover:opacity-100" />

      {/* INNER BORDER (KEY FIX) */}
      <div className="pointer-events-none absolute inset-[1px] rounded-[27px] border border-white/10 opacity-70 transition group-hover:opacity-90" />

      {/* SUBTLE GLOW */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* CARD CONTENT */}
      <div className="relative z-10 flex items-center justify-between gap-10 p-10">
        
        {/* LEFT CONTENT */}
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              {name}
            </h2>

            {badge && (
              <span className="rounded-full bg-[#1f2933] px-3 py-1 text-xs font-semibold text-gray-200">
                {badge}
              </span>
            )}
          </div>

          <p className="mb-5 text-sm text-gray-300">
            Tradable assets: {assets}
          </p>

          {/* RATING ROW */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1 font-semibold text-white">
              {rating}
              <span className="text-gray-400">• {ratingText}</span>
            </span>

            <span>⭐⭐⭐⭐⭐</span>

            <span className="flex items-center gap-1">
              🗨 {reviews}
              <span className="text-gray-400">Reviews</span>
            </span>

            <span className="flex items-center gap-1">
              👤 {accounts}
              <span className="text-gray-400">Accounts</span>
            </span>
          </div>

          {/* PROMOTION */}
          {terms && (
            <>
              <h3 className="mb-1 text-2xl font-bold text-white">
                {terms}
              </h3>
              <p className="mb-6 text-sm text-gray-400">Promotion</p>
            </>
          )}

          {/* CTA */}
          <div className="flex gap-4">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              Open account ↗
            </a>

            <a
              href={ctaUrl}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
            >
              Learn more
            </a>
          </div>
        </div>

        {/* RIGHT LOGO STACK */}
        <div className="relative h-44 w-44 shrink-0">
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[28px] bg-white/20" />
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[28px] bg-white/40" />
          <div className="relative z-10 flex h-full w-full items-center justify-center rounded-[28px] bg-[#f4f7fb]">
            <img
              src={logo}
              alt={`${name} logo`}
              className="h-20 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/default-broker-logo.svg";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerCard;
