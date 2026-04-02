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

interface NewsCategoryGridProps {
  posts: Post[];
}

const NewsCategoryGrid: React.FC<NewsCategoryGridProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <section className="w-full mb-8">
        <h2 className="mb-6 text-2xl font-bold">News Category</h2>
        <div className="flex h-[260px] items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm sm:h-[320px] lg:h-[360px]">
          No news posts available.
        </div>
      </section>
    );
  }
  const featured = posts[0];
  const gridPosts = posts.slice(1, 5 + 1);

  return (
    <section className="w-full mb-8">
      <h2 className="mb-6 text-2xl font-bold">News Category</h2>

      {/* GRID: 40 / 20 / 40 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.7fr)_minmax(0,1fr)]">
        {/* LEFT – FEATURED (40%) */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          {featured ? (
            <>
              <Link
                href={`/${featured.category?.slug}/${featured.slug}`}
                className="relative block h-[260px] w-full sm:h-[320px] lg:h-[360px]"
              >
                {featured.coverImage ? (
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="w-full h-full object-cover absolute inset-0 hover:scale-105 transition-transform duration-300"
                    style={{ zIndex: 0 }}
                  />
                ) : (
                  <div className="w-full h-full absolute inset-0 bg-linear-to-br from-blue-400 to-blue-600" style={{ zIndex: 0 }} />
                )}

                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" style={{ zIndex: 1 }} />

                <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{featured.author?.name}</span>
                    <span>•</span>
                    <span>{formatDate(featured.createdAt)}</span>
                    {featured.readingTime && (
                      <>
                        <span>•</span>
                        <span>{featured.readingTime} min read</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>

              <div className="p-4 sm:p-6">
                <Link
                  href={`/${featured.category?.slug}/${featured.slug}`}
                >
                  <h3 className="text-xl font-bold leading-tight hover:underline sm:text-2xl">
                    {featured.title}
                  </h3>
                </Link>
                {featured.excerpt && (
                  <p className="mt-2 text-gray-600 text-base line-clamp-3">{featured.excerpt}</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-gray-400 sm:h-[320px] lg:h-[360px]">
              Loading...
            </div>
          )}
        </div>

        {/* MIDDLE – NEWS LIST (20%) */}
        <div className="space-y-4">
          {gridPosts.slice(0, 4).map((post, index) => (
            <div
              key={post._id}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                  #{index + 2}
                </div>

                <div className="flex-1">
                  <Link href={`/${post.category?.slug}/${post.slug}`}>
                    <h4 className="font-semibold leading-tight line-clamp-3 hover:underline">
                      {post.title}
                    </h4>
                  </Link>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-3 text-right">
            <Link
              href="/category/news"
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              View More →
            </Link>
          </div>
        </div>

        {/* RIGHT – MANUAL AD (40%) */}
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <div className="bg-white rounded-xl shadow-sm p-4 border">
              <span className="block text-xs text-gray-400 mb-2">
                Advertisement
              </span>

              <a
                href="https://www.phoenixcreativegroup.us/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src="/phoenixcreativegroup.png"
                  alt="Phoenix Creative Group"
                  className="max-w-[300px] w-full mx-auto rounded-lg hover:opacity-90 transition"
                />
              </a>

              <p className="mt-3 text-sm text-gray-600 leading-snug">
                Digital marketing, branding, and web development solutions for
                growing businesses.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default NewsCategoryGrid;
