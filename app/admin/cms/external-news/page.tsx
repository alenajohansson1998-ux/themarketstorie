'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, RefreshCw, Search, Filter, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Pagination, ConfirmDialog } from '@/components/CMS/CmsComponents';

interface ExternalNewsArticle {
  _id: string;
  externalId: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  urlToImage?: string;
  source: string;
  category: string;
  tags: string[];
  url?: string;
  views: number;
  isActive: boolean;
  fetchedAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function ExternalNewsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState<ExternalNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchArticles();
  }, [pagination.page, search, filterCategory, filterSource, filterActive]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      if (search) params.append('search', search);
      if (filterCategory) params.append('category', filterCategory);
      if (filterSource) params.append('source', filterSource);
      if (filterActive !== '') params.append('isActive', filterActive);

      const response = await fetch(`/api/admin/external-news?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching external news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/admin/external-news/sync?limit=20', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        alert(`Sync completed! Created: ${data.stats.created}, Updated: ${data.stats.updated}, Errors: ${data.stats.errors}`);
        fetchArticles();
      } else {
        alert('Sync failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error syncing external news:', error);
      alert('Error syncing external news');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/external-news/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setArticles(articles.map((article) =>
          article._id === id ? { ...article, isActive: !currentStatus } : article
        ));
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/external-news/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArticles(articles.filter((article) => article._id !== deleteId));
        setDeleteId(null);
        fetchArticles();
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  // Get unique categories and sources for filters
  const categories = Array.from(new Set(articles.map((a) => a.category))).sort();
  const sources = Array.from(new Set(articles.map((a) => a.source))).sort();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">External News Articles</h1>
            <p className="text-gray-600 mt-1">Total: {pagination.total} articles</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync from API'}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={filterSource}
              onChange={(e) => {
                setFilterSource(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            <select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading articles...</div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No articles found</p>
              <button
                onClick={handleSync}
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Sync articles from API
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Published
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          {article.urlToImage ? (
                            <img
                              src={article.urlToImage}
                              alt={article.title}
                              className="w-14 h-14 object-cover rounded border"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-14 h-14 rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">{article.title}</p>
                            <p className="text-xs text-gray-500 mt-1">ID: {article.externalId}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {article.source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                          {article.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {article.views}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(article._id, article.isActive)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              article.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                            title={article.isActive ? 'Click to deactivate' : 'Click to activate'}
                          >
                            {article.isActive ? (
                              <span className="flex items-center gap-1">
                                <Eye size={14} /> Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <EyeOff size={14} /> Inactive
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {article.url && (
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900 p-2"
                                title="View Original"
                              >
                                <ExternalLink size={18} />
                              </a>
                            )}
                            <Link
                              href={`/blog/${article.category}/${article.externalId}`}
                              target="_blank"
                              className="text-green-600 hover:text-green-900 p-2"
                              title="View on Site"
                            >
                              <Eye size={18} />
                            </Link>
                            <button
                              onClick={() => setDeleteId(article._id)}
                              className="text-red-600 hover:text-red-900 p-2"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>

        <ConfirmDialog
          title="Delete External News Article"
          message="Are you sure you want to delete this article? This action cannot be undone."
          isOpen={deleteId !== null}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
