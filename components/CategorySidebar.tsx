"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/cms-utils-client';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  createdAt: string;
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

export default function CategorySidebar({ categorySlug, currentPostId }: CategorySidebarProps) {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setLoading(true);
        const params_obj = new URLSearchParams();
        params_obj.append('page', '1');
        params_obj.append('limit', '8');
        params_obj.append('status', 'published');

        const postsRes = await fetch(`/api/cms/posts?${params_obj}`);
        const postsData = await postsRes.json();

        if (postsData.success) {
          // Filter out current post if we're on a post page
          const filteredPosts = currentPostId
            ? postsData.data.filter((post: Post) => post._id !== currentPostId)
            : postsData.data;
          setLatestPosts(filteredPosts.slice(0, 6)); // Show only 6 latest posts
        }
      } catch (error) {
        console.error('Error fetching latest posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, [currentPostId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-900">Latest Posts</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-bold text-lg mb-4 text-gray-900">Latest Posts</h3>
      <div className="space-y-4">
        {latestPosts.map((post) => (
          <Link
            key={post._id}
            href={`/${post.category.slug}/${post.slug}`}
            className="block group"
          >
            <div className="flex gap-3">
              <div className="shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition">
                  {post.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {formatDate(post.createdAt)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {latestPosts.length === 0 && (
        <p className="text-sm text-gray-500">No posts found in this category.</p>
      )}
    </div>
  );
}
