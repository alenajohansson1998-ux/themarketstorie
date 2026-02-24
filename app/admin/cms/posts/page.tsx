'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Edit, Plus, Search, Filter } from 'lucide-react';
import { Pagination, StatusBadge, ConfirmDialog } from '@/components/CMS/CmsComponents';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publicationStatus: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published';
  category: { name: string; slug: string };
  author: { name: string; email?: string };
  createdAt: string;
  publishedAt?: string;
  views: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}



export default function PostsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [search, setSearch] = useState('');
  // Removed payment status filter
  const [filterPublicationStatus, setFilterPublicationStatus] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, search, filterPublicationStatus]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      if (search) params.append('search', search);
      // Removed paymentStatus param
      if (filterPublicationStatus) params.append('publicationStatus', filterPublicationStatus);

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

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/cms/posts/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter((post) => post._id !== deleteId));
        setDeleteId(null);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const handleApprove = async (postId: string) => {
    try {
      setApprovingId(postId);
      const response = await fetch(`/api/cms/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicationStatus: 'published' }),
      });

      if (response.ok) {
        // Update the post publication status in the local state
        setPosts(posts.map(post =>
          post._id === postId ? { ...post, publicationStatus: 'published' as const, publishedAt: new Date().toISOString() } : post
        ));
      } else {
        console.error('Failed to approve post');
      }
    } catch (error) {
      console.error('Error approving post:', error);
    } finally {
      setApprovingId(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full p-8 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Posts</h1>
            <p className="text-gray-600 mt-1">Total: {pagination.total} posts</p>
          </div>
          <Link
            href="/admin/cms/posts/create"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Create Post
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterPublicationStatus}
              onChange={(e) => {
                setFilterPublicationStatus(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Publication Status</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No posts found</p>
              <Link href="/admin/cms/posts/create" className="text-blue-600 hover:underline mt-2 inline-block">
                Create your first post
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Publisher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Publication Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {post.title.length > 60 ? post.title.slice(0, 60) + '…' : post.title}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {post.author?.name}
                          {post.author?.email ? (
                            <span className="block text-xs text-gray-400">{post.author.email}</span>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {post.category.name}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {/* Editable Publication Status Dropdown */}
                          <select
                            className="px-2 py-1 rounded border text-xs font-semibold"
                            value={post.publicationStatus}
                            onChange={async (e) => {
                              const newStatus = e.target.value as Post['publicationStatus'];
                              // Optimistically update UI
                              setPosts(posts.map(p => p._id === post._id ? { ...p, publicationStatus: newStatus } : p));
                              try {
                                await fetch(`/api/cms/posts/${post._id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ publicationStatus: newStatus }),
                                });
                              } catch (err) {
                                // Revert on error
                                setPosts(posts);
                                alert('Failed to update status');
                              }
                            }}
                          >
                            <option value="draft">📝 Draft</option>
                            <option value="pending_review">🟡 Pending Review</option>
                            <option value="approved">🟢 Approved</option>
                            <option value="rejected">⛔ Rejected</option>
                            <option value="published">✅ Published</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {post.views}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {/* Only allow approve if pending_review */}
                            {post.publicationStatus === 'pending_review' && (
                              <button
                                onClick={() => handleApprove(post._id)}
                                disabled={approvingId === post._id}
                                className="text-green-600 hover:text-green-900 p-2 disabled:opacity-50"
                                title="Approve"
                              >
                                {approvingId === post._id ? '...' : '✓'}
                              </button>
                            )}
                            <Link
                              href={`/admin/cms/posts/edit/${post._id}`}
                              className="text-blue-600 hover:text-blue-900 p-2"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => setDeleteId(post._id)}
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
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          isOpen={deleteId !== null}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
