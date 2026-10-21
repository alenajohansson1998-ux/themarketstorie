import React from "react";
import SafeImage from '@/components/SafeImage';
import Link from "next/link";
import { Star } from "lucide-react";

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
  /** Internal review page */
  detailUrl: string;
  /** Broker's own site, when known */
  websiteUrl?: string;
}

export function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = rounded >= i + 1;
        const half = !filled && rounded >= i + 0.5;
        return (
          <span key={i} className="relative inline-block h-4 w-4">
            <Star className="absolute inset-0 h-4 w-4 text-fill-2" fill="currentColor" strokeWidth={0} />
            {filled || half ? (
              <span className="absolute inset-0 overflow-hidden" style={{ width: half ? "50%" : "100%" }}>
                <Star className="h-4 w-4 text-brand" fill="currentColor" strokeWidth={0} />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
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
  detailUrl,
  websiteUrl,
}) => {
  return (
    <article className="flex flex-col gap-6 rounded-media bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-card bg-white p-3 sm:h-32 sm:w-32">
        <SafeImage src={logo} fallbackSrc="/default-broker-logo.svg" alt={`${name} logo`} className="max-h-full w-auto object-contain" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-title2 text-ink">{name}</h2>
          {badge ? (
            <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-caption font-semibold uppercase tracking-wide text-brand">
              {badge}
            </span>
          ) : null}
        </div>

        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-subhead text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <StarRating rating={rating} />
            <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
            <span className="sr-only">out of 5,</span>
            {ratingText}
          </span>
          <span aria-hidden="true">·</span>
          <span>{reviews.toLocaleString()} reviews</span>
          <span aria-hidden="true">·</span>
          <span>{accounts} accounts</span>
        </p>

        <p className="mt-2 text-subhead text-ink-2">
          <span className="font-medium text-ink">Assets:</span> {assets}
        </p>
        {description ? <p className="mt-2 line-clamp-2 text-subhead text-ink-2">{description}</p> : null}
        {terms ? (
          <p className="mt-2 text-subhead text-ink">
            <span className="font-medium">Offer:</span> {terms}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={detailUrl}
            className="inline-flex h-11 items-center rounded-control bg-ink px-5 text-headline text-canvas transition-opacity hover:opacity-85"
          >
            Read review<span className="sr-only">: {name}</span>
          </Link>
          {websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex h-11 items-center rounded-control bg-fill px-5 text-headline text-ink transition-colors hover:bg-fill-2"
            >
              Visit {name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default BrokerCard;
