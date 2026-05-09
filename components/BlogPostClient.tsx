"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/cms-utils-client';
import { User, Calendar, FolderOpen, Eye, ExternalLink } from 'lucide-react';
import ShareButtons from '@/components/ShareButtons';
import RelatedPostsCard from '@/components/RelatedPostsCard';
import Image from 'next/image';
import ArticleSidebar from '@/components/ArticleSidebar';
import LikeCommentSection from '@/components/LikeCommentSection';
import { newsAPI, type NewsArticle } from '@/lib/api/news';
import { sanitizeRichHtml } from '@/lib/sanitizeHtml';

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
    const pathSegments = url.pathname
      .split('/')
      .filter(Boolean)
      .slice(0, 2);

    if (pathSegments.length === 0) {
      return hostname;
    }

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
      if (!plainText) {
        return match;
      }

      const normalizedText = plainText.replace(/\/+$/, '');
      const normalizedHref = href.trim().replace(/\/+$/, '');
      const looksLikeRawUrl =
        /^https?:\/\//i.test(plainText) ||
        normalizedText.toLowerCase() === normalizedHref.toLowerCase();

      if (!looksLikeRawUrl) {
        return match;
      }

      const label = escapeHtml(formatAnchorLabel(href));
      return `<a${beforeHref}href="${href}"${afterHref}>${label}</a>`;
    }
  );
}

function normalizeArticleContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return '';

  const hasHtml = /<\s*\/?\s*[a-z][^>]*>/i.test(trimmed);
  if (hasHtml) {
    return trimmed;
  }

  const normalized = trimmed.replace(/\r\n?/g, '\n');
  const blocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const markdownHeading = block.match(/^(#{1,6})\s+(.+)$/);
      if (markdownHeading) {
        const level = Math.min(markdownHeading[1].length, 6);
        return `<h${level}>${escapeHtml(markdownHeading[2].trim())}</h${level}>`;
      }

      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      if (
        lines.length > 1 &&
        lines[0].length <= 90 &&
        !/[.!?]$/.test(lines[0])
      ) {
        const heading = escapeHtml(lines[0]);
        const paragraph = escapeHtml(lines.slice(1).join(' '))
          .replace(/\n/g, '<br />');
        return `<h2>${heading}</h2><p>${paragraph}</p>`;
      }

      const inlineParagraph = escapeHtml(block).replace(/\n/g, '<br />');
      return `<p>${inlineParagraph}</p>`;
    })
    .join('');
}

