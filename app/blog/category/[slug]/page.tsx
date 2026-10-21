import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/cms-utils-client';
import CategorySidebar from '@/components/CategorySidebar';
import SafeImage from '@/components/SafeImage';

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
  content?: string;
  coverImage?: string;
  createdAt: string;
  author?: { name?: string };
}

interface AiArticleItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  createdAt: string;
  author?: { name?: string };
}

interface CombinedItem {
  id: string;
  title: string;
  excerpt?: string;
  minutes: number | null;
  image?: string;
  createdAt: string;
  authorName: string;
  href: string;
  source: 'cms' | 'ai';
}

function readingMinutes(html?: string) {
  if (!html) return null;
  const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  return words > 0 ? Math.max(1, Math.round(words / 230)) : null;
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  // Public-facing URL is /category/:slug (rewrite in next.config.ts routes /category/:slug → this page)
  const url = `https://themarketstories.com/category/${slug}`;
  const description = `Browse the latest ${label} news, market insights, and analysis on TheMarketStories.`;
  return {
    title: `${label} News & Analysis | TheMarketStories`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${label} News & Analysis | TheMarketStories`,
      description,
      url,
      siteName: 'The Market Stories',
      type: 'website',
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
      minutes: readingMinutes(post.content),
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
      minutes: readingMinutes(article.content),
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
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <header className="mb-10 max-w-3xl">
        <p className="section-label">Section</p>
        <h1 className="mt-1 text-title1 text-ink">{category.name}</h1>
        {category.description ? (
          <p className="mt-3 max-w-[68ch] text-body text-ink-2">{category.description}</p>
        ) : null}
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <ul className="min-w-0 divide-y divide-line-soft">
          {combinedItems.map((item) => (
            <li key={item.id} className="py-6 first:pt-0">
              <article className="group flex gap-5">
                <Link
                  href={item.href}
                  className="block h-24 w-32 shrink-0 overflow-hidden rounded-card bg-fill sm:h-28 sm:w-44"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {item.image ? (
                    <SafeImage
                      src={item.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : null}
                </Link>
                <div className="min-w-0 flex-1">
                  <h2 className="text-headline text-ink sm:text-title3">
                    <Link href={item.href} className="line-clamp-3 hover:underline">
                      {item.title}
                    </Link>
                  </h2>
                  {item.excerpt ? (
                    <p className="mt-1.5 hidden text-subhead text-ink-2 sm:line-clamp-2">{item.excerpt}</p>
                  ) : null}
                  <p className="mt-2 text-footnote text-ink-2">
                    {item.authorName} · {formatDate(item.createdAt)}
                    {item.minutes ? ` · ${item.minutes} min read` : null}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-20 lg:self-start" aria-label="Latest across TheMarketStories">
          <CategorySidebar categorySlug={slug} />
        </aside>
      </div>

      <section className="mt-16 max-w-3xl border-t border-line-soft pt-6">
        <h2 className="text-headline text-ink">About {category.name} coverage</h2>
        <p className="mt-2 text-subhead text-ink-2">
          The latest developments in {category.name}, including corporate earnings, market trends, policy changes and
          financial analysis from TheMarketStories.
        </p>
      </section>
    </div>
  );
}
