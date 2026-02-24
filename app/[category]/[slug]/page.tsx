
import BlogPostClient from '@/components/BlogPostClient';
import type { Metadata } from 'next';

interface MetadataPost {
  title: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata | undefined> {
  const { category, slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://themarketstories.com";
  let post: MetadataPost | null = null;

  const cmsRes = await fetch(`${siteUrl}/api/cms/posts?slug=${slug}`);
  const cmsData = await cmsRes.json();
  if (cmsData.data && cmsData.data.length > 0) {
    post = cmsData.data[0];
  } else {
    const articleRes = await fetch(
      `${siteUrl}/api/articles?slug=${encodeURIComponent(slug)}&category=${encodeURIComponent(category)}&limit=1`
    );
    const articleData = await articleRes.json();
    const article = Array.isArray(articleData?.data) ? articleData.data[0] : null;
    if (articleRes.ok && articleData?.success && article) {
      post = {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.image,
      };
    }
  }
  // Only set OG tags if post and coverImage exist and are valid
  if (!post || !post.coverImage || !/^https:\/\//.test(post.coverImage)) {
    return {
      title: post ? post.title : 'Post Not Found | The Market Stories',
      description: post ? (post.excerpt || post.content?.slice(0, 150) || 'Read this article on The Market Stories.') : 'This blog post does not exist on The Market Stories.'
    };
  }
  const url = `${siteUrl}/${category}/${slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      siteName: "The Market Stories",
      locale: "en_US",
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  return <BlogPostClient category={category} slug={slug} />;
}
