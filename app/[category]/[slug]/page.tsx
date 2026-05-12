
import BlogPostClient from '@/components/BlogPostClient';
import type { Metadata } from 'next';

interface FullArticle {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  coverImage?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: { name?: string; slug?: string };
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://themarketstories.com";

function clampTitle(title: string): string {
  if (title.length <= 60) return title;
  return title.slice(0, 57).trimEnd() + "...";
}

function clampDesc(desc: string): string {
  const clean = desc.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= 155) return clean;
  return clean.slice(0, 152).trimEnd() + "...";
}

async function fetchArticle(category: string, slug: string): Promise<FullArticle | null> {
  try {
    // Try CMS post first
    const cmsRes = await fetch(`${siteUrl}/api/cms/posts?slug=${slug}`, { next: { revalidate: 60 } });
    const cmsData = await cmsRes.json();
    if (cmsData?.data?.[0]) return cmsData.data[0] as FullArticle;

    // Fall back to AI article
    const articleRes = await fetch(
      `${siteUrl}/api/articles?slug=${encodeURIComponent(slug)}&category=${encodeURIComponent(category)}&limit=1`,
      { next: { revalidate: 60 } }
    );
    const articleData = await articleRes.json();
    const article = Array.isArray(articleData?.data) ? articleData.data[0] : null;
    return article ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await fetchArticle(category, slug);
  const url = `${siteUrl}/${category}/${slug}`;

  if (!post) {
    return {
      title: 'Post Not Found | The Market Stories',
      description: 'This article does not exist on The Market Stories.',
      alternates: { canonical: url },
      openGraph: { url, siteName: 'The Market Stories', type: 'article' },
    };
  }

  const title = clampTitle(post.title);
  const rawDesc = post.excerpt || post.content?.replace(/<[^>]+>/g, '').slice(0, 200) || 'Read this article on The Market Stories.';
  const description = clampDesc(rawDesc);
  const coverImage = post.coverImage || post.image;
  const validImage = coverImage && /^https:\/\//.test(coverImage) ? coverImage : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'The Market Stories',
      locale: 'en_US',
      ...(validImage && { images: [{ url: validImage, width: 1200, height: 630, alt: title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(validImage && { images: [validImage] }),
    },
  };
}

function buildJsonLd(article: FullArticle, category: string): string {
  const coverImage = article.image || article.coverImage || "";
  const url = `${siteUrl}/${category}/${article.slug}`;
  const authorName = article.author?.name || "The Market Stories";
  const datePublished = article.publishedAt || article.createdAt || new Date().toISOString();
  const dateModified = article.updatedAt || datePublished;
  const keywords = Array.isArray(article.tags) ? article.tags.join(", ") : "";

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || "",
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished,
    dateModified,
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: "The Market Stories",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  if (coverImage && /^https:\/\//.test(coverImage)) {
    schema.image = {
      "@type": "ImageObject",
      url: coverImage,
      width: 1200,
      height: 630,
    };
  }

  if (keywords) {
    schema.keywords = keywords;
  }

  return JSON.stringify(schema);
}

export default async function BlogPostPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const article = await fetchArticle(category, slug);

  return (
    <>
      {article && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildJsonLd(article, category) }}
        />
      )}
      <BlogPostClient category={category} slug={slug} />
    </>
  );
}
