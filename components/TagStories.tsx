"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/cms-utils-client';
import { Pagination } from '@/components/CMS/CmsComponents';
import StoryCard, { StoryGridSkeleton } from '@/components/StoryCard';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: { name: string; slug: string };
  author: { name: string };
  publishedAt?: string | null;
}

interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface TagStoriesProps {
  slug: string;
  /** Server-rendered first page, so headlines and links are in the HTML. */
  initialTag?: Tag;
  initialPosts?: Post[];
  initialTotal?: number;
}

/** Story grid for a topic (tag). Shared by /tag/[slug] and /blog/tag/[slug]. */
export default function TagStories({ slug, initialTag, initialPosts, initialTotal }: TagStoriesProps) {
  const hasInitial = Boolean(initialTag && initialPosts);
  const [posts, setPosts] = useState<Post[]>(initialPosts ?? []);
  const [tag, setTag] = useState<Tag | null>(initialTag ?? null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found'>(hasInitial ? 'ready' : 'loading');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    total: initialTotal ?? 0,
    page: 1,
    limit: 12,
    pages: initialTotal ? Math.ceil(initialTotal / 12) : 0,
  });

  useEffect(() => {
    // Page 1 came from the server.
    if (hasInitial && page === 1) return;
    let active = true;
    async function load() {
      try {
        setStatus('loading');
        const tagsRes = await fetch('/api/cms/tags');
        const tagsData = await tagsRes.json();
        const foundTag: Tag | undefined = tagsData.data?.find(
          (t: Tag) => t.slug?.toLowerCase().trim() === slug.toLowerCase().trim()
        );
        if (!foundTag) {
          if (active) setStatus('not-found');
          return;
        }
        const params = new URLSearchParams({ page: String(page), limit: '12', tags: foundTag._id, status: 'published' });
        const postsRes = await fetch(`/api/cms/posts?${params}`);
        const postsData = await postsRes.json();
        if (!active) return;
        setTag(foundTag);
        if (postsData.success) {
          setPosts(postsData.data);
          setPagination(postsData.pagination);
        }
        setStatus('ready');
      } catch {
        if (active) setStatus('not-found');
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug, page, hasInitial]);

  if (status === 'not-found') {
    return (
      <div className="site-container px-4 py-20 text-center md:px-6">
        <h1 className="text-title1 text-ink">We couldn’t find that topic</h1>
        <p className="mt-3 text-body text-ink-2">It may have been renamed or removed.</p>
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
        <p className="section-label">Topic</p>
        {tag ? (
          <>
            <h1 className="mt-1 text-title1 text-ink">{tag.name}</h1>
            {tag.description ? <p className="mt-3 max-w-[68ch] text-body text-ink-2">{tag.description}</p> : null}
            <p className="mt-3 text-footnote text-ink-2">
              {pagination.total} {pagination.total === 1 ? 'story' : 'stories'}
            </p>
          </>
        ) : (
          <div className="mt-2 h-9 w-56 animate-pulse rounded bg-fill" aria-hidden="true" />
        )}
      </header>

      {status === 'loading' ? (
        <StoryGridSkeleton count={6} />
      ) : posts.length === 0 ? (
        <p className="text-body text-ink-2">No stories on this topic yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <StoryCard
                key={post._id}
                as="h2"
                href={`/${post.category.slug}/${post.slug}`}
                title={post.title}
                excerpt={post.excerpt}
                image={post.coverImage}
                category={post.category?.name}
                meta={[
                  post.author?.name,
                  post.publishedAt ? formatDate(post.publishedAt) : undefined,
                ].filter(Boolean).join(' · ') || undefined}
              />
            ))}
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(next) => {
              setPage(next);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
}
