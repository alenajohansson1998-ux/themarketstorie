import Link from 'next/link';
import SafeImage from '@/components/SafeImage';

export interface StoryCardProps {
  href: string;
  title: string;
  excerpt?: string;
  image?: string;
  category?: string;
  meta?: string;
  /** Heading level for the title, so cards nest correctly under page headings. */
  as?: 'h2' | 'h3';
}

/** The one card used for story grids: image, eyebrow, title, standfirst, byline. */
export default function StoryCard({ href, title, excerpt, image, category, meta, as: Heading = 'h3' }: StoryCardProps) {
  return (
    <article className="group">
      <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
        <div className="aspect-16/10 overflow-hidden rounded-card bg-fill">
          {image ? (
            <SafeImage
              src={image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
        </div>
      </Link>
      {category ? <p className="mt-3 text-footnote font-semibold text-ink">{category}</p> : null}
      <Heading className={`${category ? 'mt-0.5' : 'mt-3'} text-headline text-ink`}>
        <Link href={href} className="line-clamp-3 hover:underline">
          {title}
        </Link>
      </Heading>
      {excerpt ? <p className="mt-1.5 line-clamp-2 text-subhead text-ink-2">{excerpt}</p> : null}
      {meta ? <p className="mt-2 text-footnote text-ink-2">{meta}</p> : null}
    </article>
  );
}

export function StoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="aspect-16/10 animate-pulse rounded-card bg-fill" />
          <div className="mt-3 h-3 w-20 animate-pulse rounded bg-fill" />
          <div className="mt-2 h-5 w-full animate-pulse rounded bg-fill" />
          <div className="mt-1.5 h-5 w-2/3 animate-pulse rounded bg-fill" />
        </div>
      ))}
    </div>
  );
}
