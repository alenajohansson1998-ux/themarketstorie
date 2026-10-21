import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import NewsletterForm from '@/components/NewsletterForm';

export const metadata: Metadata = {
  title: 'Subscribe | The Market Stories',
  description: 'Subscribe to The Market Stories for daily financial news, market analysis, and investment insights delivered straight to your inbox.',
  alternates: { canonical: 'https://themarketstories.com/subscription' },
  openGraph: {
    title: 'Subscribe | The Market Stories',
    description: 'Get daily market news and analysis delivered to your inbox.',
    url: 'https://themarketstories.com/subscription',
    siteName: 'The Market Stories',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const BENEFITS = [
  'The day’s market recap and top stories',
  'Stock, crypto and commodity analysis',
  'Economic calendar highlights for the week ahead',
  'Expert opinion and technical breakdowns',
];

export default function SubscriptionPage() {
  return (
    <div className="site-container px-4 py-14 md:px-6 lg:py-20">
      <div className="mx-auto max-w-xl">
        <p className="section-label text-center">Newsletter</p>
        <h1 className="mt-2 text-center text-title1 text-ink sm:text-display">Stay ahead of the market</h1>
        <p className="mt-4 text-center text-title3 font-normal text-ink-2">
          Financial news, market analysis and investment insight in your inbox. Free.
        </p>

        <div className="mt-10 rounded-media bg-surface p-6 sm:p-8">
          <ul className="space-y-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-body text-ink">
                <Check className="mt-1 h-4 w-4 shrink-0 text-up" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <NewsletterForm />
          </div>
          <p className="mt-3 text-footnote text-ink-2">No spam. Unsubscribe at any time.</p>
        </div>
      </div>
    </div>
  );
}
