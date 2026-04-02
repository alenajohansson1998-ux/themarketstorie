'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/cms-utils-client';
import { Pagination } from '@/components/CMS/CmsComponents';
import dynamic from 'next/dynamic';

const MarketSidebar = dynamic(
  () => import('../components/sidebar/MarketSidebar'),
  { ssr: false }
);

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, search]);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      params.append('status', 'published');

      if (search) params.append('search', search);

      const response = await fetch(`/api/cms/posts?${params}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Responsive Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">

        {/* Hero / Intro (unchanged, only spacing improved) */}
        <div className="w-full flex flex-col items-center justify-center py-6 sm:py-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 text-center text-gray-900">
            Global Market Insights, Financial News, and Investment Analysis
          </h1>

          <p className="text-base sm:text-lg text-center max-w-4xl text-gray-600 mb-6">
            Explore expert insights on global markets, stocks, brokers, investing
            strategies, economic trends, and geopolitical developments.
          </p>

          {/* Search */}
          <div className="w-full max-w-xl">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                {/* Search Icon (Heroicons solid, visible color) */}
                <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </div>

        {/* Content + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 py-6">

          {/* Posts Section */}
          <div className="flex-1">
            {loading ? (
              <div className="py-12 text-center text-gray-500">
                Loading posts…
              </div>
            ) : posts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No posts found
              </div>
            ) : (
              <>
                {/* Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
                  {posts.map((post) => (
                    <Link
                      key={post._id}
                      href={`/${post.category.slug}/${post.slug}`}
                      className="group bg-white rounded-xl border border-gray-200 overflow-hidden transition hover:shadow-lg active:scale-[0.98]"
                    >
                      {/* Image */}
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        {post.coverImage && (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {post.category.name}
                          </span>
                          {post.tags.length > 0 && (
                            <span className="text-xs text-gray-500">
                              +{post.tags.length} tags
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-900">
                          {post.title}
                        </h3>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>

                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{post.author.name}</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              </>
            )}

            {/* Static Section */}
            <div className="mt-14 p-6 sm:p-8 bg-white rounded-xl border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">
                About Our Blog
              </h2>
              <p className="text-gray-600 mb-2">
                We share the latest insights, financial news, and expert analysis
                on global markets to help investors make informed decisions.
              </p>
              <p className="text-gray-600">
                Stay ahead with practical strategies, market updates, and deep
                dives into economic trends.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden w-full max-w-[300px] shrink-0 xl:block">
            <MarketSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
