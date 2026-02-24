'use client';

import React, { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminPostForm from '@/components/CMS/AdminPostForm';

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchPost();
  }, [resolvedParams.id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cms/posts/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.data);
      }
    } catch (err) {
      console.error('Failed to load post:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Post not found</div>
      </div>
    );
  }

  return <AdminPostForm initialPost={post} postId={resolvedParams.id} />;
}
