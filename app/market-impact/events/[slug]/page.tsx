import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, BookOpen, ChevronRight, Clock3, FileText, GitBranch, Info, Radar } from 'lucide-react';
import ImpactMap from '@/components/market-impact/ImpactMap';
import ObservedReaction from '@/components/market-impact/ObservedReaction';
import { getRadarEvent } from '@/lib/market-impact/server';
import { pageMetadata } from '@/lib/seo/metadata';
import radar from '@/components/market-impact/Radar.module.css';
import styles from '../../Research.module.css';

const readEvent = cache(getRadarEvent);
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await readEvent(slug);
  return pageMetadata({
    title: event ? `${event.title} — Market Impact Radar` : 'Event unavailable — Market Impact Radar',
    description: event?.summary || 'Sourced market coverage and conditional economic connections from The Market Stories.',
    path: `/market-impact/events/${encodeURIComponent(slug)}`,
    // Automated, unreviewed headline analyses should not become indexable financial articles.
    noindex: true,
    type: 'article',
  });
}

function publicationTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Publication time unavailable';
  return `${new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(date)} IST`;
}

export default async function MarketImpactEventPage({ params }: Props) {
  const { slug } = await params;
  const event = await readEvent(slug);
  if (!event) notFound();
  const publisherCount = new Set(event.sources.map(source => source.publisher.toLowerCase())).size;
  const metrics = [
    { title: 'Event significance', value: event.significance, explanation: 'Category and number of matched channels' },
    { title: 'Evidence confidence', value: event.evidenceConfidence, explanation: 'Source type and distinct publishers' },
    { title: 'Impact uncertainty', value: event.uncertainty, explanation: 'Higher means more uncertainty' },
  ];

  return (
    <div className={radar.radar}>
      <div className={`${radar.shell} ${styles.shell}`}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/markets"><Radar size={13} aria-hidden="true" /> Market Impact Radar</Link>
          <ChevronRight size={11} aria-hidden="true" /><span>Event research</span>
        </nav>

        <header className={styles.eventHeader}>
          <div className={styles.metadata}><span className={radar.category}>{event.category.replace(/-/g, ' ')}</span><span>{event.region}</span><span>{event.assetClasses.join(' / ')}</span></div>
          <h1>{event.title}</h1>
          <div className={styles.publication}><Clock3 size={12} aria-hidden="true" /><time dateTime={event.publishedAt}>{publicationTime(event.publishedAt)}</time><span>·</span><span>{event.sources.length} {event.sources.length === 1 ? 'source' : 'sources'} / {publisherCount} {publisherCount === 1 ? 'publisher' : 'publishers'}</span></div>
          <div className={styles.researchNote}><Info size={15} aria-hidden="true" /><p>Automated rules-based research · This analysis has not received event-specific editorial review. Source reports and conditional economic interpretations are separated below.</p></div>
        </header>

        <div className={styles.topGrid}>
          <section className={`${radar.panel} ${styles.contentPanel}`} aria-labelledby="reported-event">
            <div className={styles.sectionEyebrow}><FileText size={13} aria-hidden="true" /> SOURCE REPORT</div>
            <h2 id="reported-event">What the source reports</h2>
            <p>{event.summary}</p>
            <div className={styles.reportContext}>
              <p><strong>Report published:</strong> {publicationTime(event.publishedAt)}</p>
              <p><strong>Event occurred:</strong> {event.eventOccurredAt ? publicationTime(event.eventOccurredAt) : 'Time not independently verified. Publication time is not the event time; reaction percentages remain uncomputed.'}</p>
              <p><strong>Verification:</strong> Source attribution is available below. The report’s claims have not been independently confirmed by this tool.</p>
            </div>
            {event.coverageUrl && <Link className={radar.textLink} href={event.coverageUrl}>Read The Market Stories coverage <ArrowUpRight size={12} aria-hidden="true" /></Link>}
          </section>
          <section className={`${radar.panel} ${styles.contentPanel}`} aria-labelledby="research-interpretation">
            <div className={styles.sectionEyebrow}><GitBranch size={13} aria-hidden="true" /> RESEARCH INTERPRETATION</div>
            <h2 id="research-interpretation">Why it could matter</h2>
            <p>{event.whyItMatters}</p>
            <div className={styles.assessment}>
              {metrics.map(metric => <div key={metric.title}><div><span>{metric.title}</span><strong>{metric.value}<small>/100</small></strong></div><div className={styles.assessmentTrack}><span style={{ width: `${Math.max(0, Math.min(100, metric.value))}%` }} /></div><p>{metric.explanation}</p></div>)}
            </div>
            <Link href="/market-impact/methodology" className={radar.textLink}>How these scores are calculated <ArrowUpRight size={12} aria-hidden="true" /></Link>
          </section>
        </div>

        <div className={styles.network}><ImpactMap event={event} /></div>

        {event.entities.length > 0 && <section className={`${radar.panel} ${styles.contentPanel}`} aria-labelledby="named-entities"><h2 id="named-entities">Entities in context</h2><p>A name in the source is an entity mention. It does not, by itself, establish a supplier, competitor, or causal relationship.</p><div className={styles.entityList}>{event.entities.map(entity => <div key={entity.id}><strong>{entity.name}{entity.symbol && <span>{entity.symbol}</span>}</strong><p>{entity.description}</p></div>)}</div></section>}

        <div className={styles.network}><ObservedReaction event={event} /></div>

        <div className={styles.topGrid}>
          <section className={`${radar.panel} ${styles.contentPanel}`} aria-labelledby="watch-next"><div className={styles.sectionEyebrow}><Radar size={13} aria-hidden="true" /> FOLLOW THE DEVELOPMENT</div><h2 id="watch-next">What to watch next</h2><ul className={styles.researchList}>{event.whatToWatch.map((item, index) => <li key={index}>{item}</li>)}</ul><p className={styles.smallPrint}>These are research checkpoints. No future announcement date is implied.</p></section>
          <section className={`${radar.panel} ${styles.contentPanel}`} aria-labelledby="alternative-scenarios"><div className={styles.sectionEyebrow}><GitBranch size={13} aria-hidden="true" /> KEEP AN OPEN QUESTION</div><h2 id="alternative-scenarios">Alternative scenarios</h2><ul className={styles.researchList}>{event.alternativeScenarios.map((item, index) => <li key={index}>{item}</li>)}</ul></section>
        </div>

        <section className={`${radar.panel} ${styles.contentPanel}`} aria-labelledby="source-evidence">
          <div className={styles.sectionEyebrow}><BookOpen size={13} aria-hidden="true" /> TRACE THE REPORT</div><h2 id="source-evidence">Sources &amp; publication times</h2><p>These links attribute the event report. References inside the impact network explain general economic mechanisms; they do not verify this specific event.</p>
          <ol className={styles.sourceList}>{event.sources.map((source, index) => <li key={source.id}><span className={styles.sourceNumber}>{String(index + 1).padStart(2, '0')}</span><div><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ArrowUpRight size={13} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a><p>{source.publisher} <span>·</span> {source.type === 'official' ? 'Official source' : source.type === 'editorial' ? 'Published editorial coverage' : 'Provider-supplied reporting'} <span>·</span> <time dateTime={source.publishedAt}>{publicationTime(source.publishedAt)}</time></p></div></li>)}</ol>
        </section>

        <section className={`${radar.panel} ${styles.contentPanel}`} aria-labelledby="evidence-limits"><div className={styles.sectionEyebrow}><Info size={13} aria-hidden="true" /> READ WITH CONTEXT</div><h2 id="evidence-limits">Evidence &amp; limitations</h2><ul className={styles.researchList}>{event.evidenceLimitations.map((item, index) => <li key={index}>{item}</li>)}</ul></section>

        <footer className={radar.footer}><Link href="/markets" className={radar.textLink}><ArrowLeft size={12} aria-hidden="true" /> Back to Market Impact Radar</Link><Link href="/market-impact/methodology">Sources, scoring &amp; methodology</Link><span>Research information. No personalized investment advice.</span></footer>
      </div>
    </div>
  );
}
