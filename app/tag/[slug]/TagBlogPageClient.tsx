"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/cms-utils-client';
import { Pagination } from '@/components/CMS/CmsComponents';
import { ArrowLeft } from 'lucide-react';

interface TagBlogPageProps {
  slug: string;
}
interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: { name: string; slug: string };
  author: { name: string };
  createdAt: string;
  views: number;
}

interface Tag {
  name: string;
  description?: string;
  color?: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function TagBlogPageClient({ slug }: TagBlogPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  });

  useEffect(() => {
    if (!slug) return;
    fetchTagAndPosts(slug);
  }, [slug, pagination.page]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [slug]);

  const fetchTagAndPosts = async (slug: string) => {
    try {
      setLoading(true);
      const tagsRes = await fetch('/api/cms/tags');
      const tagsData = await tagsRes.json();
      if (!tagsData.data) {
        setTag(null);
        setLoading(false);
        return;
      }
      const foundTag = tagsData.data.find(
        (t: any) => t.slug?.toLowerCase().trim() === slug.toLowerCase().trim()
      );
      if (foundTag) {
        setTag(foundTag);
        const params_obj = new URLSearchParams();
        params_obj.append('page', pagination.page.toString());
        params_obj.append('limit', pagination.limit.toString());
        params_obj.append('tags', foundTag._id);
        params_obj.append('status', 'published');
        const postsRes = await fetch(`/api/cms/posts?${params_obj}`);
        const postsData = await postsRes.json();
        if (postsData.success) {
          setPosts(postsData.data);
          setPagination(postsData.pagination);
        }
      } else {
        setTag(null);
      }
    } catch (error) {
      setTag(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tag Not Found</h1>
          <Link href="/" className="text-blue-600 hover:underline inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-blue-600 hover:underline inline-flex items-center gap-2 mb-4">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            {tag.color && (
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
            )}
            <h1 className="text-4xl font-bold text-gray-900">#{tag.name}</h1>
          </div>
          {tag.description && (
            <p className="text-xl text-gray-600">{tag.description}</p>
          )}
          <p className="text-gray-600 mt-4">
            Showing {posts.length} of {pagination.total} posts
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No posts found with this tag</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/${post.category.slug}/${post.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-600" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{post.author.name}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.pages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
