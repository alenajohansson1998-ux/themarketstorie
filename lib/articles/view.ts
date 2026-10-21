import { sanitizeRichHtml } from '@/lib/sanitizeHtml';

/** Everything the article template needs, whichever collection the story came from. */
export interface ArticleView {
  kind: 'cms' | 'ai' | 'external';
  path: string;
  title: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  html: string;
  wordCount: number;
  image?: string;
  category: { name: string; slug: string; href: string } | null;
  author: { name: string; href?: string; bio?: string; image?: string; isAi?: boolean } | null;
  datePublished?: string;
  dateModified?: string;
  views?: number;
  tags: { name: string; href?: string }[];
  source?: { name: string; url: string };
  interactionId?: string;
  excludeSlug?: string;
  isOpinion: boolean;
  aiGenerated: boolean;
  /** Syndicated third-party stories are kept out of the index. */
  noindex: boolean;
}

export const OPINION_CATEGORY_SLUG = 'analysis--opinion';

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
    return pathSegments.length === 0 ? hostname : `${hostname}/${pathSegments.join('/')}`;
  } catch {
    return href.replace(/^https?:\/\//i, '');
  }
}

/** Replaces raw-URL link text with a readable "site.com/path" label. */
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
      return `<a${beforeHref}href="${href}"${afterHref}>${escapeHtml(formatAnchorLabel(href))}</a>`;
    }
  );
}

/** Turns plain-text or Markdown-ish content into HTML paragraphs and headings. */
function normalizeArticleContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return '';
  if (/<\s*\/?\s*[a-z][^>]*>/i.test(trimmed)) return trimmed;

  return trimmed
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const markdownHeading = block.match(/^(#{1,6})\s+(.+)$/);
      if (markdownHeading) {
        const level = Math.min(Math.max(markdownHeading[1].length, 2), 6);
        return `<h${level}>${escapeHtml(markdownHeading[2].trim())}</h${level}>`;
      }
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length > 1 && lines[0].length <= 90 && !/[.!?]$/.test(lines[0])) {
        return `<h2>${escapeHtml(lines[0])}</h2><p>${escapeHtml(lines.slice(1).join(' '))}</p>`;
      }
      return `<p>${escapeHtml(block).replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
}

function plainText(html: string) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** The page already shows the title as its only H1: drop a repeated title and demote any other H1s. */
function normalizeHeadings(html: string, title: string) {
  const leading = html.match(/^\s*<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
  let result = html;
  if (leading && plainText(leading[1]) === plainText(title)) {
    result = result.slice(leading[0].length);
  }
  return result.replace(/<h1(\s|>)/gi, '<h2$1').replace(/<\/h1>/gi, '</h2>');
}

/** Source links in article bodies open in a new tab without handing the source our window. */
function hardenExternalLinks(html: string) {
  return html.replace(/<a\b([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi, (match, before: string, href: string, after: string) => {
    if (/themarketstories\.com/i.test(href)) return match;
    const attrs = `${before}${after}`.replace(/\s(rel|target)="[^"]*"/gi, '');
    return `<a${attrs} href="${href}" target="_blank" rel="noopener noreferrer">`;
  });
}

export function prepareArticleHtml(content: string | undefined, title = ''): string {
  return hardenExternalLinks(
    normalizeHeadings(normalizeAnchorText(sanitizeRichHtml(normalizeArticleContent(content || ''))), title)
  );
}

export function countWords(html: string): number {
  return html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 230));
}

export function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

type Doc = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function nonEmpty(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function httpsImage(value: unknown): string | undefined {
  return typeof value === 'string' && /^https:\/\//i.test(value) ? value : undefined;
}

/** Builds the view for a CMS post, AI desk article or syndicated external story. */
export function buildArticleView(kind: ArticleView['kind'], doc: Doc, requestedCategory: string): ArticleView {
  if (kind === 'external') {
    const categorySlug = slugify(doc.category || requestedCategory);
    const html = prepareArticleHtml(doc.content, doc.title);
    return {
      kind,
      path: `/${requestedCategory}/${doc.externalId ?? doc.id}`,
      title: doc.title,
      excerpt: nonEmpty(doc.description),
      html,
      wordCount: countWords(html),
      category: doc.category ? { name: doc.category, slug: categorySlug, href: `/category/${categorySlug}` } : null,
      author: doc.author ? { name: doc.author } : null,
      datePublished: doc.publishedAt,
      dateModified: doc.updatedAt,
      tags: (doc.tags || []).map((name: string) => ({ name })),
      source: doc.url ? { name: doc.source || 'Original article', url: doc.url } : undefined,
      isOpinion: false,
      aiGenerated: false,
      noindex: true,
    };
  }

  const category = doc.category?.slug
    ? { name: doc.category.name || doc.category.slug, slug: doc.category.slug, href: `/category/${doc.category.slug}` }
    : null;
  const categorySlug = category?.slug || requestedCategory;
  const html = prepareArticleHtml(doc.content, doc.title);
  const seo = doc.seo || {};

  if (kind === 'ai') {
    const isAiAuthor = doc.author?.role === 'ai';
    return {
      kind,
      path: `/${categorySlug}/${doc.slug}`,
      title: doc.title,
      excerpt: nonEmpty(doc.excerpt),
      metaTitle: nonEmpty(seo.metaTitle),
      metaDescription: nonEmpty(seo.metaDescription),
      html,
      wordCount: countWords(html),
      image: httpsImage(doc.image),
      category,
      author: doc.author?.name ? {
        name: doc.author.name,
        href: doc.author?.slug ? `/author/${doc.author.slug}` : undefined,
        bio: nonEmpty(doc.author?.bio),
        image: httpsImage(doc.author?.avatar),
        isAi: isAiAuthor,
      } : null,
      datePublished: doc.publishedAt,
      dateModified: doc.updatedAt,
      tags: (doc.tags || []).filter(Boolean).map((name: string) => ({ name })),
      interactionId: doc._id,
      excludeSlug: doc.slug,
      isOpinion: categorySlug === OPINION_CATEGORY_SLUG,
      aiGenerated: Boolean(doc.aiGenerated) || isAiAuthor,
      noindex: false,
    };
  }

  return {
    kind,
    path: `/${categorySlug}/${doc.slug}`,
    title: doc.title,
    excerpt: nonEmpty(doc.excerpt),
    metaTitle: nonEmpty(seo.metaTitle),
    metaDescription: nonEmpty(seo.metaDescription),
    html,
    wordCount: countWords(html),
    image: httpsImage(doc.coverImage),
    category,
    author: doc.author?.name
      ? {
          name: doc.author.name,
          href: doc.author._id ? `/author/${doc.author._id}` : undefined,
          bio: nonEmpty(doc.author.bio),
          image: httpsImage(doc.author.image),
        }
      : null,
    datePublished: doc.publishedAt,
    dateModified: doc.updatedAt,
    views: typeof doc.views === 'number' ? doc.views : undefined,
    tags: (doc.tags || [])
      .filter((tag: Doc) => tag?.name)
      .map((tag: Doc) => ({ name: tag.name, href: tag.slug ? `/tag/${tag.slug}` : undefined })),
    interactionId: doc._id,
    excludeSlug: doc.slug,
    isOpinion: categorySlug === OPINION_CATEGORY_SLUG,
    aiGenerated: false,
    noindex: false,
  };
}
