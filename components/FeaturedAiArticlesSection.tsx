"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ArticleItem = {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  publishedAt?: string | null;
  createdAt?: string;
  category?: {
    name?: string;
    slug?: string;
  } | null;
};

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildArticleHref(article: ArticleItem) {
  const categorySlug = article.category?.slug;
  if (!categorySlug) {
    return `/blog/${article.slug}`;
  }
  return `/${categorySlug}/${article.slug}`;
}

function truncateTitle(value: string, maxLength = 65) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

export default function FeaturedAiArticlesSection() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let active = true;

    async function fetchArticles() {
      try {
        const response = await fetch("/api/articles?limit=12&sort=-publishedAt", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!active || !data?.success || !Array.isArray(data.data)) {
          return;
        }

        const filtered = data.data
          .filter((item: { aiGenerated?: boolean; status?: string }) => item?.aiGenerated)
          .slice(0, 5);

        setArticles(filtered);
        setActiveIndex(0);
      } catch {
        if (active) {
          setArticles([]);
          setActiveIndex(0);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchArticles();

    return () => {
      active = false;
    };
  }, []);

  const featured = articles[activeIndex];
  const sideArticles = articles
    .filter((_, index) => index !== activeIndex)
    .slice(0, 4);

  const totalSlides = articles.length;

  function handlePrev() {
    if (totalSlides <= 1) return;
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }

  function handleNext() {
    if (totalSlides <= 1) return;
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }

  useEffect(() => {
    if (totalSlides <= 1) return;

    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(intervalId);
  }, [totalSlides]);

  if (!loading && articles.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white px-4 py-6 md:px-6 md:py-8 xl:px-8">
      <div className="w-full">
        <h2 className="mb-4 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl md:mb-6 md:text-4xl">
          Featured AI News
        </h2>

        <div className="overflow-hidden rounded-2xl bg-[#101014] md:rounded-[22px] xl:rounded-[26px]">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_380px]">
            <div className="relative min-h-[200px] sm:min-h-[260px] lg:min-h-[360px] xl:min-h-[400px]">
              {featured ? (
                <Link href={buildArticleHref(featured)} className="group block h-full">
                  <div className="absolute inset-0">
                    <img
                      src={featured.image || "/herobaner.png"}
                      alt={featured.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-black/20 via-transparent to-black/10" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
                  </div>

                  <div className="relative flex h-full items-end p-3 sm:p-4 lg:p-7">
                    <div className="w-full max-w-3xl rounded-[14px] bg-white/95 p-3 text-black shadow-xl backdrop-blur sm:max-w-[90%] sm:p-4 lg:rounded-[20px] lg:p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-black/70 sm:gap-3 sm:text-xs md:text-sm">
                        <span className="rounded bg-black px-3 py-1 text-white">
                          {featured.category?.name || "AI Article"}
                        </span>
                        <span>{formatDate(featured.publishedAt || featured.createdAt)}</span>
                      </div>

                      <h3 className="text-xl font-black leading-tight sm:text-2xl lg:text-4xl xl:text-5xl">
                        {truncateTitle(featured.title, 55)}
                      </h3>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex h-full items-center justify-center text-white/70">
                  Loading featured articles...
                </div>
              )}

              {totalSlides > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow transition hover:bg-white"
                    aria-label="Previous featured article"
                  >
                    &#8592;
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow transition hover:bg-white"
                    aria-label="Next featured article"
                  >
                    &#8594;
                  </button>
                </>
              ) : null}
            </div>

            <aside className="flex min-h-[200px] flex-col bg-[#0c0c10] p-4 text-white sm:p-5 lg:p-6 xl:min-h-[360px]">
              <div className="mb-4 border-b border-white/10 pb-4 lg:mb-5">
                <h3 className="text-xl font-light tracking-tight text-white sm:text-2xl lg:text-3xl">
                  AI Market Briefing
                </h3>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1 xl:gap-5 xl:overflow-y-auto xl:pr-1">
                {loading && sideArticles.length === 0 ? (
                  <div className="text-sm text-white/60">Loading list...</div>
                ) : (
                  sideArticles.map((article, index) => (
                    <Link
                      key={article._id}
                      href={buildArticleHref(article)}
                      className="flex items-start gap-3 border-b border-white/8 pb-4 last:border-b-0 last:pb-0 md:pb-5"
                    >
                      <span className="w-7 shrink-0 text-3xl font-extralight leading-none text-white/45 sm:w-8 sm:text-4xl">
                        {index + 2}
                      </span>
                      <div className="min-w-0">
                        <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#ff5e5b] sm:text-xs">
                          {article.category?.name || "AI"}
                        </div>
                        <p className="line-clamp-3 text-sm font-medium leading-snug text-white sm:text-base">
                          {article.title}
                        </p>
                        <p className="mt-2 text-[11px] text-white/50 sm:text-xs">
                          {formatDate(article.publishedAt || article.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
