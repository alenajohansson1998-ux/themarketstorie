"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/cms-utils-client';
import { Pagination } from '@/components/CMS/CmsComponents';
import { ArrowLeft, User } from 'lucide-react';
import CategorySidebar from '@/components/CategorySidebar';

interface CategoryClientProps {
  slug: string;
}

export default function CategoryClient({ slug }: CategoryClientProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  });

  useEffect(() => {
    const fetchCategoryAndPosts = async () => {
      try {
        setLoading(true);
        const categoriesRes = await fetch('/api/cms/categories');
        const categoriesData = await categoriesRes.json();
        const foundCategory = categoriesData.data?.find((cat: any) => cat.slug === slug);
        if (foundCategory) {
          setCategory(foundCategory);
          const params_obj = new URLSearchParams();
          params_obj.append('page', pagination.page.toString());
          params_obj.append('limit', pagination.limit.toString());
          params_obj.append('category', foundCategory.slug);
          params_obj.append('status', 'published');
          const postsRes = await fetch(`/api/cms/posts?${params_obj}`);
          const postsData = await postsRes.json();
          if (postsData.success) {
            setPosts(postsData.data);
            setPagination(postsData.pagination);
          }
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryAndPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, pagination.page]);

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-xl text-gray-600">Loading...</div></div>;
  }

  if (!category) {
    return <div className="min-h-screen bg-gray-50"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center"><h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1><Link href="/" className="text-blue-600 hover:underline inline-flex items-center gap-2"><ArrowLeft size={16} />Back to Home</Link></div></div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <Link href="/" className="text-blue-600 hover:underline inline-flex items-center gap-2 mb-4">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-xl text-gray-600">{category.description}</p>
            )}
            <p className="text-gray-600 mt-4">
              Showing {posts.length} of {pagination.total} posts
            </p>
          </div>

          {/* Two Column Layout */}
          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No posts found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Posts List */}
              <div className="lg:col-span-2 space-y-6">
                {posts.map((post, index) => (
                  <React.Fragment key={post._id}>
                    <Link
                      href={`/${category.slug}/${post.slug}`}
                      className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group"
                    >
                      <div className="flex gap-4 p-6">
                        {/* Thumbnail */}
                        <div className="shrink-0 w-32 h-24 bg-gray-200 rounded-lg overflow-hidden">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          ) : (
                            <div className="w-full h-full from-blue-400 to-blue-600" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3" />
                              </div>
                              <span>{post.author.name}</span>
                            </div>
                            <span>{formatDate(post.createdAt)}</span>
                            <span>5 min read</span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Advertisement Placeholder */}
                    {(index + 1) % 3 === 0 && index < posts.length - 1 && (
                      <div className="bg-gray-100 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                        <span className="text-gray-500 font-medium">ADVERTISEMENT</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}

                {/* Load More Button */}
                {pagination.pages > 1 && pagination.page < pagination.pages && (
                  <div className="text-center pt-8">
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Load More Articles
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <CategorySidebar categorySlug={slug} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
