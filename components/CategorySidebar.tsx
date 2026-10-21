"use client";
import React, { useEffect, useState } from 'react';
import SafeImage from '@/components/SafeImage';
import Link from 'next/link';
import { formatDate } from '@/lib/cms-utils-client';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  publishedAt?: string | null;
  author: {
    name: string;
  };
  category: {
    slug: string;
  };
}

interface CategorySidebarProps {
  categorySlug: string;
  currentPostId?: string;
}

/** "Latest" list shown beside category and tag pages. */
export default function CategorySidebar({ currentPostId }: CategorySidebarProps) {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page: '1', limit: '8', status: 'published' });
        const postsRes = await fetch(`/api/cms/posts?${params}`);
        const postsData = await postsRes.json();
        if (postsData.success) {
          const filtered = currentPostId
            ? postsData.data.filter((post: Post) => post._id !== currentPostId)
            : postsData.data;
          setLatestPosts(filtered.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching latest posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, [currentPostId]);

  return (
    <section className="border-t border-line-soft pt-5">
      <h2 className="mb-3 text-headline text-ink">Latest</h2>
      {loading ? (
        <div className="space-y-4" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-fill" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-fill" />
            </div>
          ))}
        </div>
      ) : latestPosts.length === 0 ? (
        <p className="text-subhead text-ink-2">No other stories yet.</p>
      ) : (
        <ul className="space-y-4">
          {latestPosts.map((post) => (
            <li key={post._id}>
              <Link href={`/${post.category.slug}/${post.slug}`} className="group flex gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-control bg-fill">
                  {post.coverImage ? (
                    <SafeImage src={post.coverImage} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-subhead font-semibold text-ink group-hover:underline">{post.title}</p>
                  {post.publishedAt ? <p className="mt-0.5 text-footnote text-ink-2"><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></p> : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
