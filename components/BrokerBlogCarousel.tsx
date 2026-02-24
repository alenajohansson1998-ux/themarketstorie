
'use client';
import BlogCarousel from "@/components/BlogCarousel";
import { useBrokerCategoryPosts } from "@/lib/useBrokerCategoryPosts";

export function BrokerBlogCarousel() {
  const { posts: blogPosts, isLoading: blogLoading } = useBrokerCategoryPosts();
  if (blogLoading) return <div className="text-center text-gray-500 py-8">Loading related blog posts…</div>;
  if (!blogPosts?.length) return null;
  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold mb-6 text-black dark:text-white text-center">Related Blog Posts</h2>
      <BlogCarousel
        posts={blogPosts.map((p: import("@/models/Post").IPost) => ({ ...p, url: `/brokers/${p.slug}` }))}
      />
    </div>
  );
}
