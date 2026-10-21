"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import SafeImage from '@/components/SafeImage';

type ArticleItem = {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  excerpt?: string;
  publishedAt?: string | null;
  aiGenerated?: boolean;
  category?: {
    name?: string;
    slug?: string;
  } | null;
};

const AUTOPLAY_MS = 6000;

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}

function buildArticleHref(article: ArticleItem) {
  const categorySlug = article.category?.slug;
  return categorySlug ? `/${categorySlug}/${article.slug}` : `/blog/${article.slug}`;
}

function stripHtml(value?: string) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getCategoryLabel(article: ArticleItem) {
  return article.category?.name || "AI desk";
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function SkeletonLines({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-6" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-fill" />
          <div className="h-5 w-full animate-pulse rounded bg-fill" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-fill" />
        </div>
      ))}
    </div>
  );
}

export default function FeaturedAiArticlesSection({ initialArticles }: { initialArticles?: ArticleItem[] }) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles ?? []);
  const [loading, setLoading] = useState(initialArticles === undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (initialArticles !== undefined) return;
    let active = true;

    async function fetchArticles() {
      try {
        const response = await fetch("/api/articles?limit=18&sort=-publishedAt", { cache: "no-store" });
        const data = await response.json();
        if (!active || !data?.success || !Array.isArray(data.data)) return;
        setArticles(data.data.filter((item: ArticleItem) => item?.aiGenerated).slice(0, 9));
        setActiveIndex(0);
      } catch {
        if (active) setArticles([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchArticles();
    return () => {
      active = false;
    };
  }, [initialArticles]);

  const slides = articles.slice(0, 4);
  const slideCount = slides.length;
  const featured = slides[activeIndex % Math.max(slideCount, 1)] || articles[0];
  const remaining = featured ? articles.filter((article) => article._id !== featured._id) : articles;
  const latestArticles = remaining.slice(0, 3);
  const mostReadArticles = remaining.slice(3, 7).length > 0 ? remaining.slice(3, 7) : remaining.slice(0, 4);

  const autoplay = slideCount > 1 && !reducedMotion && !userPaused && !interacting;

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setActiveIndex((prev) => (prev + 1) % slideCount), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [autoplay, slideCount]);

  function go(delta: number) {
    if (slideCount <= 1) return;
    setActiveIndex((prev) => (prev + delta + slideCount) % slideCount);
  }

  if (!loading && articles.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="featured-ai" className="border-t border-line-soft pt-12">
      <div className="mb-6">
        <p className="section-label">AI desk</p>
        <h2 id="featured-ai" className="mt-1 text-title2 text-ink sm:text-title1">
          Featured AI news
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(260px,0.8fr)] xl:gap-0 xl:divide-x xl:divide-line-soft">
        {/* Spotlight carousel */}
        <div
          className="xl:pr-8"
          role="region"
          aria-roledescription="carousel"
          aria-label="AI spotlight"
          onMouseEnter={() => setInteracting(true)}
          onMouseLeave={() => setInteracting(false)}
          onFocus={() => setInteracting(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setInteracting(false);
          }}
        >
          {featured ? (
            <div
              role="group"
              aria-roledescription="slide"
              aria-label={
                slideCount > 1
                  ? `Slide ${(activeIndex % slideCount) + 1} of ${slideCount}: ${featured.title}`
                  : featured.title
              }
              aria-live={autoplay ? "off" : "polite"}
            >
              <article>
              <Link href={buildArticleHref(featured)} className="group block" tabIndex={-1} aria-hidden="true">
                <div className="relative aspect-16/10 overflow-hidden rounded-media bg-fill">
                  <SafeImage
                    src={featured.image || "/herobaner.png"}
                    alt=""
                    optimized
                    width={1200}
                    height={750}
                    sizes="(max-width: 1279px) 100vw, 42vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              </Link>

              <p className="mt-4 text-footnote text-ink-2">
                <span className="font-semibold text-ink">{getCategoryLabel(featured)}</span>
                {" · "}
                {featured.publishedAt ? <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time> : null}
              </p>
              <h3 className="mt-1 text-title2 text-ink">
                <Link href={buildArticleHref(featured)} className="line-clamp-3 hover:underline">
                  {featured.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-body text-ink-2">
                {stripHtml(featured.excerpt) || "AI-generated coverage and market context from the global finance cycle."}
              </p>
              </article>
            </div>
          ) : (
            <div aria-hidden="true">
              <div className="aspect-16/10 animate-pulse rounded-media bg-fill" />
              <div className="mt-4">
                <SkeletonLines rows={1} />
              </div>
            </div>
          )}

          {slideCount > 1 ? (
            <div className="mt-4 flex items-center gap-1">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous story"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-surface"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <div className="flex items-center">
                {slides.map((article, index) => {
                  const current = index === activeIndex % slideCount;
                  return (
                    <button
                      key={article._id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Show story ${index + 1}`}
                      aria-current={current ? "true" : undefined}
                      className="inline-flex h-11 w-7 items-center justify-center"
                    >
                      <span
                        className={`block h-2 rounded-full transition-all ${current ? "w-5 bg-ink" : "w-2 bg-fill-2"}`}
                      />
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next story"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-surface"
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
              {!reducedMotion ? (
                <button
                  type="button"
                  onClick={() => setUserPaused((value) => !value)}
                  aria-pressed={userPaused}
                  aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
                  className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-2 hover:bg-surface hover:text-ink"
                >
                  {userPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Latest */}
        <div className="xl:px-8">
          <h3 className="mb-4 text-headline text-ink">Latest</h3>
          {loading && latestArticles.length === 0 ? (
            <SkeletonLines rows={3} />
          ) : (
            <ul className="divide-y divide-line-soft">
              {latestArticles.map((article) => (
                <li key={article._id} className="py-5 first:pt-0">
                  <p className="text-footnote text-ink-2">
                    <span className="font-semibold text-ink">{getCategoryLabel(article)}</span>
                    {" · "}
                    {article.publishedAt ? <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time> : null}
                  </p>
                  <h4 className="mt-1 text-title3 text-ink">
                    <Link href={buildArticleHref(article)} className="line-clamp-3 hover:underline">
                      {article.title}
                    </Link>
                  </h4>
                  <p className="mt-1.5 line-clamp-2 text-subhead text-ink-2">{stripHtml(article.excerpt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Most read */}
        <aside className="xl:pl-8" aria-labelledby="most-read-ai">
          <h3 id="most-read-ai" className="mb-4 text-headline text-ink">
            Most read
          </h3>
          {loading && mostReadArticles.length === 0 ? (
            <SkeletonLines rows={4} />
          ) : (
            <ol className="divide-y divide-line-soft">
              {mostReadArticles.map((article) => (
                <li key={article._id} className="grid grid-cols-[minmax(0,1fr)_72px] gap-3 py-4 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-caption font-semibold uppercase tracking-wide text-ink-2">
                      {getCategoryLabel(article)}
                    </p>
                    <h4 className="mt-1 text-subhead font-semibold text-ink">
                      <Link href={buildArticleHref(article)} className="line-clamp-3 hover:underline">
                        {article.title}
                      </Link>
                    </h4>
                    {article.publishedAt ? <p className="mt-1 text-footnote text-ink-2"><time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time></p> : null}
                  </div>
                  <div className="relative aspect-square overflow-hidden rounded-control bg-fill">
                    <SafeImage
                      src={article.image || "/herobaner.png"}
                      alt=""
                      optimized
                      width={400}
                      height={400}
                      sizes="72px"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    </section>
  );
}
