"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import AdminPostForm from '@/components/CMS/AdminPostForm';

// This page will be wrapped by app/editor/layout.tsx for sidebar
export default function EditorEditPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "editor")) {
      router.push("/");
      return;
    }
    if (status === "authenticated" && postId) {
      fetchPost();
    }
  }, [status, session, router, postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/cms/posts/${postId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch post");
      // Only allow editing if the post belongs to the editor
      if (data.data.author._id !== session?.user?.id) {
        setError("You do not have permission to edit this post.");
        return;
      }
      setPost(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch post");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/cms/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Failed to update post');
        return;
      }
      router.push('/editor/posts');
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="w-full mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
      <AdminPostForm initialPost={post} onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
}
