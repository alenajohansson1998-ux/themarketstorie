"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/cms-utils-client';
import CategorySidebar from '@/components/CategorySidebar';
import SafeImage from '@/components/SafeImage';

interface CategoryClientProps {
  slug: string;
}

interface CategoryPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  createdAt: string;
  author?: { name: string };
}

interface CategoryInfo {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

const PAGE_SIZE = 12;

function readingMinutes(html?: string) {
  if (!html) return null;
  const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  return words > 0 ? Math.max(1, Math.round(words / 230)) : null;
}

function ListSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-5">
          <div className="h-24 w-32 shrink-0 animate-pulse rounded-card bg-fill sm:h-28 sm:w-44" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-5 w-full animate-pulse rounded bg-fill" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-fill" />
            <div className="h-3 w-40 animate-pulse rounded bg-fill" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CategoryClient({ slug }: CategoryClientProps) {
  const [posts, setPosts] = useState<CategoryPost[]>([]);
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  async function fetchPosts(categorySlug: string, pageNumber: number) {
    const params = new URLSearchParams({
      page: String(pageNumber),
      limit: String(PAGE_SIZE),
      category: categorySlug,
      status: 'published',
    });
    const res = await fetch(`/api/cms/posts?${params}`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to load posts');
    return data as { data: CategoryPost[]; pagination: { total: number; pages: number } };
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setStatus('loading');
        const categoriesRes = await fetch('/api/cms/categories');
        const categoriesData = await categoriesRes.json();
        const found: CategoryInfo | undefined = categoriesData.data?.find((cat: CategoryInfo) => cat.slug === slug);
        if (!found) {
          if (active) setStatus('not-found');
          return;
        }
        const result = await fetchPosts(found.slug, 1);
        if (!active) return;
        setCategory(found);
        setPosts(result.data);
        setTotal(result.pagination?.total ?? result.data.length);
        setPages(result.pagination?.pages ?? 1);
        setPage(1);
        setStatus('ready');
      } catch (error) {
        console.error('Error fetching category:', error);
        if (active) setStatus('error');
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  async function loadMore() {
    if (!category) return;
    try {
      setLoadingMore(true);
      const next = page + 1;
      const result = await fetchPosts(category.slug, next);
      setPosts((prev) => [...prev, ...result.data]);
      setPage(next);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }

  if (status === 'not-found' || status === 'error') {
    return (
      <div className="site-container px-4 py-20 text-center md:px-6">
        <h1 className="text-title1 text-ink">
          {status === 'not-found' ? 'We couldn’t find that section' : 'This section didn’t load'}
        </h1>
        <p className="mt-3 text-body text-ink-2">
          {status === 'not-found' ? 'It may have been renamed.' : 'Check your connection and try again.'}
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-flex h-11 items-center rounded-control bg-fill px-5 text-headline text-ink hover:bg-fill-2"
        >
          Latest news
        </Link>
      </div>
    );
  }

  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <header className="mb-10 max-w-3xl">
        <p className="section-label">Section</p>
        {category ? (
          <>
            <h1 className="mt-1 text-title1 text-ink">{category.name}</h1>
            {category.description ? <p className="mt-3 max-w-[68ch] text-body text-ink-2">{category.description}</p> : null}
          </>
        ) : (
          <div className="mt-2 h-9 w-64 animate-pulse rounded bg-fill" aria-hidden="true" />
        )}
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {status === 'loading' ? (
            <ListSkeleton />
          ) : posts.length === 0 ? (
            <p className="text-body text-ink-2">No stories in this section yet.</p>
          ) : (
            <>
              <ul className="divide-y divide-line-soft">
                {posts.map((post) => {
                  const minutes = readingMinutes(post.content);
                  return (
                    <li key={post._id} className="py-6 first:pt-0">
                      <article className="group flex gap-5">
                        <Link
                          href={`/${slug}/${post.slug}`}
                          className="block h-24 w-32 shrink-0 overflow-hidden rounded-card bg-fill sm:h-28 sm:w-44"
                          tabIndex={-1}
                          aria-hidden="true"
                        >
                          {post.coverImage ? (
                            <SafeImage
                              src={post.coverImage}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          ) : null}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-headline text-ink sm:text-title3">
                            <Link href={`/${slug}/${post.slug}`} className="line-clamp-3 hover:underline">
                              {post.title}
                            </Link>
                          </h2>
                          {post.excerpt ? (
                            <p className="mt-1.5 hidden text-subhead text-ink-2 sm:line-clamp-2">{post.excerpt}</p>
                          ) : null}
                          <p className="mt-2 text-footnote text-ink-2">
                            {post.author?.name ? `${post.author.name} · ` : null}
                            {formatDate(post.createdAt)}
                            {minutes ? ` · ${minutes} min read` : null}
                          </p>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-footnote text-ink-2">
                  Showing {posts.length} of {total} stories
                </p>
                {page < pages ? (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex h-11 items-center rounded-control bg-fill px-6 text-headline text-ink hover:bg-fill-2 disabled:opacity-60"
                  >
                    {loadingMore ? 'Loading…' : 'Show more stories'}
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start" aria-label="Latest across TheMarketStories">
          <CategorySidebar categorySlug={slug} />
        </aside>
      </div>
    </div>
  );
}
