"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, truncateText } from "@/lib/cms-utils-client";

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
}

const HomeTopNewsGrid: React.FC = () => {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingAndLatest = async () => {
      try {
        setLoading(true);

        const trendingRes = await fetch(
          "/api/cms/posts?status=published&trending=true&limit=10&sortBy=-createdAt"
        );
        const trendingData = await trendingRes.json();
        if (trendingData.success) {
          setTrendingPosts(trendingData.data);
        }

        const latestRes = await fetch(
          "/api/cms/posts?status=published&limit=7&sortBy=-createdAt"
        );
        const latestData = await latestRes.json();
        if (latestData.success) {
          setLatestPosts(latestData.data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingAndLatest();
  }, []);

  const featured = trendingPosts[0];
  const gridPosts = trendingPosts.slice(1, 3);
  const moreTrending = trendingPosts.slice(3, 10);

  return (
    /* HEADER OFFSET FIX */
    <section className="mb-6 w-full px-0 pt-4 sm:pt-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.7fr)_minmax(260px,0.7fr)]">

        {/* LEFT COLUMN */}
        <div className="space-y-4">

          {/* FEATURED POST */}
          <div className="group relative h-[320px] overflow-hidden rounded-lg shadow sm:h-[380px] lg:h-[420px]">
            {featured ? (
              <Link
                href={`/${featured.category?.slug}/${featured.slug}`}
                className="block relative h-full"
              >
                {featured.coverImage ? (
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-600" />
                )}

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                {/* CONTENT */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide mb-2 opacity-90">
                    <span className="bg-white/20 px-2 py-0.5 rounded">
                      {featured.category?.name}
                    </span>
                    <span>{formatDate(featured.createdAt)}</span>
                  </div>

                  <h2 className="text-xl font-bold leading-tight line-clamp-2 mb-2">
                    {featured.title}
                  </h2>

                  <p className="text-sm text-gray-200 line-clamp-3">
                    {truncateText(featured.excerpt || "", 120)}
                  </p>
                </div>
              </Link>
            ) : loading ? (
              <div className="flex items-center justify-center text-gray-400 h-full">
                Loading...
              </div>
            ) : (
              <div className="flex items-center justify-center text-gray-400 h-full">
                No trending post
              </div>
            )}
          </div>

          {/* TWO GRID POSTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gridPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-lg shadow overflow-hidden flex flex-col min-h-[200px]"
              >
                <Link href={`/${post.category?.slug}/${post.slug}`}>
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="object-cover object-center w-full h-40"
                    />
                  ) : (
                    <div className="w-full h-32 bg-linear-to-br from-blue-400 to-blue-600" />
                  )}
                </Link>
                <div className="p-3 flex flex-col flex-1">
                  <Link href={`/${post.category?.slug}/${post.slug}`}>
                    <h3 className="text-sm font-semibold mb-1 leading-tight line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{post.category?.name}</span>
                    <span aria-hidden="true">|</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE COLUMN */}
        <div className="flex min-h-[280px] flex-col rounded-lg bg-white p-4 shadow sm:min-h-[320px]">
          <h3 className="text-lg font-semibold mb-4">Trending Posts</h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Loading...
            </div>
          ) : (
            <ul className="space-y-3">
              {moreTrending.map((post) => (
                <li key={post._id}>
                  <Link
                    href={`/${post.category?.slug}/${post.slug}`}
                    className="font-light text-black"
                  >
                    {truncateText(post.title, 60)}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{post.category?.name}</span>
                    <span aria-hidden="true">|</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex min-h-[280px] flex-col rounded-lg bg-white p-4 shadow sm:min-h-[320px]">
          <h3 className="text-lg font-semibold mb-4">Latest Posts</h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Loading...
            </div>
          ) : (
            <ul className="space-y-3">
              {latestPosts.map((post) => (
                <li key={post._id}>
                  <Link
                    href={`/${post.category?.slug}/${post.slug}`}
                    className="font-light text-black"
                  >
                    {truncateText(post.title, 60)}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{post.category?.name}</span>
                    <span aria-hidden="true">|</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </section>
  );
};

export default HomeTopNewsGrid;
