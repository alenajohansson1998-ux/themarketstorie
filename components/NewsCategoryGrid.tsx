import React from "react";
import Link from "next/link";
import { formatDate } from "@/lib/cms-utils-client";
import SafeImage from '@/components/SafeImage';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: { name: string; slug: string };
  tags: { name: string; slug: string }[];
  author: { name: string };
  publishedAt?: string | null;
  views: number;
  readingTime?: number;
}

interface NewsCategoryGridProps {
  posts: Post[];
  loading?: boolean;
}

const NewsCategoryGrid: React.FC<NewsCategoryGridProps> = ({ posts, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]" aria-hidden="true">
        <div className="aspect-16/10 animate-pulse rounded-media bg-fill" />
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-fill" />
          ))}
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return <p className="text-body text-ink-2">No news stories yet. Check back soon.</p>;
  }

  const [featured, ...rest] = posts;
  const listPosts = rest.slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_300px]">
      <article className="group">
        <Link href={`/${featured.category?.slug}/${featured.slug}`} className="block" tabIndex={-1} aria-hidden="true">
          <div className="relative aspect-16/10 overflow-hidden rounded-media bg-fill">
            {featured.coverImage ? (
              <SafeImage
                src={featured.coverImage}
                alt=""
                optimized
                width={1200}
                height={750}
                sizes="(max-width: 1279px) 100vw, 42vw"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : null}
          </div>
        </Link>
        <p className="mt-4 text-footnote text-ink-2">
          {featured.author?.name}
          {featured.author?.name && featured.publishedAt ? " · " : null}
          {featured.publishedAt ? <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time> : null}
          {featured.readingTime ? ` · ${featured.readingTime} min read` : null}
        </p>
        <h3 className="mt-1 text-title2 text-ink">
          <Link href={`/${featured.category?.slug}/${featured.slug}`} className="hover:underline">
            {featured.title}
          </Link>
        </h3>
        {featured.excerpt ? <p className="mt-2 line-clamp-3 text-body text-ink-2">{featured.excerpt}</p> : null}
      </article>

      <div>
        <ol className="divide-y divide-line-soft">
          {listPosts.map((post, index) => (
            <li key={post._id} className="flex gap-4 py-4 first:pt-0">
              <span className="w-6 shrink-0 text-title3 font-semibold tabular-nums text-ink-3" aria-hidden="true">
                {index + 2}
              </span>
              <div className="min-w-0">
                <h3 className="text-headline text-ink">
                  <Link href={`/${post.category?.slug}/${post.slug}`} className="line-clamp-3 hover:underline">
                    {post.title}
                  </Link>
                </h3>
                {post.publishedAt ? <p className="mt-1 text-footnote text-ink-2"><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></p> : null}
              </div>
            </li>
          ))}
        </ol>
        <Link
          href="/category/news"
          className="mt-2 inline-flex min-h-11 items-center text-subhead font-medium text-tint hover:underline"
        >
          More news
        </Link>
      </div>

      <aside className="hidden xl:block" aria-label="Advertisement">
        <div className="sticky top-20 rounded-card bg-surface p-4">
          <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-2">Advertisement</p>
          <a href="https://www.phoenixcreativegroup.us/" target="_blank" rel="noopener noreferrer sponsored" className="block">
            <SafeImage
              src="/phoenixcreativegroup.png"
              alt="Phoenix Creative Group"
              optimized
              width={1024}
              height={1536}
              sizes="300px"
              className="mx-auto h-auto w-full max-w-[300px] rounded-control"
            />
          </a>
          <p className="mt-3 text-footnote text-ink-2">
            Digital marketing, branding and web development for growing businesses.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default NewsCategoryGrid;
