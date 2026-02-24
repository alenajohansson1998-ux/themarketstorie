

// Server component for category page with dynamic metadata
import CategoryClient from '@/components/CategoryClient';
import type { Metadata } from 'next';

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata | undefined> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://themarketstories.com";
  const res = await fetch(`${siteUrl}/api/cms/categories`);
  const data = await res.json();
  const category = data.data?.find((cat: any) => cat.slug === slug);
  if (!category) {
    return {
      title: 'Category Not Found | The Market Stories',
      description: 'This category does not exist on The Market Stories.',
      alternates: {
        canonical: `${siteUrl}/category/${slug}`
      },
      robots: {
        index: false,
        follow: false
      }
    };
  }
  // Limit title to 55–60 characters
  let rawTitle = `${category.name} News & Insights | The Market Stories`;
  let title = rawTitle.length > 60 ? rawTitle.slice(0, 55) + '...' : rawTitle;
  // Shorten description to 150–160 chars, prioritize clarity
  let rawDesc = category.description || 'Explore posts in this category on The Market Stories.';
  let description = rawDesc.length > 155 ? rawDesc.slice(0, 155) : rawDesc;
  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/category/${slug}`
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      {/* SEO robots meta tag for clarity */}
      <meta name="robots" content="index, follow" />
      <CategoryClient slug={slug} />
    </>
  );
}
