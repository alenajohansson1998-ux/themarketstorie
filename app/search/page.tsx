"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { formatDate } from "@/lib/cms-utils-client";
import StoryCard, { StoryGridSkeleton } from "@/components/StoryCard";

interface ArticleResult {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  category?: { name: string; slug: string };
  author?: { name: string };
  publishedAt?: string | null;
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
  publishedAt?: string | null;
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
  date?: string | null;
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
    date: a.publishedAt,
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
    date: p.publishedAt,
    source: "post",
  }));

  return [...fromArticles, ...fromPosts].sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<CombinedResult[]>([]);
  const [resultQuery, setResultQuery] = useState("");
  const [resultPage, setResultPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

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
        setResultQuery(query);
        setResultPage(page);
        setTotal(
          (articleData.pagination?.total || 0) + (postData.pagination?.total || 0)
        );
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setResultQuery(query);
          setResultPage(page);
          setTotal(0);
        }
      }
    }

    void run();
    return () => controller.abort();
  }, [query, page]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const trimmed = String(formData.get("q") || "").trim();
    if (!trimmed) return;
    setPage(1);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  const visibleResults = resultQuery === query ? results : [];
  const visibleTotal = resultQuery === query ? total : 0;
  const isLoading = Boolean(query) && (resultQuery !== query || resultPage !== page);
  const totalPages = Math.ceil(visibleTotal / PAGE_SIZE);

  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <h1 className="text-title1 text-ink">Search</h1>

      <form key={query} role="search" onSubmit={handleSubmit} className="mt-5 flex max-w-2xl gap-2">
        <div className="relative flex-1">
          <label htmlFor="search-query" className="sr-only">
            Search articles, topics and markets
          </label>
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2" aria-hidden="true" />
          <input
            id="search-query"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search articles, topics and markets"
            className="h-11 w-full rounded-control bg-surface pl-10 pr-4 text-body text-ink placeholder:text-ink-3"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-control bg-ink px-5 text-headline text-canvas hover:opacity-85"
        >
          Search
        </button>
      </form>

      <p className="mt-6 mb-6 text-subhead text-ink-2" aria-live="polite">
        {!query
          ? "Enter a word or phrase to search every story."
          : isLoading
            ? "Searching…"
            : visibleTotal > 0
              ? `${visibleTotal} result${visibleTotal !== 1 ? "s" : ""} for “${query}”`
              : `No results for “${query}”. Try a shorter or different phrase.`}
      </p>

      {isLoading ? <StoryGridSkeleton count={6} /> : null}

      {!isLoading && visibleResults.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visibleResults.map((item) => (
            <StoryCard
              key={item._id}
              as="h2"
              href={`/${item.categorySlug}/${item.slug}`}
              title={item.title}
              excerpt={item.excerpt}
              image={item.image && /^https?:\/\//.test(item.image) ? item.image : undefined}
              category={item.categoryName}
              meta={[item.authorName, item.date ? formatDate(item.date) : undefined].filter(Boolean).join(' · ') || undefined}
            />
          ))}
        </div>
      ) : null}

      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex h-11 items-center rounded-control px-4 text-subhead font-medium text-ink hover:bg-fill disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-subhead text-ink-2">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex h-11 items-center rounded-control px-4 text-subhead font-medium text-ink hover:bg-fill disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
