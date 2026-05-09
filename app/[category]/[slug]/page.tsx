
import BlogPostClient from '@/components/BlogPostClient';
import type { Metadata } from 'next';

interface MetadataPost {
  title: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
}

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

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata | undefined> {
  const { category, slug } = await params;
  const post = await fetchArticle(category, slug);
  const coverImage = post?.coverImage || post?.image;

  if (!post || !coverImage || !/^https:\/\//.test(coverImage)) {
    return {
      title: post ? post.title : 'Post Not Found | The Market Stories',
      description: post
        ? (post.excerpt || post.content?.slice(0, 150) || 'Read this article on The Market Stories.')
        : 'This blog post does not exist on The Market Stories.',
    };
  }

  const url = `${siteUrl}/${category}/${slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      siteName: "The Market Stories",
      locale: "en_US",
      images: [{ url: coverImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [coverImage],
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
