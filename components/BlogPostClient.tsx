"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/cms-utils-client';
import ShareButtons from '@/components/ShareButtons';
import RelatedPostsCard from '@/components/RelatedPostsCard';
import ArticleSidebar from '@/components/ArticleSidebar';
import LikeCommentSection from '@/components/LikeCommentSection';
import { newsAPI, type NewsArticle } from '@/lib/api/news';
import { sanitizeRichHtml } from '@/lib/sanitizeHtml';

const SITE_URL = 'https://themarketstories.com';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: { name: string; slug?: string; _id?: string };
  category: { _id: string; name: string; slug: string };
  tags: { _id: string; name: string; slug: string }[];
  createdAt: string;
  views: number;
}

interface AIArticle {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  author?: { name?: string; slug?: string };
  category?: { name?: string; slug?: string };
  tags?: string[];
  createdAt: string;
  publishedAt?: string;
}

interface ExternalNews {
  id: string;
  title: string;
  description: string;
  content: string;
  author?: string;
  publishedAt: string;
  category: string;
  source: string;
  url?: string;
  tags?: string[];
}

interface BlogPostClientProps {
  category: string;
  slug: string;
}

/** Every article source is normalised into this shape so they share one layout. */
interface ArticleView {
  title: string;
  excerpt?: string;
  html: string;
  image?: string;
  category: { name: string; href: string } | null;
  author: { name: string; href?: string } | null;
  date: string;
  views?: number;
  tags: { name: string; href?: string }[];
  source?: { name: string; url: string };
  shareUrl: string;
  interactionId?: string;
  excludeSlug?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatAnchorLabel(href: string): string {
  try {
    const url = new URL(href);
    const hostname = url.hostname.replace(/^www\./i, '');
    const pathSegments = url.pathname.split('/').filter(Boolean).slice(0, 2);
    if (pathSegments.length === 0) return hostname;
    return `${hostname}/${pathSegments.join('/')}`;
  } catch {
    return href.replace(/^https?:\/\//i, '');
  }
}

function normalizeAnchorText(html: string): string {
  if (!html) return '';
  return html.replace(
    /<a\b([^>]*)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi,
    (match, beforeHref: string, href: string, afterHref: string, innerHtml: string) => {
      const plainText = innerHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!plainText) return match;
      const normalizedText = plainText.replace(/\/+$/, '');
      const normalizedHref = href.trim().replace(/\/+$/, '');
      const looksLikeRawUrl =
        /^https?:\/\//i.test(plainText) || normalizedText.toLowerCase() === normalizedHref.toLowerCase();
      if (!looksLikeRawUrl) return match;
      const label = escapeHtml(formatAnchorLabel(href));
      return `<a${beforeHref}href="${href}"${afterHref}>${label}</a>`;
    }
  );
}

function normalizeArticleContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return '';
  if (/<\s*\/?\s*[a-z][^>]*>/i.test(trimmed)) return trimmed;

