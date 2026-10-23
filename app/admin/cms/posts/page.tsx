'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Edit, Plus, Search, Check, FileText } from 'lucide-react';
import { Pagination, ConfirmDialog } from '@/components/CMS/CmsComponents';

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

const statusStyles: Record<Post['publicationStatus'], string> = {
  draft: 'border-gray-200 bg-gray-50 text-gray-700',
  pending_review: 'border-amber-200 bg-amber-50 text-amber-800',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  published: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};



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
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Manage Posts</h1>
            <p className="mt-2 text-sm text-gray-500">Review, edit, and publish your stories.</p>
          </div>
          <Link
            href="/admin/cms/posts/create"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <Plus size={18} aria-hidden="true" />
            Create Post
          </Link>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="relative min-w-0">
              <label htmlFor="post-search" className="sr-only">Search posts</label>
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
              <input
                id="post-search"
                type="search"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="min-h-11 w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <select
              aria-label="Filter posts by publication status"
              value={filterPublicationStatus}
              onChange={(e) => {
                setFilterPublicationStatus(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="min-h-11 min-w-0 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700"
            >
              <option value="">All publication statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Posts Table */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-5">
            <h2 className="text-sm font-semibold text-gray-900">All posts</h2>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{pagination.total} posts</span>
          </div>
          {loading ? (
            <div role="status" className="p-12 text-center text-sm text-gray-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="px-4 py-16 text-center text-sm text-gray-500">
              <FileText size={28} className="mx-auto mb-3 text-gray-300" aria-hidden="true" />
              <p className="font-medium text-gray-900">No posts found</p>
              <Link href="/admin/cms/posts/create" className="text-blue-600 hover:underline mt-2 inline-block">
                Create your first post
              </Link>
            </div>
          ) : (
            <>
              <div role="region" aria-label="Posts table" tabIndex={0} className="w-full overflow-x-auto overscroll-x-contain">
                <table className="w-full min-w-[960px] table-fixed">
                  <caption className="sr-only">Posts and their publication status, publisher, category, views, and management actions.</caption>
                  <colgroup>
                    <col className="w-[26%]" /><col className="w-[17%]" /><col className="w-[11%]" />
                    <col className="w-[15%]" /><col className="w-[6%]" /><col className="w-[11%]" /><col className="w-[14%]" />
                  </colgroup>
                  <thead className="border-b border-gray-100 bg-gray-50/80">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Title
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Publisher
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Category
                      </th>
                      
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Views
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post._id} className="transition-colors hover:bg-gray-50/70">
                        <td className="px-4 py-4">
                          <div>
                            <Link href={`/admin/cms/posts/edit/${post._id}`} title={post.title} className="line-clamp-2 break-words text-sm font-medium leading-5 text-gray-900 hover:text-blue-600">
                              {post.title}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          <span className="block truncate" title={post.author?.name}>{post.author?.name || 'Unknown publisher'}</span>
                          {post.author?.email ? (
                            <span className="mt-1 block truncate text-xs text-gray-400" title={post.author.email}>{post.author.email}</span>
                          ) : null}
                        </td>
                        <td className="break-words px-4 py-4 text-sm text-gray-600">
                          {post.category?.name || 'Uncategorized'}
                        </td>

                        <td className="px-3 py-4">
                          {/* Editable Publication Status Dropdown */}
                          <select
                            aria-label={`Publication status for ${post.title}`}
                            className={`min-h-9 w-full rounded-lg border px-2 py-1 text-xs font-medium ${statusStyles[post.publicationStatus]}`}
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
                            <option value="draft">Draft</option>
                            <option value="pending_review">Pending review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="published">Published</option>
                          </select>
                        </td>
                        <td className="px-3 py-4 text-sm tabular-nums text-gray-600">
                          {post.views}
                        </td>
                        <td className="px-3 py-4 text-xs tabular-nums text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            {/* Only allow approve if pending_review */}
                            {post.publicationStatus === 'pending_review' && (
                              <button
                                onClick={() => handleApprove(post._id)}
                                disabled={approvingId === post._id}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                title="Approve"
                                aria-label={`Approve ${post.title}`}
                              >
                                {approvingId === post._id ? '...' : <Check size={16} />}
                              </button>
                            )}
                            <Link
                              href={`/admin/cms/posts/edit/${post._id}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                              title="Edit"
                              aria-label={`Edit ${post.title}`}
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => setDeleteId(post._id)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                              aria-label={`Delete ${post.title}`}
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

              <div className="border-t border-gray-100 px-4 pb-5">
                <p className="pt-4 text-center text-xs text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} posts
                </p>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              </div>
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
