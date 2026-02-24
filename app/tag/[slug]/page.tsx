import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TagBlogPageClient from './TagBlogPageClient';

type PageProps = {
  params: { slug: string };
};

/* ============================
   SEO METADATA
============================ */
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return {
      title: 'Page Not Found | The Market Stories',
      robots: { index: false, follow: false },
    };
  }
  const canonicalUrl = `https://themarketstories.com/tag/${slug}`;
  let tagName = slug.replace(/-/g, ' ');
  let tagDescription = `Latest ${tagName} news, analysis, and updates on The Market Stories.`;
  let foundTag = null;
  try {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : '');
    const url = base ? `${base}/api/cms/tags` : '/api/cms/tags';
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const { data } = await res.json();
      foundTag = data?.find(
        (t: any) => t.slug?.toLowerCase() === slug.toLowerCase()
      );
      if (foundTag) {
        tagName = foundTag.name || tagName;
        tagDescription =
          foundTag.description?.slice(0, 155) ||
          `Browse all articles under ${tagName} on The Market Stories.`;
      }
    }
  } catch (error) {
    // Optionally log error in dev
  }
  if (!foundTag) {
    return {
      title: 'Page Not Found | The Market Stories',
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${tagName} | Latest Market, Economy & Crypto Updates | The Market Stories`,
    description: tagDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/* ============================
   PAGE RENDER
============================ */
export default async function TagBlogPage(
  { params }: PageProps
) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }
  // Fetch tag to check existence (avoid duplicate API call by moving to a util if needed)
  let foundTag = null;
  try {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : '');
    const url = base ? `${base}/api/cms/tags` : '/api/cms/tags';
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const { data } = await res.json();
      foundTag = data?.find(
        (t: any) => t.slug?.toLowerCase() === slug.toLowerCase()
      );
    }
  } catch (error) {
    // Optionally log error in dev
  }
  if (!foundTag) {
    notFound();
  }
  return <TagBlogPageClient slug={slug} />;
}
