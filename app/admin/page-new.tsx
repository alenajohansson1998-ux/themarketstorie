'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, UserCheck, UserPlus, Shield, Trash2, Edit, FolderPlus, Folder, Home, User, Settings, Bell, TrendingUp, LogOut } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchStats();
    fetchUsers();
    fetchCategories();
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

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
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
        setCategories(categories.filter(category => category._id !== categoryId));
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

  if (!session || session.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">Admin only area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white text-black flex flex-col border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          </div>
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                    activeSection === 'dashboard'
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <Home className="h-5 w-5 mr-3" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                    activeSection === 'profile'
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <User className="h-5 w-5 mr-3" />
                  Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('category')}
                  className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                    activeSection === 'category'
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <Folder className="h-5 w-5 mr-3" />
                  Category
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('quick-actions')}
                  className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                    activeSection === 'quick-actions'
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Quick Actions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('recent-activity')}
                  className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                    activeSection === 'recent-activity'
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <Bell className="h-5 w-5 mr-3" />
                  Recent Activity
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('users')}
                  className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                    activeSection === 'users'
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <Users className="h-5 w-5 mr-3" />
                  Users
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('alerts-feed')}
                  className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                    activeSection === 'alerts-feed'
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <TrendingUp className="h-5 w-5 mr-3" />
                  Alerts Feed
                </button>
              </li>
            </ul>
          </nav>
          <div className="px-4 py-6">
            <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black rounded-md w-full">
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {session.user?.name}!</h1>
              <p className="text-lg text-muted">
                Your personal dashboard for market insights and account management.
              </p>
            </div>

            {/* Conditional Content */}
            {activeSection === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-1">
                  <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile</h2>
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">{session.user?.name}</h3>
                      <p className="text-gray-500 mb-4">{session.user?.email}</p>
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        session.user?.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {session.user?.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <Settings className="h-4 w-4 mr-2" />
                          Account Settings
                        </button>
                        <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <Bell className="h-4 w-4 mr-2" />
                          Notification Preferences
                        </button>
                        <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Market Watchlist
                        </button>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Logged in from new device</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-black rounded-full"></div>
                          <span className="text-sm text-gray-600">Updated profile information</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-black rounded-full"></div>
                          <span className="text-sm text-gray-600">Changed password</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alerts Feed */}
                  <div className="bg-white overflow-hidden shadow rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts Feed</h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">Breaking: Tech Stocks Surge Amid AI Optimism</h4>
                            <p className="text-sm text-gray-600 mb-2">Major technology companies report strong quarterly earnings, driving market confidence in AI investments.</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>2 hours ago</span>
                              <button className="text-blue-600 hover:text-blue-800">Read More</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">Federal Reserve Signals Potential Rate Cuts</h4>
                            <p className="text-sm text-gray-600 mb-2">Economic indicators suggest the Fed may reduce interest rates in the coming months to support growth.</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>4 hours ago</span>
                              <button className="text-blue-600 hover:text-blue-800">Read More</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="financial-card p-6 max-w-md">
                <h2 className="text-xl font-semibold text-foreground mb-6">Profile</h2>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-foreground font-bold text-xl">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-medium text-foreground">{session.user?.name}</h3>
                  <p className="text-muted mb-4">{session.user?.email}</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    session.user?.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {session.user?.role}
                  </span>
                </div>
              </div>
            )}

            {activeSection === 'category' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Category Management</h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Fields/Form */}
                    <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create Category</h3>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                            Category Name
                          </label>
                          <input
                            type="text"
                            id="categoryName"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter category name"
                          />
                        </div>

                        <div>
                          <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700">
                            Description (Optional)
                          </label>
                          <input
                            type="text"
                            id="categoryDescription"
                            value={newCategoryDescription}
                            onChange={(e) => setNewCategoryDescription(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter description"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={createCategory}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <FolderPlus className="mr-2 h-4 w-4" />
                            Create Category
                          </button>

                          <button
                            onClick={() => { setNewCategoryName(''); setNewCategoryDescription(''); }}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Categories Table / Content */}
                    <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Categories</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Slug
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((category) => (
                              <tr key={category._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="text"
                                    value={category.name}
                                    onChange={(e) => updateCategory(category._id, e.target.value, category.description || '')}
                                    className="text-sm font-medium text-gray-900 border-none bg-transparent focus:ring-0 focus:outline-none focus:bg-gray-50 px-2 py-1 rounded"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="text"
                                    value={category.description || ''}
                                    onChange={(e) => updateCategory(category._id, category.name, e.target.value)}
                                    className="text-sm text-gray-500 border-none bg-transparent focus:ring-0 focus:outline-none focus:bg-gray-50 px-2 py-1 rounded"
                                    placeholder="No description"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {category.slug}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(category.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => deleteCategory(category._id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'quick-actions' && (
              <div className="financial-card p-6 max-w-md">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full btn-outline flex items-center justify-center gap-2">
                    <Settings className="h-4 w-4" />
                    Account Settings
                  </button>
                  <button className="w-full btn-outline flex items-center justify-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notification Preferences
                  </button>
                  <button className="w-full btn-outline flex items-center justify-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Market Watchlist
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'recent-activity' && (
              <div className="financial-card p-6 max-w-md">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-positive rounded-full"></div>
                    <span className="text-sm text-muted">Logged in from new device</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-muted rounded-full"></div>
                    <span className="text-sm text-muted">Updated profile information</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-muted rounded-full"></div>
                    <span className="text-sm text-muted">Changed password</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'users' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">User Management</h3>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avatar
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                                {user.image ? (
                                  <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
                                ) : (
                                  user.name.charAt(0).toUpperCase()
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user._id, e.target.value as 'admin' | 'user')}
                                className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => deleteUser(user._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'alerts-feed' && (
              <div className="financial-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Alerts Feed</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Breaking: Tech Stocks Surge Amid AI Optimism</h4>
                        <p className="text-sm text-muted mb-2">Major technology companies report strong quarterly earnings, driving market confidence in AI investments.</p>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span>2 hours ago</span>
                          <button className="text-blue-600 hover:text-blue-800">Read More</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Federal Reserve Signals Potential Rate Cuts</h4>
                        <p className="text-sm text-muted mb-2">Economic indicators suggest the Fed may reduce interest rates in the coming months to support growth.</p>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span>4 hours ago</span>
                          <button className="text-blue-600 hover:text-blue-800">Read More</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Oil Prices Reach 6-Month High</h4>
                        <p className="text-sm text-muted mb-2">Global supply concerns push crude oil prices to their highest level since March.</p>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span>6 hours ago</span>
                          <button className="text-blue-600 hover:text-blue-800">Read More</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Cryptocurrency Market Shows Signs of Recovery</h4>
                        <p className="text-sm text-muted mb-2">Bitcoin and major altcoins gain momentum as institutional adoption increases.</p>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span>8 hours ago</span>
                          <button className="text-blue-600 hover:text-blue-800">Read More</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Trade Tensions Escalate Between Major Economies</h4>
                        <p className="text-sm text-muted mb-2">New tariffs announced, potentially impacting global supply chains and market stability.</p>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span>12 hours ago</span>
                          <button className="text-blue-600 hover:text-blue-800">Read More</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
