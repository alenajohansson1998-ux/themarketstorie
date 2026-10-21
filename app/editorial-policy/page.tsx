import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, webPageSchema } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';
import { CONTACT_EMAIL } from '@/lib/siteConfig';

const TITLE = 'Editorial Policy';
const DESCRIPTION =
  'How The Market Stories handles sourcing, reporting, analysis, AI-assisted content, corrections and sponsored material.';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/editorial-policy',
});

export default function EditorialPolicyPage() {
  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-14">
      <JsonLd data={webPageSchema({ path: '/editorial-policy', name: TITLE, description: DESCRIPTION })} />
      <article className="article-body mx-auto max-w-3xl">
        <p className="section-label">How we work</p>
        <h1 className="mb-8 mt-1 text-title1 text-ink">Editorial policy</h1>

        <p>
          The Market Stories publishes financial news, market analysis and educational material. This policy explains
          the standards we intend our published work to follow. Articles may differ in format and depth; check each
          story for its author, date, sources and any AI-assistance notice.
        </p>

        <h2>Sources and attribution</h2>
        <p>
          When a story relies on public records or data, we aim to link to the underlying material where it is
          available, such as company filings, exchange announcements, regulator releases and official statistics.
          Attribution should make clear which source supports a reported fact. A linked source does not imply its
          endorsement of our reporting or analysis.
        </p>

        <h2>Reporting, analysis and opinion</h2>
        <p>
          News reporting, analysis and opinion serve different purposes. We label opinion content where it appears and
          aim to distinguish reported facts from interpretation, estimates and forecasts. Forecasts are uncertain and
          should not be read as guarantees.
        </p>

        <h2 id="ai">AI-assisted material</h2>
        <p>
          Some articles may be produced with AI assistance and are identified on the article page when that applies.
          AI-generated material can contain errors. Readers should check the cited sources and contact us if they find
          a factual issue.
        </p>

        <h2 id="corrections">Corrections and updates</h2>
        <p>
          If you believe a story contains a factual error, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the article URL, the passage in question and a
          source that supports the correction. We will review the report and update material errors when confirmed.
          Where an update materially changes a story, the article should make that change clear.
        </p>

        <h2>Sponsored material</h2>
        <p>
          Paid placements should be identified so readers can distinguish them from editorial reporting. Advertising
          and partnership enquiries are handled through our <Link href="/advertise">advertising page</Link>.
        </p>

        <h2>Financial information</h2>
        <p>
          Our reporting and educational material is for information only and is not a personal investment
          recommendation. Markets involve risk. Read our full <Link href="/risk-disclosure">risk disclosure</Link>.
        </p>

        <p>For questions about this policy, contact us at {CONTACT_EMAIL}.</p>
      </article>
    </div>
  );
}
