import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import { formatDate } from '@/lib/cms-utils-client';
import CategorySidebar from '@/components/CategorySidebar';

export const dynamic = 'force-dynamic';

interface CategoryItem {
  name: string;
  slug: string;
  description?: string;
}

interface CmsPostItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  createdAt: string;
  author?: { name?: string };
}

interface AiArticleItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  createdAt: string;
  author?: { name?: string };
}

interface CombinedItem {
  id: string;
  title: string;
  excerpt?: string;
  image?: string;
  createdAt: string;
  authorName: string;
  href: string;
  source: 'cms' | 'ai';
}

async function getCategory(slug: string): Promise<CategoryItem | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cms/categories`, {
    cache: 'no-store',
  });

  const data = await res.json();
  return (data.data as CategoryItem[] | undefined)?.find((cat) => cat.slug === slug) || null;
}

async function getPosts(slug: string) {
  const params = new URLSearchParams({
    page: '1',
    limit: '12',
    category: slug,
    status: 'published',
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/cms/posts?${params}`,
    { cache: 'no-store' }
  );

  return res.json();
}

async function getAiArticles(slug: string) {
  const params = new URLSearchParams({
    page: '1',
    limit: '12',
    category: slug,
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/articles?${params}`,
    { cache: 'no-store' }
  );

  return res.json();
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  return {
    title: `${slug} News & Analysis | TheMarketStories`,
    description: `Latest ${slug} news, insights, analysis, and market updates.`,
    alternates: {
      canonical: `https://themarketstories.com/category/${slug}`,
    },
  };
}

export default async function CategoryBlogPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const [postsData, aiArticlesData] = await Promise.all([
    getPosts(slug),
    getAiArticles(slug),
  ]);
  const posts: CmsPostItem[] = Array.isArray(postsData?.data) ? postsData.data : [];
  const aiArticles: AiArticleItem[] = Array.isArray(aiArticlesData?.data) ? aiArticlesData.data : [];

  const combinedItems: CombinedItem[] = [
    ...posts.map((post) => ({
      id: `cms-${post._id}`,
      title: post.title,
      excerpt: post.excerpt,
      image: post.coverImage,
      createdAt: post.createdAt,
      authorName: post.author?.name || 'Unknown',
      href: `/${category.slug}/${post.slug}`,
      source: 'cms' as const,
    })),
    ...aiArticles.map((article) => ({
      id: `ai-${article._id}`,
      title: article.title,
      excerpt: article.excerpt,
      image: article.image,
      createdAt: article.createdAt,
      authorName: article.author?.name || 'AI Desk',
      href: `/${category.slug}/${article.slug}`,
      source: 'ai' as const,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (combinedItems.length === 0) {
    notFound(); // IMPORTANT for Soft 404 fix
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/blog" className="text-blue-600 inline-flex items-center gap-2 mb-4">
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {category.name}
          </h1>

          <p className="text-xl text-gray-600">
            {category.description}
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts */}
          <div className="lg:col-span-2 space-y-6">
            {combinedItems.map((item, index: number) => (
              <Link
                key={item.id}
                href={item.href}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex gap-4 p-6">
                  <img
                    src={item.image || '/herobaner.png'}
                    alt={item.title}
                    className="w-32 h-24 object-cover rounded-lg"
                  />

                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-3">
                      {item.excerpt}
                    </p>
                    <div className="text-xs text-gray-500 flex gap-4">
                      <span className="flex items-center gap-1">
                        <User size={12} /> {item.authorName}
                      </span>
                      <span>{formatDate(item.createdAt)}</span>
                      {item.source === 'ai' ? <span>AI Article</span> : null}
                    </div>
                  </div>
                </div>

                {(index + 1) % 3 === 0 && (
                  <div className="bg-gray-100 text-center py-6 text-sm text-gray-500">
                    ADVERTISEMENT
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <CategorySidebar categorySlug={slug} />
            </div>
          </div>
        </div>

        {/* SEO Content Block */}
        <section className="mt-16 text-gray-600">
          <h2 className="text-xl font-semibold mb-3">
            Latest {category.name} News & Market Insights
          </h2>
          <p>
            Stay updated with the latest developments in {category.name},
            including corporate earnings, market trends, policy changes,
            and in-depth financial analysis curated by TheMarketStories.
          </p>
        </section>
      </div>
    </div>
  );
}
