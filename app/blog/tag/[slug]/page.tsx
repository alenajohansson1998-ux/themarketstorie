import type { Metadata } from 'next';
import TagBlogPageContent from './TagBlogPageContent';

const siteUrl = 'https://themarketstories.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // Public-facing URL is /tag/:slug (rewrite in next.config.ts routes /tag/:slug → this page)
  const url = `${siteUrl}/tag/${slug}`;
  const label = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  let title = `${label} Articles | The Market Stories`;
  let description = `Browse the latest ${label} news, market insights, and analysis on TheMarketStories.`;

  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || siteUrl;
    const res = await fetch(`${base}/api/cms/tags`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const { data } = await res.json();
      const foundTag = data?.find((t: { slug: string; name?: string; description?: string }) =>
        t.slug?.toLowerCase() === slug.toLowerCase()
      );
      if (foundTag) {
        title = `${foundTag.name} Articles | The Market Stories`;
        if (foundTag.description) {
          description = foundTag.description.slice(0, 155);
        }
      }
    }
  } catch {
    // use slug-based fallback
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'The Market Stories',
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}

export default async function TagBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TagBlogPageContent slug={slug} />;
}
