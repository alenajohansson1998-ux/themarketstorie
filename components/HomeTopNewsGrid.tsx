"use client";

import React, { useEffect, useState } from "react";
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
}

function postHref(post: Post) {
  return `/${post.category?.slug}/${post.slug}`;
}

function Meta({ post }: { post: Post }) {
  return (
    <p className="mt-1 text-footnote text-ink-2">
      {post.category?.name}
      {post.category?.name && post.publishedAt ? " · " : null}
      {post.publishedAt ? <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> : null}
    </p>
  );
}

function HeadlineList({ title, posts, loading }: { title: string; posts: Post[]; loading: boolean }) {
  return (
    <div>
      <h3 className="mb-3 text-headline text-ink">{title}</h3>
      {loading ? (
        <div className="space-y-5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-fill" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-fill" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-subhead text-ink-2">No stories yet. Check back soon.</p>
      ) : (
        <ul className="divide-y divide-line-soft">
          {posts.map((post) => (
            <li key={post._id} className="py-3 first:pt-0">
              <Link href={postHref(post)} className="line-clamp-2 text-subhead font-semibold text-ink hover:underline">
                {post.title}
              </Link>
              <Meta post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface HomeTopNewsGridProps {
  /** Server-rendered lists; when present the component does not fetch. */
  initialTrending?: Post[];
  initialLatest?: Post[];
}

const HomeTopNewsGrid: React.FC<HomeTopNewsGridProps> = ({ initialTrending, initialLatest }) => {
  const hasInitial = initialTrending !== undefined && initialLatest !== undefined;
  const [trendingPosts, setTrendingPosts] = useState<Post[]>(initialTrending ?? []);
  const [latestPosts, setLatestPosts] = useState<Post[]>(initialLatest ?? []);
  const [loading, setLoading] = useState(!hasInitial);

  useEffect(() => {
    if (hasInitial) return;
    const fetchTrendingAndLatest = async () => {
      try {
        const [trendingRes, latestRes] = await Promise.all([
          fetch("/api/cms/posts?status=published&trending=true&limit=10&sortBy=-createdAt"),
          fetch("/api/cms/posts?status=published&limit=7&sortBy=-createdAt"),
        ]);
        const [trendingData, latestData] = await Promise.all([trendingRes.json(), latestRes.json()]);
        if (trendingData.success) setTrendingPosts(trendingData.data);
        if (latestData.success) setLatestPosts(latestData.data);
      } catch {
        // Lists fall back to their empty state.
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingAndLatest();
  }, [hasInitial]);

  const featured = trendingPosts[0];
  const gridPosts = trendingPosts.slice(1, 3);
  const moreTrending = trendingPosts.slice(3, 10);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] lg:gap-8">
      <div className="space-y-6">
        {/* Lead story */}
        {featured ? (
          <article className="group relative overflow-hidden rounded-media bg-fill">
            <Link href={postHref(featured)} className="block">
              <div className="relative aspect-16/10 w-full sm:aspect-video">
                {featured.coverImage ? (
                  <SafeImage
                    src={featured.coverImage}
                    alt=""
                    optimized
                    width={1200}
                    height={750}
                    sizes="(max-width: 1023px) 100vw, 55vw"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                  <p className="text-footnote text-white/85">
                    <span className="font-semibold text-white">{featured.category?.name}</span>
                    {featured.category?.name && featured.publishedAt ? " · " : null}
                    {featured.publishedAt ? <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time> : null}
                  </p>
                  <h3 className="mt-1 line-clamp-3 text-title3 text-white sm:text-title2">{featured.title}</h3>
                  {featured.excerpt ? (
                    <p className="mt-2 hidden text-subhead text-white/85 sm:line-clamp-2">{featured.excerpt}</p>
                  ) : null}
                </div>
              </div>
            </Link>
          </article>
        ) : (
          <div className="aspect-16/10 animate-pulse rounded-media bg-fill sm:aspect-video" aria-hidden={loading}>
            {!loading ? <p className="p-6 text-subhead text-ink-2">No trending story right now.</p> : null}
          </div>
        )}

        {gridPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {gridPosts.map((post) => (
              <article key={post._id} className="group">
                <Link href={postHref(post)} className="block" tabIndex={-1} aria-hidden="true">
                  <div className="relative aspect-16/10 overflow-hidden rounded-card bg-fill">
                    {post.coverImage ? (
                      <SafeImage
                        src={post.coverImage}
                        alt=""
                        optimized
                        width={1200}
                        height={750}
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                </Link>
                <h3 className="mt-3 text-headline text-ink">
                  <Link href={postHref(post)} className="line-clamp-2 hover:underline">
                    {post.title}
                  </Link>
                </h3>
                <Meta post={post} />
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <HeadlineList title="Trending" posts={moreTrending} loading={loading} />
      <HeadlineList title="Latest" posts={latestPosts} loading={loading} />
    </div>
  );
};

export default HomeTopNewsGrid;
