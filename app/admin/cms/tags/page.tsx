'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit } from 'lucide-react';
import { ConfirmDialog } from '@/components/CMS/CmsComponents';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export default function TagsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
  });

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cms/tags');
      const data = await response.json();

      if (data.success) {
        setTags(data.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (tag?: Tag) => {
    if (tag) {
      setEditingId(tag._id);
      setFormData({
        name: tag.name,
        slug: tag.slug,
        description: tag.description || '',
        color: tag.color || '#3B82F6',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        color: '#3B82F6',
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsAdding(true);

      const url = editingId ? `/api/cms/tags/${editingId}` : '/api/cms/tags';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        fetchTags();
        setShowForm(false);
        setFormData({
          name: '',
          slug: '',
          description: '',
          color: '#3B82F6',
        });
      } else {
        alert(result.error || 'Failed to save tag');
      }
    } catch (error) {
      console.error('Error saving tag:', error);
      alert('Failed to save tag');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/cms/tags/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTags(tags.filter((tag) => tag._id !== deleteId));
        setDeleteId(null);
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    } finally {
      setIsDeleting(false);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Tags</h1>
            <p className="text-gray-600 mt-1">Total: {tags.length} tags</p>
          </div>
          <button
            onClick={() => handleAddClick()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add Tag
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Tag' : 'Add Tag'}</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {isAdding ? 'Saving...' : editingId ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Loading tags...
            </div>
          ) : tags.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p>No tags found</p>
              <button
                onClick={() => handleAddClick()}
                className="text-blue-600 hover:underline mt-2"
              >
                Create your first tag
              </button>
            </div>
          ) : (
            tags.map((tag) => (
              <div
                key={tag._id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{ borderColor: tag.color, backgroundColor: tag.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                      <p className="text-xs text-gray-600">{tag.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAddClick(tag)}
                      className="text-blue-600 hover:text-blue-900 p-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(tag._id)}
                      className="text-red-600 hover:text-red-900 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {tag.description && (
                  <p className="text-sm text-gray-600">{tag.description}</p>
                )}
              </div>
            ))
          )}
        </div>

        <ConfirmDialog
          title="Delete Tag"
          message="Are you sure you want to delete this tag? This action cannot be undone."
          isOpen={deleteId !== null}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