export default function BlogPostClient({ category, slug }: BlogPostClientProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [aiArticle, setAiArticle] = useState<AIArticle | null>(null);
  const [externalNews, setExternalNews] = useState<ExternalNews | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExternalNews, setIsExternalNews] = useState(false);
  const sanitizedExternalContent = useMemo(
    () => normalizeAnchorText(sanitizeRichHtml(normalizeArticleContent(externalNews?.content || ''))),
    [externalNews?.content]
  );
  const sanitizedPostContent = useMemo(
    () => normalizeAnchorText(sanitizeRichHtml(normalizeArticleContent(post?.content || ''))),
    [post?.content]
  );
  const sanitizedAiArticleContent = useMemo(
    () => normalizeAnchorText(sanitizeRichHtml(normalizeArticleContent(aiArticle?.content || ''))),
    [aiArticle?.content]
  );

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, slug]);

  useEffect(() => {
    if (externalNews) {
      fetchRelatedPosts(externalNews.category);
    }
  }, [externalNews]);



  const fetchPost = async () => {
    try {
      setLoading(true);
      setError("");
      // Check if slug is numeric (external news ID) or text (CMS post slug)
      const isNumericSlug = !isNaN(Number(slug)) && slug.trim() !== '';
      if (isNumericSlug) {
        // This is an external news article
        setIsExternalNews(true);
        setPost(null);
        setAiArticle(null);
        // First try to get from database via API
        try {
          const response = await fetch(`/api/external-news/${slug}`);
          const data = await response.json();
          if (data.success && data.data) {
            setExternalNews(data.data);
          } else {
            // Fallback to direct API call
            const newsArticle = await newsAPI.getNewsById(slug);
            if (newsArticle) {
              setExternalNews(newsArticle);
            } else {
              // Try fetching all news and finding by ID
              const allNews = await newsAPI.getFinancialNews(category, 50);
              const foundNews = allNews.find((article: NewsArticle) => article.id === slug);
              if (foundNews) {
                setExternalNews(foundNews);
              } else {
                setError("News article not found");
              }
            }
          }
        } catch (err) {
          console.error("Error fetching external news:", err);
          setError("Failed to load news article");
        }
      } else {
        // This is a CMS post
        setIsExternalNews(false);
        const response = await fetch(`/api/cms/posts?category=${category}&slug=${slug}&status=published`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setPost(data.data[0]);
          setAiArticle(null);
          fetchRelatedPosts(data.data[0].category.slug, data.data[0]._id);
        } else {
          const aiResponse = await fetch(
            `/api/articles?slug=${encodeURIComponent(slug)}&category=${encodeURIComponent(category)}&limit=1`
          );
          const aiData = await aiResponse.json();
          const aiArticleItem = Array.isArray(aiData?.data) ? aiData.data[0] : null;
          if (
            aiResponse.ok &&
            aiData?.success &&
            aiArticleItem &&
            (!aiArticleItem.category?.slug ||
              aiArticleItem.category.slug.toLowerCase() === category.toLowerCase())
          ) {
            setAiArticle(aiArticleItem);
            setPost(null);
            if (aiArticleItem.category?.slug) {
              fetchRelatedPosts(aiArticleItem.category.slug);
            }
          } else {
            setError("Post not found");
          }
        }
      }
    } catch (err) {
      setError("Failed to load post");
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (categorySlug: string, excludeId?: string) => {
    try {
      const response = await fetch(`/api/cms/posts?category=${categorySlug}&status=published&limit=4&sort=-createdAt`);
      const data = await response.json();
      if (data.success) {
        const apiPosts: Post[] = Array.isArray(data.data) ? data.data : [];
        // Ensure each post's category has _id, name, slug
        const postsWithCategoryId: Post[] = apiPosts
          .filter((p) => p._id !== excludeId)
          .slice(0, 4)
          .map((p) => ({
            ...p,
            category: {
              _id: p.category?._id || '',
              name: p.category?.name || '',
              slug: p.category?.slug || ''
            }
          }));
        setRelatedPosts(postsWithCategoryId);
      }
    } catch {}
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!post && !externalNews && !aiArticle) return null;

  // Render external news article
  if (isExternalNews && externalNews) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10">
            <div className="w-full min-w-0 flex-1">
            <article className="w-full bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
              {/* Render external news content here */}
              <h1 className="text-3xl font-bold mb-4">{externalNews.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                {externalNews.author ? (
                  <Link
                    href={`/author/${encodeURIComponent(
                      (externalNews.author || '').trim().toLowerCase().replace(/\s+/g, '-')
                    )}`}
                    className="inline-flex items-center text-blue-600 hover:underline"
                  >
                    <User className="inline w-4 h-4 mr-1" />{externalNews.author}
                  </Link>
                ) : (
                  <span><User className="inline w-4 h-4 mr-1" />Unknown</span>
                )}
                <span><Calendar className="inline w-4 h-4 mr-1" />{formatDate(externalNews.publishedAt)}</span>
                <Link
                  href={`/category/${encodeURIComponent(
                    (externalNews.category || '').trim().toLowerCase().replace(/\s+/g, '-')
                  )}`}
                  className="inline-flex items-center text-blue-600 hover:underline"
                >
                  <FolderOpen className="inline w-4 h-4 mr-1" />{externalNews.category}
                </Link>
              </div>
              <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: sanitizedExternalContent }} />
              {externalNews.url && (
                <a href={externalNews.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                  <ExternalLink className="w-4 h-4" />Read original
                </a>
              )}
                <div className="border-t pt-6 mt-10">
                  <ShareButtons
                    title={externalNews.title}
                    url={typeof window !== "undefined" ? window.location.href : ""}
                  />
                </div>
            </article>
            </div>
            {/* Sidebar */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <ArticleSidebar />
            </div>
          </div>
          </div>
          <RelatedPostsCard posts={relatedPosts} />
        </main>
      </>
    );
  }

  // Render AI article (new Article model)
  if (aiArticle) {
    const articleCategorySlug = aiArticle.category?.slug || category;
    const articleCategoryName = aiArticle.category?.name || articleCategorySlug;
    const articleTags = Array.isArray(aiArticle.tags) ? aiArticle.tags : [];
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10">

            {/* Article */}
            <div className="w-full min-w-0 flex-1">
              <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-10">
                <div className="mb-3">
                  <Link
                    href={`/category/${articleCategorySlug}`}
                    className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                  >
                    {articleCategoryName}
                  </Link>
                </div>
                <h1 className="mb-5 text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                  {aiArticle.title}
                </h1>
                <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-gray-100 pb-5">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {aiArticle.author?.name || 'AI Desk'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(aiArticle.publishedAt || aiArticle.createdAt)}
                  </span>
                </div>
                {aiArticle.image && (
                  <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                    <Image
                      src={aiArticle.image}
                      alt={aiArticle.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 860px"
                      priority
                    />
                  </div>
                )}
                <div
                  className="blog-content max-w-none mb-8 text-gray-800"
                  dangerouslySetInnerHTML={{ __html: sanitizedAiArticleContent }}
                />
                {articleTags.length > 0 && (
                  <div className="mb-8 flex flex-wrap gap-2 border-t border-gray-100 pt-6">
                    {articleTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs border border-gray-200 px-3 py-1 rounded-full text-gray-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="border-t border-gray-100 pt-6">
                  <ShareButtons
                    title={aiArticle.title}
                    url={`https://themarketstories.com/${articleCategorySlug}/${aiArticle.slug}`}
                  />
                </div>
                <LikeCommentSection postId={aiArticle._id} />
              </article>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <ArticleSidebar excludeSlug={aiArticle.slug} />
            </div>

          </div>
        </div>
      </main>
    );
  }

  // Render CMS post
  if (post) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10">
            <div className="w-full min-w-0 flex-1">
            <article className="w-full min-h-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-10">
              <h1 className="mb-6 text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl lg:mb-8 lg:text-4xl">{post.title}</h1>
              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-500 sm:text-base lg:mb-8">
                {post.author ? (
                  <Link
                    href={post.author.slug ? `/author/${post.author.slug}` : `/author/${post.author._id}`}
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <User className="inline w-5 h-5 mr-2" />{post.author.name}
                  </Link>
                ) : (
                  <span className="flex items-center"><User className="inline w-5 h-5 mr-2" />Unknown</span>
                )}
                <span className="flex items-center"><Calendar className="inline w-5 h-5 mr-2" />{formatDate(post.createdAt)}</span>
                <Link
                  href={`/category/${post.category?.slug}`}
                  className="flex items-center text-blue-600 hover:underline"
                >
                  <FolderOpen className="inline w-5 h-5 mr-2" />{post.category?.name}
                </Link>
                <span className="flex items-center"><Eye className="inline w-5 h-5 mr-2" />{post.views} views</span>
              </div>
              {post.coverImage && (
                <div className="relative w-full aspect-video mb-10 overflow-hidden rounded-2xl border border-gray-200 shadow">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
                    priority
                  />
                </div>
              )}
              <div className="blog-content max-w-none mb-10 text-gray-900" dangerouslySetInnerHTML={{ __html: sanitizedPostContent }} />
              {/* Tags */}
              <div className="mb-12">
                <h4 className="font-semibold mb-3 text-gray-800">Tags:</h4>
                <div className="flex flex-wrap gap-3" style={{ minHeight: '32px' }}>
                  {post.tags.length > 0 ? (
                    post.tags.map((tag) => (
                      <Link key={tag._id} href={`/tag/${tag.slug}`} className="text-xs bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-semibold shadow-sm hover:bg-blue-200 transition">#{tag.name}</Link>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No tags</span>
                  )}
                </div>
              </div>
              <LikeCommentSection postId={post._id} />
                <div className="border-t pt-6 mt-10">
                  <ShareButtons
                    title={post.title}
                    url={`https://themarketstories.com/${post.category.slug}/${post.slug}`}
                  />
                </div>
            </article>
            </div>
            {/* Sidebar */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <ArticleSidebar excludeSlug={post.slug} />
            </div>
          </div>
          </div>
        </main>
      </>
    );
  }
}
