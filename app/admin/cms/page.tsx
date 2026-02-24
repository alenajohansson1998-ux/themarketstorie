'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Tag, FolderOpen, Users, BarChart3, Newspaper } from 'lucide-react';

interface DashboardStats {
  totalPosts: number;
  draftPosts: number;
  publishedPosts: number;
  totalCategories: number;
  totalTags: number;
}

export default function CmsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    draftPosts: 0,
    publishedPosts: 0,
    totalCategories: 0,
    totalTags: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [postsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/cms/posts?limit=1'),
        fetch('/api/cms/categories'),
        fetch('/api/cms/tags'),
      ]);

      const postsData = await postsRes.json();
      const categoriesData = await categoriesRes.json();
      const tagsData = await tagsRes.json();

      const draftCount = await fetch('/api/cms/posts?status=draft&limit=1').then((res) =>
        res.json()
      );
      const publishedCount = await fetch('/api/cms/posts?status=published&limit=1').then(
        (res) => res.json()
      );

      setStats({
        totalPosts: postsData.pagination?.total || 0,
        draftPosts: draftCount.pagination?.total || 0,
        publishedPosts: publishedCount.pagination?.total || 0,
        totalCategories: categoriesData.data?.length || 0,
        totalTags: tagsData.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
    </div>
  );

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CMS Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {session?.user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={FileText}
            label="Total Posts"
            value={stats.totalPosts}
            color="border-blue-500"
          />
          <StatCard
            icon={FileText}
            label="Published Posts"
            value={stats.publishedPosts}
            color="border-green-500"
          />
          <StatCard
            icon={FileText}
            label="Draft Posts"
            value={stats.draftPosts}
            color="border-yellow-500"
          />
          <StatCard
            icon={FolderOpen}
            label="Categories"
            value={stats.totalCategories}
            color="border-purple-500"
          />
          <StatCard
            icon={Tag}
            label="Tags"
            value={stats.totalTags}
            color="border-pink-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/cms/posts/create"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <FileText className="text-blue-600" />
              <span className="font-semibold">Create Post</span>
            </Link>
            <Link
              href="/admin/cms/posts"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-gray-500 hover:bg-gray-50 transition"
            >
              <FileText className="text-gray-600" />
              <span className="font-semibold">Manage Posts</span>
            </Link>
            <Link
              href="/admin/cms/categories"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition"
            >
              <FolderOpen className="text-purple-600" />
              <span className="font-semibold">Manage Categories</span>
            </Link>
            <Link
              href="/admin/cms/tags"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-pink-200 hover:border-pink-500 hover:bg-pink-50 transition"
            >
              <Tag className="text-pink-600" />
              <span className="font-semibold">Manage Tags</span>
            </Link>
            <Link
              href="/admin/cms/external-news"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-orange-200 hover:border-orange-500 hover:bg-orange-50 transition"
            >
              <Newspaper className="text-orange-600" />
              <span className="font-semibold">External News</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Recent activity will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