  const blocks = trimmed
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const markdownHeading = block.match(/^(#{1,6})\s+(.+)$/);
      if (markdownHeading) {
        const level = Math.min(Math.max(markdownHeading[1].length, 2), 6);
        return `<h${level}>${escapeHtml(markdownHeading[2].trim())}</h${level}>`;
      }
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length > 1 && lines[0].length <= 90 && !/[.!?]$/.test(lines[0])) {
        const heading = escapeHtml(lines[0]);
        const paragraph = escapeHtml(lines.slice(1).join(' ')).replace(/\n/g, '<br />');
        return `<h2>${heading}</h2><p>${paragraph}</p>`;
      }
      return `<p>${escapeHtml(block).replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
}

function plainText(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

/** The page already has the title as its only H1: drop a repeated title and demote any other H1s. */
function normalizeHeadings(html: string, title: string) {
  const leading = html.match(/^\s*<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
  let result = html;
  if (leading && plainText(leading[1]) === plainText(title)) {
    result = result.slice(leading[0].length);
  }
  return result.replace(/<h1(\s|>)/gi, '<h2$1').replace(/<\/h1>/gi, '</h2>');
}

function prepareHtml(content?: string, title = '') {
  return normalizeHeadings(normalizeAnchorText(sanitizeRichHtml(normalizeArticleContent(content || ''))), title);
}

function readingMinutes(html: string) {
  const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function ArticleSkeleton() {
  return (
    <div className="site-container px-4 py-10 md:px-6" aria-busy="true" aria-label="Loading article">
      <div className="max-w-3xl space-y-4">
        <div className="h-3 w-24 animate-pulse rounded bg-fill" />
        <div className="h-9 w-full animate-pulse rounded bg-fill" />
        <div className="h-9 w-3/4 animate-pulse rounded bg-fill" />
        <div className="h-4 w-48 animate-pulse rounded bg-fill" />
        <div className="mt-8 aspect-video animate-pulse rounded-media bg-fill" />
        <div className="space-y-3 pt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-fill" style={{ width: `${90 - (i % 3) * 12}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArticleLayout({ article, related }: { article: ArticleView; related: Post[] }) {
  const minutes = readingMinutes(article.html);

  return (
    <div className="site-container px-4 py-8 md:px-6 lg:py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-16">
        <article className="min-w-0">
          <header className="max-w-3xl">
            {article.category ? (
              <Link href={article.category.href} className="section-label hover:underline">
                {article.category.name}
              </Link>
            ) : null}
            <h1 className="mt-2 text-title1 text-ink lg:text-[2.5rem] lg:leading-[1.12]">{article.title}</h1>
            {article.excerpt ? (
              <p className="mt-4 text-title3 font-normal text-ink-2">{article.excerpt}</p>
            ) : null}
            <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-footnote text-ink-2">
              {article.author ? (
                article.author.href ? (
                  <Link href={article.author.href} className="font-semibold text-ink hover:underline">
                    {article.author.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">{article.author.name}</span>
                )
              ) : null}
              {article.author ? <span aria-hidden="true">·</span> : null}
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span aria-hidden="true">·</span>
              <span>{minutes} min read</span>
              {typeof article.views === 'number' && article.views > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{article.views.toLocaleString()} views</span>
                </>
              ) : null}
            </p>
          </header>

          {article.image ? (
            <figure className="relative mt-8 aspect-video w-full max-w-4xl overflow-hidden rounded-media bg-fill">
              <Image
                src={article.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 860px"
                priority
              />
            </figure>
          ) : null}

          <div className="article-body mt-8" dangerouslySetInnerHTML={{ __html: article.html }} />

          {article.source ? (
            <p className="mt-2 max-w-3xl text-subhead text-ink-2">
              Source:{' '}
              <a
                href={article.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-tint hover:underline"
              >
                {article.source.name}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </p>
          ) : null}

          <footer className="mt-10 max-w-3xl space-y-8 border-t border-line-soft pt-8">
            {article.tags.length > 0 ? (
              <div>
                <h2 className="sr-only">Topics</h2>
                <ul className="flex flex-wrap gap-2">
                  {article.tags.map((tag) =>
                    tag.href ? (
                      <li key={tag.name}>
                        <Link
                          href={tag.href}
                          className="inline-flex min-h-9 items-center rounded-full bg-surface px-3.5 text-footnote font-medium text-ink hover:bg-fill"
                        >
                          {tag.name}
                        </Link>
                      </li>
                    ) : (
                      <li
                        key={tag.name}
                        className="inline-flex min-h-9 items-center rounded-full bg-surface px-3.5 text-footnote text-ink-2"
                      >
                        {tag.name}
                      </li>
                    )
                  )}
                </ul>
              </div>
            ) : null}

            <ShareButtons title={article.title} url={article.shareUrl} />

            {article.interactionId ? <LikeCommentSection postId={article.interactionId} /> : null}
          </footer>

          <RelatedPostsCard posts={related} />
        </article>

        <ArticleSidebar excludeSlug={article.excludeSlug} />
      </div>
    </div>
  );
}

export default function BlogPostClient({ category, slug }: BlogPostClientProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [aiArticle, setAiArticle] = useState<AIArticle | null>(null);
  const [externalNews, setExternalNews] = useState<ExternalNews | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, slug]);

  const fetchRelatedPosts = async (categorySlug: string, excludeId?: string) => {
    try {
      const response = await fetch(`/api/cms/posts?category=${categorySlug}&status=published&limit=5&sort=-createdAt`);
      const data = await response.json();
      if (data.success) {
        const apiPosts: Post[] = Array.isArray(data.data) ? data.data : [];
        setRelatedPosts(
          apiPosts
            .filter((p) => p._id !== excludeId)
            .slice(0, 4)
            .map((p) => ({
              ...p,
              category: { _id: p.category?._id || '', name: p.category?.name || '', slug: p.category?.slug || '' },
            }))
        );
      }
    } catch {
      // Related stories are optional.
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError('');
      const isNumericSlug = !isNaN(Number(slug)) && slug.trim() !== '';
      if (isNumericSlug) {
        setPost(null);
        setAiArticle(null);
        let found: ExternalNews | null = null;
        const response = await fetch(`/api/external-news/${slug}`);
        const data = await response.json();
        if (data.success && data.data) {
          found = data.data;
        } else {
          found = (await newsAPI.getNewsById(slug)) as ExternalNews | null;
          if (!found) {
            const allNews = await newsAPI.getFinancialNews(category, 50);
            found = (allNews.find((article: NewsArticle) => article.id === slug) as ExternalNews | undefined) ?? null;
          }
        }
        if (found) {
          setExternalNews(found);
          fetchRelatedPosts(slugify(found.category || category));
        } else {
          setError('not-found');
        }
        return;
      }

      setExternalNews(null);
      const response = await fetch(`/api/cms/posts?category=${category}&slug=${slug}&status=published`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setPost(data.data[0]);
        setAiArticle(null);
        fetchRelatedPosts(data.data[0].category.slug, data.data[0]._id);
        return;
      }

      const aiResponse = await fetch(
        `/api/articles?slug=${encodeURIComponent(slug)}&category=${encodeURIComponent(category)}&limit=1`
      );
      const aiData = await aiResponse.json();
      const aiArticleItem = Array.isArray(aiData?.data) ? aiData.data[0] : null;
      if (
        aiResponse.ok &&
        aiData?.success &&
        aiArticleItem &&
        (!aiArticleItem.category?.slug || aiArticleItem.category.slug.toLowerCase() === category.toLowerCase())
      ) {
        setAiArticle(aiArticleItem);
        setPost(null);
        if (aiArticleItem.category?.slug) fetchRelatedPosts(aiArticleItem.category.slug);
      } else {
        setError('not-found');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('failed');
    } finally {
      setLoading(false);
    }
  };

  const view = useMemo<ArticleView | null>(() => {
    if (externalNews) {
      const categorySlug = slugify(externalNews.category || category);
      return {
        title: externalNews.title,
        excerpt: externalNews.description,
        html: prepareHtml(externalNews.content, externalNews.title),
        category: externalNews.category ? { name: externalNews.category, href: `/category/${categorySlug}` } : null,
        author: externalNews.author
          ? { name: externalNews.author, href: `/author/${encodeURIComponent(slugify(externalNews.author))}` }
          : null,
        date: externalNews.publishedAt,
        tags: (externalNews.tags || []).map((name) => ({ name })),
        source: externalNews.url ? { name: externalNews.source || 'Original article', url: externalNews.url } : undefined,
        shareUrl: `${SITE_URL}/${category}/${slug}`,
      };
    }
    if (aiArticle) {
      const categorySlug = aiArticle.category?.slug || category;
      return {
        title: aiArticle.title,
        excerpt: aiArticle.excerpt,
        html: prepareHtml(aiArticle.content, aiArticle.title),
        image: aiArticle.image,
        category: { name: aiArticle.category?.name || categorySlug, href: `/category/${categorySlug}` },
        author: { name: aiArticle.author?.name || 'AI Desk' },
        date: aiArticle.publishedAt || aiArticle.createdAt,
        tags: (aiArticle.tags || []).map((name) => ({ name })),
        shareUrl: `${SITE_URL}/${categorySlug}/${aiArticle.slug}`,
        interactionId: aiArticle._id,
        excludeSlug: aiArticle.slug,
      };
    }
    if (post) {
      return {
        title: post.title,
        excerpt: post.excerpt,
        html: prepareHtml(post.content, post.title),
        image: post.coverImage,
        category: post.category ? { name: post.category.name, href: `/category/${post.category.slug}` } : null,
        author: post.author
          ? {
              name: post.author.name,
              href: post.author.slug ? `/author/${post.author.slug}` : post.author._id ? `/author/${post.author._id}` : undefined,
            }
          : null,
        date: post.createdAt,
        views: post.views,
        tags: (post.tags || []).map((tag) => ({ name: tag.name, href: `/tag/${tag.slug}` })),
        shareUrl: `${SITE_URL}/${post.category.slug}/${post.slug}`,
        interactionId: post._id,
        excludeSlug: post.slug,
      };
    }
    return null;
  }, [externalNews, aiArticle, post, category, slug]);

  if (loading) return <ArticleSkeleton />;

  if (error || !view) {
    const notFound = error !== 'failed';
    return (
      <div className="site-container px-4 py-20 text-center md:px-6">
        <h1 className="text-title1 text-ink">{notFound ? 'We couldn’t find that story' : 'This story didn’t load'}</h1>
        <p className="mx-auto mt-3 max-w-md text-body text-ink-2">
          {notFound
            ? 'It may have moved or been unpublished. The latest news is one tap away.'
            : 'Check your connection and try again.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {notFound ? null : (
            <button
              type="button"
              onClick={fetchPost}
              className="inline-flex h-11 items-center rounded-control bg-ink px-5 text-headline text-canvas"
            >
              Try again
            </button>
          )}
          <Link
            href="/blog"
            className="inline-flex h-11 items-center rounded-control bg-fill px-5 text-headline text-ink hover:bg-fill-2"
          >
            Latest news
          </Link>
        </div>
      </div>
    );
  }

  return <ArticleLayout article={view} related={relatedPosts} />;
}
