'use client';
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Users, UserCheck, UserPlus, Shield, Trash2, Edit, FolderPlus, Folder, Home, User, Settings, Bell, TrendingUp, LogOut } from 'lucide-react';

type UserRole = 'admin' | 'editor' | 'user';
interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentUsers: number;
  googleUsers: number;
  credentialUsers: number;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [postsCount, setPostsCount] = useState<number>(0);
  const [contactRequestsCount, setContactRequestsCount] = useState<number>(0);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Category management state
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  // Fetch contact requests count
  const fetchContactRequestsCount = async () => {
    try {
      const response = await fetch('/api/contact');
      if (response.ok) {
        const data = await response.json();
        setContactRequestsCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error('Error fetching contact requests:', error);
    }
  };

  // Fetch recent posts
  const fetchRecentPosts = async () => {
    try {
      const response = await fetch('/api/cms/posts?sortBy=-createdAt&limit=5');
      if (response.ok) {
        const data = await response.json();
        setRecentPosts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }
  };

  // Fetch recent contacts
  const fetchRecentContacts = async () => {
    try {
      const response = await fetch('/api/contact');
      if (response.ok) {
        const data = await response.json();
        setRecentContacts(Array.isArray(data) ? data.slice(0, 5) : []);
      }
    } catch (error) {
      console.error('Error fetching recent contacts:', error);
    }
  };

  // Fetch total posts count for dashboard card
  const fetchPostsCount = async () => {
    try {
      const response = await fetch('/api/cms/posts?limit=1');
      if (response.ok) {
        const data = await response.json();
        setPostsCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching posts count:', error);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'editor')) {
      router.push('/');
      return;
    }

    fetchStats();
    fetchUsers();
    fetchPostsCount();
    fetchContactRequestsCount();
    fetchRecentPosts();
    fetchRecentContacts();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setUsers(users.map(user =>
          user._id === userId ? { ...user, role: newRole } : user
        ));
        fetchStats(); // Refresh stats
      } else {
        setError('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user role');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId));
        fetchStats(); // Refresh stats
      } else {
        setError('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim(),
        }),
      });

      if (response.ok) {
        setNewCategoryName('');
        setNewCategoryDescription('');
        fetchCategories(); // Refresh categories
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Failed to create category');
    }
  };

  const updateCategory = async (categoryId: string, name: string, description: string) => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      if (response.ok) {
        fetchCategories(); // Refresh categories
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter((category: Category) => category._id !== categoryId));
      } else {
        setError('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    }
  };

  if (status === 'loading' || loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    return (
    <div className="w-full p-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-lg text-muted">Welcome back! Here's an overview of your platform.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">TOTAL USERS</span>
            <UserCheck className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.totalUsers ?? 0}</div>
          <div className="text-xs text-gray-500 mt-2">Registered users</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">TOTAL POSTS</span>
            <Folder className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{postsCount}</div>
          <div className="text-xs text-gray-500 mt-2">Total posts published</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">CONTACT REQUESTS</span>
            <Bell className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{contactRequestsCount}</div>
          <div className="text-xs text-gray-500 mt-2">Total contact requests</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">ACTIONS</span>
            <Edit className="w-5 h-5 text-purple-500" />
          </div>
          <Link href="/admin/cms/posts/create" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition">Create Post</Link>
          <div className="text-xs text-gray-500 mt-2">Add new blog post</div>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {/* Show up to 5 recent activities, scrollable if more */}
              {[
                 ...users.slice(-5).reverse().map((user) => ({
                  type: 'user',
                  key: user._id,
                  content: (
                    <div key={user._id} className="flex items-center gap-3 bg-blue-50 rounded-lg px-4 py-2">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">New user:</span>
                      <span>{user.name}</span>
                      <span className="ml-auto text-xs text-gray-500">{new Date(user.createdAt).toLocaleString()}</span>
                    </div>
                  ),
                  date: new Date(user.createdAt).getTime(),
                })),
                ...recentPosts.slice(-5).reverse().map((post) => ({
                  type: 'post',
                  key: post._id,
                  content: (
                    <div key={post._id} className="flex items-center gap-3 bg-orange-50 rounded-lg px-4 py-2">
                      <FolderPlus className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">New post:</span>
                      <span>{post.title}</span>
                      <span className="ml-auto text-xs text-gray-500">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</span>
                    </div>
                  ),
                  date: post.createdAt ? new Date(post.createdAt).getTime() : 0,
                })),
                ...recentContacts.slice(-5).reverse().map((req) => ({
                  type: 'contact',
                  key: req._id,
                  content: (
                    <div key={req._id} className="flex items-center gap-3 bg-green-50 rounded-lg px-4 py-2">
                      <Bell className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Contact request:</span>
                      <span>{req.name}</span>
                      <span className="ml-auto text-xs text-gray-500">{req.createdAt ? new Date(req.createdAt).toLocaleString() : ''}</span>
                    </div>
                  ),
                  date: req.createdAt ? new Date(req.createdAt).getTime() : 0,
                })),
              ]
                .sort((a, b) => b.date - a.date)
                .slice(0, 5)
                .map((item) => item.content)}
            </div>
        </div>
        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link href="/admin/cms/posts/create" className="block bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold px-4 py-3 rounded-lg">Create Post</Link>
            <Link href="/admin/users" className="block bg-green-100 hover:bg-green-200 text-green-900 font-semibold px-4 py-3 rounded-lg">Manage Users</Link>
            <Link href="/admin/contact-requests" className="block bg-purple-100 hover:bg-purple-200 text-purple-900 font-semibold px-4 py-3 rounded-lg">View Contact Requests</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
