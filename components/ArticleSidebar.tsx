"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/cms-utils-client";

interface LatestPost {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  category?: { name: string; slug: string };
  publishedAt?: string;
  createdAt: string;
  type?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Tag {
  _id: string;
  name: string;
  slug: string;
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function ArticleSidebar({ excludeSlug }: { excludeSlug?: string }) {
  const [latestPosts, setLatestPosts] = useState<LatestPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
          fetch("/api/articles?status=published&limit=6&sort=-publishedAt", { cache: "no-store" }),
          fetch("/api/cms/categories?includeParent=false&limit=12", { cache: "no-store" }),
          fetch("/api/cms/tags?limit=20", { cache: "no-store" }),
        ]);

        const [articlesData, categoriesData, tagsData] = await Promise.all([
          articlesRes.json().catch(() => ({ data: [] })),
          categoriesRes.json().catch(() => ({ data: [] })),
          tagsRes.json().catch(() => ({ data: [] })),
        ]);

        const articles: LatestPost[] = Array.isArray(articlesData.data)
          ? articlesData.data.filter((a: LatestPost) => a.slug !== excludeSlug)
          : [];
        setLatestPosts(articles.slice(0, 5));
        setCategories(Array.isArray(categoriesData.data) ? categoriesData.data : []);
        setTags(Array.isArray(tagsData.data) ? tagsData.data : []);
      } catch {
        // silently fail — sidebar is non-critical
      }
    }
    void load();
  }, [excludeSlug]);

  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-24 w-full">

      {/* Latest Posts */}
      <SidebarSection title="Latest Posts">
        {latestPosts.length === 0 ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-16 h-14 rounded-lg bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {latestPosts.map((post) => {
              const catSlug = post.category?.slug || post.type || "general";
              const postUrl = `/${catSlug}/${post.slug}`;
              const date = post.publishedAt || post.createdAt;
              return (
                <Link
                  key={post._id}
                  href={postUrl}
                  className="flex gap-3 group"
                >
                  <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    {post.image && /^https?:\/\//.test(post.image) ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-300 text-lg font-bold">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(date)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </SidebarSection>

      {/* Categories */}
      <SidebarSection title="Categories">
        {categories.length === 0 ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-600 transition-colors" />
                    {cat.name}
                  </span>
                  <span className="text-gray-300 group-hover:text-blue-400 text-xs">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SidebarSection>

      {/* Popular Tags */}
      <SidebarSection title="Popular Tags">
        {tags.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag._id}
                href={`/tag/${tag.slug}`}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </SidebarSection>

    </aside>
  );
}
