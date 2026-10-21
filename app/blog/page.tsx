'use client';

import React, { useEffect, useId, useState } from 'react';
import { Search } from 'lucide-react';
import { formatDate } from '@/lib/cms-utils-client';
import { Pagination } from '@/components/CMS/CmsComponents';
import StoryCard, { StoryGridSkeleton } from '@/components/StoryCard';
import dynamic from 'next/dynamic';

const MarketSidebar = dynamic(() => import('../components/sidebar/MarketSidebar'), { ssr: false });

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: { name: string; slug: string };
  tags: { name: string; slug: string }[];
  author: { name: string };
  createdAt: string;
  views: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function BlogPage() {
  const searchId = useId();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 12, pages: 0 });
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  // Debounce typing so every keystroke doesn't fire a request.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(input.trim());
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    let active = true;
    async function fetchPosts() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          status: 'published',
        });
        if (search) params.append('search', search);
        const response = await fetch(`/api/cms/posts?${params}`);
        const data = await response.json();
        if (active && data.success) {
          setPosts(data.data);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchPosts();
    return () => {
      active = false;
    };
  }, [pagination.page, pagination.limit, search]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <header className="max-w-3xl">
        <p className="section-label">News</p>
        <h1 className="mt-1 text-title1 text-ink">Latest news and analysis</h1>
        <p className="mt-3 text-title3 font-normal text-ink-2">
          Global markets, stocks, brokers, investing strategy, the economy and geopolitics.
        </p>
        <form role="search" className="relative mt-6 max-w-xl" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor={searchId} className="sr-only">
            Search stories
          </label>
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2" aria-hidden="true" />
          <input
            id={searchId}
            type="search"
            placeholder="Search stories"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="h-11 w-full rounded-control bg-surface pl-10 pr-4 text-body text-ink placeholder:text-ink-3"
          />
        </form>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <p className="sr-only" aria-live="polite">
            {loading ? 'Loading stories' : `${pagination.total} stories`}
          </p>
          {loading ? (
            <StoryGridSkeleton count={6} />
          ) : posts.length === 0 ? (
            <p className="text-body text-ink-2">
              {search ? `No stories match “${search}”.` : 'No stories published yet.'}
            </p>
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
                    category={post.category.name}
                    meta={`${post.author?.name ? `${post.author.name} · ` : ''}${formatDate(post.createdAt)}`}
                  />
                ))}
              </div>
              <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange} />
            </>
          )}

          <section className="mt-16 max-w-3xl border-t border-line-soft pt-6">
            <h2 className="text-headline text-ink">About our coverage</h2>
            <p className="mt-2 text-subhead text-ink-2">
              We publish financial news and analysis on global markets to help investors make informed decisions,
              from daily market updates to deeper looks at economic trends.
            </p>
          </section>
        </div>

        <div className="hidden xl:block">
          <MarketSidebar />
        </div>
      </div>
    </div>
  );
}
