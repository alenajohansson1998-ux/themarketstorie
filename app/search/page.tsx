"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatDate } from "@/lib/cms-utils-client";

interface ArticleResult {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  category?: { name: string; slug: string };
  author?: { name: string };
  publishedAt?: string;
  createdAt: string;
  type: string;
}

interface PostResult {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category?: { name: string; slug: string };
  author?: { name: string };
  createdAt: string;
}

interface CombinedResult {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  categorySlug: string;
  categoryName: string;
  authorName: string;
  date: string;
  source: "article" | "post";
}

const PAGE_SIZE = 12;

function toResults(articles: ArticleResult[], posts: PostResult[]): CombinedResult[] {
  const fromArticles: CombinedResult[] = articles.map((a) => ({
    _id: a._id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    image: a.image,
    categorySlug: a.category?.slug || a.type || "general",
    categoryName: a.category?.name || a.type || "General",
    authorName: a.author?.name || "AI Desk",
    date: a.publishedAt || a.createdAt,
    source: "article",
  }));

  const fromPosts: CombinedResult[] = posts.map((p) => ({
    _id: p._id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    image: p.coverImage,
    categorySlug: p.category?.slug || "blog",
    categoryName: p.category?.name || "Blog",
    authorName: p.author?.name || "Author",
    date: p.createdAt,
    source: "post",
  }));

  return [...fromArticles, ...fromPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [inputValue, setInputValue] = useState(initialQ);
  const [results, setResults] = useState<CombinedResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    setInputValue(q);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const offset = (page - 1) * PAGE_SIZE;

    async function run() {
      try {
        const [articleRes, postRes] = await Promise.all([
          fetch(
            `/api/articles?search=${encodeURIComponent(query)}&status=published&limit=${PAGE_SIZE}&page=${page}`,
            { signal: controller.signal }
          ),
          fetch(
            `/api/cms/posts?search=${encodeURIComponent(query)}&status=published&limit=${PAGE_SIZE}&page=${page}`,
            { signal: controller.signal }
          ),
        ]);

        const [articleData, postData] = await Promise.all([
          articleRes.json().catch(() => ({ data: [], pagination: { total: 0 } })),
          postRes.json().catch(() => ({ data: [], pagination: { total: 0 } })),
        ]);

        if (controller.signal.aborted) return;

        const articles: ArticleResult[] = Array.isArray(articleData.data) ? articleData.data : [];
        const posts: PostResult[] = Array.isArray(postData.data) ? postData.data : [];
        const combined = toResults(articles, posts);

        setResults(combined);
        setTotal(
          (articleData.pagination?.total || 0) + (postData.pagination?.total || 0)
        );
      } catch {
        // aborted or network error — ignore
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="site-container px-4 md:px-6 xl:px-8 py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Search</h1>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search articles, topics, markets…"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Search
        </button>
      </form>

      {query && !loading && (
        <p className="mb-4 text-sm text-slate-500">
          {total > 0 ? `${total} result${total !== 1 ? "s" : ""} for "${query}"` : `No results for "${query}"`}
        </p>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 h-40 rounded-lg bg-slate-200" />
              <div className="mb-2 h-4 rounded bg-slate-200" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <Link
              key={item._id}
              href={`/${item.categorySlug}/${item.slug}`}
              className="group rounded-xl border border-slate-200 bg-white transition hover:shadow-md"
            >
              {item.image && /^https?:\/\//.test(item.image) && (
                <div className="overflow-hidden rounded-t-xl">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-44 w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-4">
                <span className="mb-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {item.categoryName}
                </span>
                <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                  {item.title}
                </h2>
                {item.excerpt && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.excerpt}</p>
                )}
                <p className="mt-2 text-[11px] text-slate-400">
                  {item.authorName} · {formatDate(item.date)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !query && (
        <p className="text-sm text-slate-500">Enter a keyword above to search all articles.</p>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
