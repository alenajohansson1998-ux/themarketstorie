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
    <section className="border-t border-line-soft pt-5">
      <h2 className="mb-3 text-headline text-ink">{title}</h2>
      {children}
    </section>
  );
}

export default function ArticleSidebar({ excludeSlug }: { excludeSlug?: string }) {
  const [latestPosts, setLatestPosts] = useState<LatestPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loaded, setLoaded] = useState(false);

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
        // The sidebar is optional; sections simply stay hidden.
      } finally {
        setLoaded(true);
      }
    }
    void load();
  }, [excludeSlug]);

  return (
    <aside className="flex w-full flex-col gap-8 lg:sticky lg:top-20 lg:self-start" aria-label="More from TheMarketStories">
      <SidebarSection title="Latest">
        {!loaded ? (
          <div className="space-y-4" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-14 w-16 shrink-0 animate-pulse rounded-control bg-fill" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 w-full animate-pulse rounded bg-fill" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-fill" />
                </div>
              </div>
            ))}
          </div>
        ) : latestPosts.length === 0 ? (
          <p className="text-subhead text-ink-2">No other stories yet.</p>
        ) : (
          <ul className="space-y-4">
            {latestPosts.map((post) => {
              const catSlug = post.category?.slug || post.type || "general";
              const date = post.publishedAt;
              return (
                <li key={post._id}>
                  <Link href={`/${catSlug}/${post.slug}`} className="group flex gap-3">
                    <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-control bg-fill">
                      {post.image && /^https?:\/\//.test(post.image) ? (
                        <Image src={post.image} alt="" fill className="object-cover" sizes="64px" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-subhead font-semibold text-ink group-hover:underline">{post.title}</p>
                      {date ? <p className="mt-0.5 text-footnote text-ink-2"><time dateTime={date}>{formatDate(date)}</time></p> : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </SidebarSection>

      {categories.length > 0 ? (
        <SidebarSection title="Sections">
          <ul>
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="flex min-h-11 items-center justify-between border-b border-line-soft text-subhead text-ink hover:text-tint"
                >
                  {cat.name}
                  <span className="text-ink-3" aria-hidden="true">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SidebarSection>
      ) : null}

      {tags.length > 0 ? (
        <SidebarSection title="Popular topics">
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag._id}>
                <Link
                  href={`/tag/${tag.slug}`}
                  className="inline-flex min-h-9 items-center rounded-full bg-surface px-3 text-footnote text-ink hover:bg-fill"
                >
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        </SidebarSection>
      ) : null}
    </aside>
  );
}
