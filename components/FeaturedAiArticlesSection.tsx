"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ArticleItem = {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  excerpt?: string;
  publishedAt?: string | null;
  createdAt?: string;
  aiGenerated?: boolean;
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
    month: "short",
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

function stripHtml(value?: string) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

const TITLE_MAX_LENGTH = 60;

function getExcerpt(article: ArticleItem, maxLength = 140) {
  const excerpt = stripHtml(article.excerpt);

  if (!excerpt) {
    return "AI-generated coverage, market context, and fast-moving developments from the global finance cycle.";
  }

  return truncateText(excerpt, maxLength);
}

function getCategoryLabel(article: ArticleItem) {
  return article.category?.name || "AI";
}

export default function FeaturedAiArticlesSection() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let active = true;

    async function fetchArticles() {
      try {
        const response = await fetch("/api/articles?limit=18&sort=-publishedAt", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!active || !data?.success || !Array.isArray(data.data)) {
          return;
        }

        const filtered = data.data
          .filter((item: ArticleItem) => item?.aiGenerated)
          .slice(0, 9);

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

  const featuredSlides = articles.slice(0, 4);
  const featured = featuredSlides[activeIndex] || articles[0];
  const remainingArticles = featured
    ? articles.filter((article) => article._id !== featured._id)
    : articles;
  const latestArticles = remainingArticles.slice(0, 3);
  const mostReadArticles = remainingArticles.slice(3, 7).length > 0
    ? remainingArticles.slice(3, 7)
    : remainingArticles.slice(0, 4);
  const categoryTabs = Array.from(
    new Map(
      articles
        .filter((article) => article.category?.name)
        .map((article) => [
          article.category?.slug || article.category?.name || article._id,
          {
            name: article.category?.name || "AI",
            slug: article.category?.slug,
          },
        ])
    ).values()
  ).slice(0, 3);

  useEffect(() => {
    if (featuredSlides.length <= 1) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((prev) => prev % featuredSlides.length);
  }, [featuredSlides.length]);

  useEffect(() => {
    if (featuredSlides.length <= 1) {
      return;
    }

    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredSlides.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [featuredSlides.length]);

  function handlePrevSlide() {
    if (featuredSlides.length <= 1) {
      return;
    }

    setActiveIndex((prev) => (prev - 1 + featuredSlides.length) % featuredSlides.length);
  }

  function handleNextSlide() {
    if (featuredSlides.length <= 1) {
      return;
    }

    setActiveIndex((prev) => (prev + 1) % featuredSlides.length);
  }

  if (!loading && articles.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#f8f6f2] px-4 py-4 md:px-6 md:py-5 xl:px-8">
      <div className="site-shell">
        <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a7a67]">
              Editorial Layout
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#17130f] sm:text-3xl">
              Featured AI News
            </h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-[26px] border border-[#e9e0d4] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.14fr)_minmax(0,0.96fr)_minmax(280px,0.82fr)] xl:divide-x xl:divide-[#ece5dc]">
            <div className="p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xl font-bold tracking-tight text-[#18130f]">AI Spotlight</h3>
                  <span className="text-[#7e7063]">&rsaquo;</span>
                </div>

                <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.18em] text-[#7c6f64]">
                  {categoryTabs.map((tab) =>
                    tab.slug ? (
                      <Link key={tab.slug} href={`/category/${tab.slug}`} className="transition hover:text-black">
                        {tab.name}
                      </Link>
                    ) : (
                      <span key={tab.name}>{tab.name}</span>
                    )
                  )}
                </div>
              </div>

              {featured ? (
                <article>
                  <div className="relative">
                    <Link href={buildArticleHref(featured)} className="group block">
                      <div className="overflow-hidden rounded-[18px] bg-white">
                        <div className="aspect-[4/3] overflow-hidden bg-white p-2 sm:p-3">
                          <img
                            src={featured.image || "/herobaner.png"}
                            alt={featured.title}
                            className="h-full w-full rounded-[14px] bg-white object-contain transition duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                      </div>
                    </Link>

                    {featuredSlides.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevSlide}
                          className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-xl text-black shadow-[0_8px_24px_rgba(15,23,42,0.16)] transition hover:bg-white"
                          aria-label="Previous featured AI story"
                        >
                          &#8592;
                        </button>
                        <button
                          type="button"
                          onClick={handleNextSlide}
                          className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-xl text-black shadow-[0_8px_24px_rgba(15,23,42,0.16)] transition hover:bg-white"
                          aria-label="Next featured AI story"
                        >
                          &#8594;
                        </button>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-3 text-[11px] text-[#8e8174]">
                    {formatDate(featured.publishedAt || featured.createdAt)}
                  </div>

                  <Link href={buildArticleHref(featured)} className="group mt-2 block">
                    <h4 className="text-[1.9rem] font-black leading-[1.05] tracking-tight text-[#18130f] transition group-hover:text-[#4c1d95]">
                      {truncateText(featured.title, TITLE_MAX_LENGTH)}
                    </h4>
                  </Link>

                  <p className="mt-3 text-[15px] leading-7 text-[#5e5449]">
                    {getExcerpt(featured, 185)}
                  </p>

                  <div className="mt-3">
                    <Link
                      href={buildArticleHref(featured)}
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4338ca] transition hover:text-black"
                    >
                      Continue Reading
                    </Link>
                  </div>

                  {featuredSlides.length > 1 ? (
                    <div className="mt-4 flex items-center gap-2">
                      {featuredSlides.map((article, index) => (
                        <button
                          key={article._id}
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          className={`h-2.5 rounded-full transition ${
                            index === activeIndex
                              ? "w-8 bg-[#18130f]"
                              : "w-2.5 bg-[#d9cec1] hover:bg-[#b9aa99]"
                          }`}
                          aria-label={`Go to featured AI story ${index + 1}`}
                        />
                      ))}
                    </div>
                  ) : null}

                </article>
              ) : (
                <div className="rounded-[18px] border border-dashed border-[#ddd2c5] bg-[#fbf8f4] px-6 py-16 text-center text-sm text-[#796d61]">
                  Loading featured AI stories...
                </div>
              )}
            </div>

            <div className="border-t border-[#ece5dc] p-5 sm:p-6 xl:border-t-0">
              <div className="mb-4 flex items-center gap-1.5">
                <h3 className="text-xl font-bold tracking-tight text-[#18130f]">Latest News</h3>
                <span className="text-[#7e7063]">&rsaquo;</span>
              </div>

              <div className="space-y-5">
                {loading && latestArticles.length === 0 ? (
                  <div className="rounded-[18px] border border-dashed border-[#ddd2c5] bg-[#fbf8f4] px-6 py-12 text-center text-sm text-[#796d61]">
                    Loading latest AI coverage...
                  </div>
                ) : (
                  latestArticles.map((article) => (
                    <article
                      key={article._id}
                      className="border-b border-dashed border-[#e8ded2] pb-5 last:border-b-0 last:pb-0"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] text-[#8b7f72]">
                        <span className="rounded-full bg-[#f4eee6] px-2.5 py-1 font-semibold text-[#3f372f]">
                          {getCategoryLabel(article)}
                        </span>
                        <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                      </div>

                      <Link href={buildArticleHref(article)} className="group block">
                        <h4 className="text-[1.55rem] font-black leading-tight tracking-tight text-[#18130f] transition group-hover:text-[#4c1d95]">
                          {truncateText(article.title, TITLE_MAX_LENGTH)}
                        </h4>
                      </Link>

                      <p className="mt-3 text-sm leading-6 text-[#605549]">
                        {getExcerpt(article, 132)}
                      </p>

                      <div className="mt-3">
                        <Link
                          href={buildArticleHref(article)}
                          className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4338ca] transition hover:text-black"
                        >
                          Continue Reading
                        </Link>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <aside className="border-t border-[#ece5dc] bg-[#fbf8f4] p-5 sm:p-6 xl:border-t-0">
              <div className="mb-4 flex items-center gap-1.5">
                <h3 className="text-xl font-bold tracking-tight text-[#18130f]">Most Read</h3>
                <span className="text-[#7e7063]">&rsaquo;</span>
              </div>

              <div className="space-y-3">
                {loading && mostReadArticles.length === 0 ? (
                  <div className="rounded-[18px] border border-dashed border-[#ddd2c5] bg-white px-6 py-12 text-center text-sm text-[#796d61]">
                    Loading list...
                  </div>
                ) : (
                  mostReadArticles.map((article) => (
                    <article
                      key={article._id}
                      className="grid grid-cols-[minmax(0,1fr)_88px] gap-3 border-b border-[#ece5dc] pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#8b7f72]">
                          <span>{getCategoryLabel(article)}</span>
                          <span className="text-[#b7ac9f]">{formatDate(article.publishedAt || article.createdAt)}</span>
                        </div>

                        <Link href={buildArticleHref(article)} className="group block">
                          <h4 className="line-clamp-3 text-[15px] font-bold leading-6 text-[#18130f] transition group-hover:text-[#4c1d95]">
                            {truncateText(article.title, TITLE_MAX_LENGTH)}
                          </h4>
                        </Link>

                        <div className="mt-2">
                          <Link
                            href={buildArticleHref(article)}
                            className="text-[11px] font-semibold text-[#4338ca] transition hover:text-black"
                          >
                            Continue Reading
                          </Link>
                        </div>
                      </div>

                      <Link
                        href={buildArticleHref(article)}
                        className="group overflow-hidden rounded-[10px] border border-[#e8ded2] bg-white"
                      >
                        <div className="aspect-[1.1/1] overflow-hidden">
                          <img
                            src={article.image || "/herobaner.png"}
                            alt={article.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                          />
                        </div>
                      </Link>
                    </article>
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
