import type { Metadata } from "next";
import SafeImage from '@/components/SafeImage';
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { StarRating } from "@/components/BrokerCard";
import BrokerGuides from "@/components/BrokerGuides";
import { getBrokerBySlug } from '@/lib/server/content';
import { JsonLd, breadcrumbSchema, webPageSchema } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';
import { summarize } from '@/lib/seo/site';

interface BrokerDetail {
  name: string;
  logoUrl: string;
  rating: number;
  ratingText: string;
  assets: string;
  reviews: number;
  accounts: string;
  badge?: string;
  description?: string;
  regulator?: string;
  website?: string;
  phone?: string;
  address?: string;
  terms?: string;
  features?: string[];
  faq?: { question?: string; answer?: string }[];
  banner?: string;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const broker = await getBrokerBySlug(id) as BrokerDetail | null;
  if (!broker) notFound();
  return pageMetadata({
    title: `${broker.name} Broker Profile`,
    description: summarize(broker.description || `Broker profile and account information for ${broker.name}.`),
    path: `/brokers/${encodeURIComponent(id)}`,
    image: /^https:\/\//i.test(broker.logoUrl) ? broker.logoUrl : undefined,
  });
}

export const revalidate = 600;

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line-soft py-3 sm:flex-row sm:gap-6">
      <dt className="w-40 shrink-0 text-subhead text-ink-2">{label}</dt>
      <dd className="text-subhead text-ink">{children}</dd>
    </div>
  );
}

export default async function BrokerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const broker = await getBrokerBySlug(id) as BrokerDetail | null;
  if (!broker) return notFound();

  const features = (broker.features ?? []).filter(Boolean);
  const faq = (broker.faq ?? []).filter((item) => item.question && item.answer);
  const website = broker.website?.trim();
  const description = summarize(broker.description || `Broker profile and account information for ${broker.name}.`);

  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <JsonLd
        data={[
          webPageSchema({ path: `/brokers/${encodeURIComponent(id)}`, name: `${broker.name} Broker Profile`, description, type: 'ProfilePage' }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Brokers', path: '/brokers' },
            { name: broker.name, path: `/brokers/${encodeURIComponent(id)}` },
          ]),
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-footnote text-ink-2">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/brokers" className="hover:text-ink hover:underline">
              Brokers
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="text-ink">
            {broker.name}
          </li>
        </ol>
      </nav>

      <header className="mt-6 flex flex-col gap-6 border-b border-line-soft pb-8 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-card bg-white p-3 ring-1 ring-line-soft">
          <SafeImage src={broker.logoUrl} fallbackSrc="/default-broker-logo.svg" alt={`${broker.name} logo`} className="max-h-full w-auto object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-title1 text-ink">{broker.name}</h1>
            {broker.badge ? (
              <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-caption font-semibold uppercase tracking-wide text-brand">
                {broker.badge}
              </span>
            ) : null}
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-subhead text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <StarRating rating={broker.rating} />
              <span className="font-semibold text-ink">{broker.rating.toFixed(1)}</span>
              <span className="sr-only">out of 5,</span>
              {broker.ratingText}
            </span>
            <span aria-hidden="true">·</span>
            <span>{broker.reviews.toLocaleString()} reviews</span>
          </p>
        </div>
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex h-11 items-center self-start rounded-control bg-ink px-5 text-headline text-canvas transition-opacity hover:opacity-85 sm:self-auto"
          >
            Visit {broker.name}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
      </header>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-12">
          {broker.description ? (
            <section aria-labelledby="broker-overview">
              <h2 id="broker-overview" className="mb-3 text-title2 text-ink">
                Overview
              </h2>
              <p className="max-w-[68ch] text-body text-ink">{broker.description}</p>
            </section>
          ) : null}

          {broker.terms ? (
            <section aria-labelledby="broker-terms">
              <h2 id="broker-terms" className="mb-3 text-title2 text-ink">
                Terms and offer
              </h2>
              <p className="max-w-[68ch] text-body text-ink">{broker.terms}</p>
            </section>
          ) : null}

          {features.length > 0 ? (
            <section aria-labelledby="broker-features">
              <h2 id="broker-features" className="mb-4 text-title2 text-ink">
                Tools and features
              </h2>
              <ul className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-body text-ink">
                    <Check className="h-4 w-4 shrink-0 text-up" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {faq.length > 0 ? (
            <section aria-labelledby="broker-faq">
              <h2 id="broker-faq" className="mb-4 text-title2 text-ink">
                Frequently asked questions
              </h2>
              <div className="divide-y divide-line-soft border-y border-line-soft">
                {faq.map((item) => (
                  <details key={item.question} className="group">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-headline text-ink [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <span className="text-title3 font-normal text-ink-2 transition-transform group-open:rotate-45" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p className="pb-4 text-body text-ink-2">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside aria-labelledby="broker-facts" className="lg:sticky lg:top-20 lg:self-start">
          <h2 id="broker-facts" className="mb-2 text-headline text-ink">
            At a glance
          </h2>
          <dl className="border-t border-line-soft">
            <Fact label="Tradable assets">{broker.assets}</Fact>
            <Fact label="Accounts">{broker.accounts}</Fact>
            <Fact label="Reviews">{broker.reviews.toLocaleString()}</Fact>
            {broker.regulator ? <Fact label="Regulator">{broker.regulator}</Fact> : null}
            {website ? (
              <Fact label="Website">
                <a href={website} target="_blank" rel="noopener noreferrer sponsored" className="break-all text-tint hover:underline">
                  {website.replace(/^https?:\/\//, "")}
                </a>
              </Fact>
            ) : null}
            {broker.phone ? <Fact label="Phone">{broker.phone}</Fact> : null}
            {broker.address ? <Fact label="Address">{broker.address}</Fact> : null}
          </dl>
          <p className="mt-4 text-footnote text-ink-2">
            Trading involves risk. Check a broker’s regulation and fees before opening an account.
          </p>
        </aside>
      </div>

      <BrokerGuides title="More broker guides" />
    </div>
  );
}
