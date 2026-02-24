"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Post {
  _id: string;
  title: string;
  slug: string;
  publicationStatus: string;
  createdAt: string;
  publisher: {
    name: string;
    email: string;
  };
  category: string | { name?: string; slug?: string };
  views: number;
}

// This page will be wrapped by app/editor/layout.tsx for sidebar
export default function EditorPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Publication Status");

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "editor")) {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetchPosts();
    }
  }, [status, session, router]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      // For demo, fetch all posts for this editor. Add search and filter params as needed.
      let url = `/api/cms/posts?author=${session?.user?.id}`;
      if (statusFilter !== "All Publication Status") {
        url += `&publicationStatus=${statusFilter.toLowerCase()}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch posts");
      setPosts(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="w-full mx-auto p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Manage Posts</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <span className="text-lg font-bold">+ Create Post</span>
        </button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') fetchPosts(); }}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15Z"/></svg>
          </span>
        </div>
        <select
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option>All Publication Status</option>
          <option>Published</option>
          <option>Draft</option>
          <option>Archived</option>
        </select>
      </div>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publication Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No posts found.</td>
              </tr>
            ) : posts.map((post) => (
              <tr key={post._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 max-w-xs truncate">
                  <a href={`/editor/posts/edit/${post._id}`} className="text-blue-600 hover:underline">{post.title}</a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{typeof post.category === 'object' ? post.category?.name || post.category?.slug : post.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${post.publicationStatus === 'Published' ? 'bg-green-100 text-green-700' : post.publicationStatus === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>
                    {post.publicationStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{post.views ?? 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center flex gap-2 justify-center">
                  <a href={`/editor/posts/edit/${post._id}`} className="text-blue-600 hover:text-blue-800" title="Edit">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M16.475 5.408a2.1 2.1 0 0 1 2.97 2.97l-9.192 9.192a2 2 0 0 1-.878.51l-3.13.89.89-3.13a2 2 0 0 1 .51-.878l9.192-9.192Z"/><path stroke="currentColor" strokeWidth="2" d="M15 7 17 9"/></svg>
                  </a>
                  <a
                    href={`/${typeof post.category === 'object' ? post.category?.slug : post.category}/${post.slug}`}
                    className="text-green-600 hover:text-green-800"
                    title="View Post"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M15 5h4.25A1.75 1.75 0 0 1 21 6.75V11m-9 8H6.75A1.75 1.75 0 0 1 5 17.25V13m12-8-7.5 7.5M21 3l-9 9"/></svg>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
