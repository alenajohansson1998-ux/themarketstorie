import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/cms-utils-client";

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: { name: string; slug: string };
  tags: { name: string; slug: string }[];
  author: { name: string };
  createdAt: string;
  views: number;
  readingTime?: number;
}

const StockMarketsCategoryGrid: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "/api/cms/posts?status=published&category=stock-markets&limit=9&sortBy=-createdAt"
        );
        const data = await res.json();
        if (data.success) {
          setPosts(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="w-full mb-8">
        <h2 className="text-2xl font-bold mb-6">Stock Markets Category</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Loading...
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  const featured = posts[0];
  const topGridPosts = posts.slice(1, 5);
  const bottomGridPosts = posts.slice(5, 9);

  return (
    <section className="w-full mb-2">

      <div className="grid grid-cols-1 lg:grid-cols-4 grid-rows-3 gap-4">

        {/* FEATURED POST */}
        <Link
          href={`/${featured.category.slug}/${featured.slug}`}
          className="lg:col-span-2 lg:row-span-2 relative rounded-xl overflow-hidden group"
        >
          {featured.coverImage ? (
            <img
              src={featured.coverImage}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full bg-green-600" />
          )}

          <div className="absolute inset-0 bg-black/55" />

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-sm opacity-90 mb-1">
              {featured.author?.name} • {formatDate(featured.createdAt)}
            </p>
            <h2 className="text-xl font-bold leading-tight line-clamp-2">
              {featured.title}
            </h2>
          </div>
        </Link>

        {/* RIGHT 2x2 GRID */}
        {topGridPosts.map((post) => (
          // ...existing code...
          <Link
            key={post._id}
            href={`/${post.category.slug}/${post.slug}`}
            className="relative rounded-xl overflow-hidden group"
          >
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            ) : (
              <div className="w-full h-full bg-green-600" />
            )}

            <div className="absolute inset-0 bg-black/40" />

            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h3 className="text-sm font-semibold leading-snug line-clamp-2">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}

        {/* LAST ROW */}
        {bottomGridPosts.map((post) => (
          // ...existing code...
          <Link
            key={post._id}
            href={`/${post.category.slug}/${post.slug}`}
            className="relative rounded-xl overflow-hidden group h-42"
          >
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            ) : (
              <div className="w-full h-full bg-green-600" />
            )}

            <div className="absolute inset-0 bg-black/40" />

            <div className="absolute bottom-2 left-2 right-2 text-white">
              <h4 className="text-xs font-medium leading-snug line-clamp-2">
                {post.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>

      {/* VIEW MORE */}
      <div className="mt-1 flex justify-end">
        <Link
          href="/category/stock-markets"
          className="text-green-600 hover:text-green-800 font-medium text-sm"
        >
          View More →
        </Link>
      </div>
    </section>
  );
};

export default StockMarketsCategoryGrid;
