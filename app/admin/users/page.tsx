'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Users, UserCheck, UserPlus, Shield, Trash2, Edit, FolderPlus, Folder, Home, User, Settings, Bell, TrendingUp, LogOut } from 'lucide-react';

type UserRole = 'admin' | 'editor' | 'user';
interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string; // Added profile image URL field
  createdAt: string;
  postCredits?: number;
  bio?: string;
  facebook?: string;
  linkedin?: string;
}

interface Stats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentUsers: number;
  googleUsers: number;
  credentialUsers: number;
}


export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Store local edit state for credits
  const [editingCredits, setEditingCredits] = useState<{ [userId: string]: number }>({});
  const pendingCreditChange = useRef<{ userId: string; credits: number } | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  // Store local edit state for image, bio, facebook, linkedin
  const [editingFields, setEditingFields] = useState<{ [userId: string]: { image: string; bio: string; facebook: string; linkedin: string } }>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  // Handle input changes for image, bio, facebook, linkedin
  const handleFieldChange = (userId: string, field: 'image' | 'bio' | 'facebook' | 'linkedin', value: string) => {
    setEditingFields(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }));
  };

  // Start editing for a user
  const startEditingUser = (user: User) => {
    setEditingUserId(user._id);
    setEditingFields(prev => ({
      ...prev,
      [user._id]: {
        image: user.image || '', // Initialize image field
        bio: user.bio || '',
        facebook: user.facebook || '',
        linkedin: user.linkedin || '',
      },
    }));
  };

  // Cancel editing
  const cancelEditingUser = (userId: string) => {
    setEditingUserId(null);
    setEditingFields(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  };

  // Save edited fields
  const saveEditingUser = async (userId: string) => {
    const fields = editingFields[userId];
    if (!fields) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(users.map(u => u._id === userId ? { ...u, ...fields } : u));
        setEditingUserId(null);
        setEditingFields(prev => {
          const copy = { ...prev };
          delete copy[userId];
          return copy;
        });
      } else {
        setError('Failed to update user fields');
      }
    } catch (error) {
      setError('Failed to update user fields');
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchStats();
    fetchUsers();
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

  const updateUserCredits = async (userId: string, credits: number) => {
    try {
      const response = await fetch(`/api/admin/users/credits`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, credits }),
      });
      if (response.ok) {
        setUsers(users.map(user =>
          user._id === userId ? { ...user, postCredits: credits } : user
        ));
      } else {
        setError('Failed to update user credits');
      }
    } catch (error) {
      setError('Failed to update user credits');
    }
  };

  const handleCreditInputChange = (userId: string, credits: number) => {
    setEditingCredits((prev) => ({ ...prev, [userId]: credits }));
  };

  const handleCreditInputBlur = (userId: string) => {
    // Only show modal if the value is different from the original
    const original = users.find(u => u._id === userId)?.postCredits ?? 0;
    const edited = editingCredits[userId];
    if (edited !== undefined && edited !== original) {
      pendingCreditChange.current = { userId, credits: edited };
      setShowCreditModal(true);
    } else {
      // If not changed, just clear local edit state
      setEditingCredits(prev => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    }
  };

  const approveCreditChange = () => {
    if (pendingCreditChange.current) {
      updateUserCredits(pendingCreditChange.current.userId, pendingCreditChange.current.credits);
      setEditingCredits(prev => {
        const copy = { ...prev };
        if (pendingCreditChange.current) delete copy[pendingCreditChange.current.userId];
        return copy;
      });
    }
    setShowCreditModal(false);
    pendingCreditChange.current = null;
  };

  const rejectCreditChange = () => {
    if (pendingCreditChange.current) {
      setEditingCredits(prev => {
        const copy = { ...prev };
        delete copy[pendingCreditChange.current!.userId];
        return copy;
      });
    }
    setShowCreditModal(false);
    pendingCreditChange.current = null;
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
    <div className="min-h-screen bg-gray-50">
      <div className="w-full p-8 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-lg text-gray-600">
            Manage user accounts, roles, and permissions.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="shrink-0">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="shrink-0">
                  <Shield className="h-8 w-8 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Admin Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.adminUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="shrink-0">
                  <UserCheck className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Regular Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.regularUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="shrink-0">
                  <UserPlus className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Recent Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.recentUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">All Users</h3>

            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1100px' }}>
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
                      Post Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facebook
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LinkedIn
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
                          onChange={(e) => updateUserRole(user._id, e.target.value as UserRole)}
                          className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="user">User</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          min={0}
                          value={editingCredits[user._id] !== undefined ? editingCredits[user._id] : user.postCredits ?? 0}
                          onChange={e => handleCreditInputChange(user._id, Number(e.target.value))}
                          onBlur={() => handleCreditInputBlur(user._id)}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </td>
                      {/* Bio */}
                                            {/* Image URL */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[120px] truncate" style={{ maxWidth: 120 }}>
                                              {editingUserId === user._id ? (
                                                <input
                                                  type="text"
                                                  value={editingFields[user._id]?.image ?? user.image ?? ''}
                                                  onChange={e => handleFieldChange(user._id, 'image', e.target.value)}
                                                  className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                                                />
                                              ) : (
                                                <span title={user.image || ''}>{user.image?.length ? user.image.slice(0, 20) + (user.image.length > 20 ? '…' : '') : ''}</span>
                                              )}
                                            </td>
                                            {/* Bio */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[100px] truncate" style={{ maxWidth: 190 }}>
                        {editingUserId === user._id ? (
                          <input
                            type="text"
                            value={editingFields[user._id]?.bio ?? user.bio ?? ''}
                            onChange={e => handleFieldChange(user._id, 'bio', e.target.value)}
                            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                            maxLength={10000}
                          />
                        ) : (
                          <span title={user.bio || ''}>{user.bio?.length ? user.bio.slice(0, 110) + (user.bio.length > 110 ? '…' : '') : ''}</span>
                        )}
                      </td>
                      {/* Facebook */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[120px] truncate" style={{ maxWidth: 120 }}>
                        {editingUserId === user._id ? (
                          <input
                            type="text"
                            value={editingFields[user._id]?.facebook ?? user.facebook ?? ''}
                            onChange={e => handleFieldChange(user._id, 'facebook', e.target.value)}
                            className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          <span title={user.facebook || ''}>{user.facebook?.length ? user.facebook.slice(0, 20) + (user.facebook.length > 20 ? '…' : '') : ''}</span>
                        )}
                      </td>
                      {/* LinkedIn */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[120px] truncate" style={{ maxWidth: 120 }}>
                        {editingUserId === user._id ? (
                          <input
                            type="text"
                            value={editingFields[user._id]?.linkedin ?? user.linkedin ?? ''}
                            onChange={e => handleFieldChange(user._id, 'linkedin', e.target.value)}
                            className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          <span title={user.linkedin || ''}>{user.linkedin?.length ? user.linkedin.slice(0, 20) + (user.linkedin.length > 20 ? '…' : '') : ''}</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                        {editingUserId === user._id ? (
                          <>
                            <button
                              onClick={() => saveEditingUser(user._id)}
                              className="text-green-600 hover:text-green-900 px-2 py-1 border border-green-600 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => cancelEditingUser(user._id)}
                              className="text-gray-600 hover:text-gray-900 px-2 py-1 border border-gray-400 rounded"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditingUser(user)}
                              className="text-blue-600 hover:text-blue-900 px-2 py-1 border border-blue-400 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="text-red-600 hover:text-red-900 px-2 py-1 border border-red-400 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showCreditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Approve Credit Change</h2>
            <p className="mb-6">Are you sure you want to update post credits for this user?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={rejectCreditChange}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Reject
              </button>
              <button
                onClick={approveCreditChange}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
