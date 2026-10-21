import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/cms-utils-client';
import CategorySidebar from '@/components/CategorySidebar';
import SafeImage from '@/components/SafeImage';
import { getCategoryBySlug, listArticles, listPosts } from '@/lib/server/content';
import { countWords, readingMinutes } from '@/lib/articles/view';
import { pageMetadata } from '@/lib/seo/metadata';
import { JsonLd, breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/seo/jsonld';
import { summarize } from '@/lib/seo/site';

// Public URL is /category/:slug (next.config.ts rewrites it to this route).
const PER_PAGE = 20;

type Params = Promise<{ slug: string }>;
type Search = Promise<{ page?: string }>;

interface ListItem {
  id: string;
  title: string;
  excerpt?: string;
  image?: string;
  date?: string;
  authorName: string;
  href: string;
  minutes: number | null;
}

function pageNumber(value?: string) {
  const n = Number(value);
  return Number.isInteger(n) && n > 1 ? n : 1;
}

function categoryTitle(name: string, page: number) {
  const normalized = name.trim().toLowerCase();
  const base = normalized === 'news'
    ? 'Business, World and Market News'
    : /\b(analysis|opinion)\b/.test(normalized)
      ? `${name}: Market Perspectives`
      : `${name} News and Analysis`;
  return page > 1 ? `${base} (Page ${page})` : base;
}

function categoryDescription(name: string, description?: string) {
  if (description) return summarize(description);
  const normalized = name.trim().toLowerCase();
  if (normalized === 'news') return 'Business, world and market news from The Market Stories.';
  if (/\b(analysis|opinion)\b/.test(normalized)) {
    return 'Market analysis and opinion on companies, the economy and financial markets from The Market Stories.';
  }
  return summarize(
    `The latest ${name.toLowerCase()} news, market analysis and explainers from The Market Stories.`
  );
}

/** Newest-first stories from both the CMS and the AI desk, for one page of the archive. */
async function loadPage(categorySlug: string, page: number) {
  const take = page * PER_PAGE;
  const [posts, articles] = await Promise.all([
    listPosts({ categorySlug, limit: take, includeContent: true }),
    listArticles({ categorySlug, limit: take, includeContent: true }),
  ]);
  if (!posts && !articles) return null;

  const items: ListItem[] = [
    ...(posts?.data ?? []).map((post) => ({
      id: `cms-${post._id}`,
      title: post.title,
      excerpt: post.excerpt,
      image: post.coverImage,
      date: post.publishedAt || undefined,
      authorName: post.author?.name || 'The Market Stories',
      href: `/${categorySlug}/${post.slug}`,
      minutes: post.content ? readingMinutes(countWords(post.content)) : null,
    })),
    ...(articles?.data ?? []).map((article) => ({
      id: `ai-${article._id}`,
      title: article.title,
      excerpt: article.excerpt,
      image: article.image,
      date: article.publishedAt || undefined,
      authorName: article.author?.name || 'AI Desk',
      href: `/${categorySlug}/${article.slug}`,
      minutes: article.content ? readingMinutes(countWords(article.content)) : null,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = (posts?.total ?? 0) + (articles?.total ?? 0);
  return {
    items: items.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    total,
    pages: Math.max(1, Math.ceil(total / PER_PAGE)),
  };
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Search }): Promise<Metadata> {
  const { slug } = await params;
  const page = pageNumber((await searchParams).page);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const title = categoryTitle(category.name, page);
  const description = categoryDescription(category.name, category.description);
  return pageMetadata({
    title,
    description,
    path: page > 1 ? `/category/${slug}?page=${page}` : `/category/${slug}`,
  });
}

export default async function CategoryBlogPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { slug } = await params;
  const page = pageNumber((await searchParams).page);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const result = await loadPage(slug, page);
  if (!result) throw new Error('Category stories are unavailable');
  // An empty section (or a page past the end) is not a real page.
  if (result.items.length === 0) notFound();

  const path = `/category/${slug}`;
  const description = categoryDescription(category.name, category.description);

  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <JsonLd
        data={[
          webPageSchema({
            path: page > 1 ? `${path}?page=${page}` : path,
            name: categoryTitle(category.name, page),
            description,
            type: 'CollectionPage',
            extra: { mainEntity: itemListSchema(result.items.map((item) => item.href)) },
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: category.name, path },
          ]),
        ]}
      />

      <header className="mb-10 max-w-3xl">
        <nav aria-label="Breadcrumb" className="text-footnote text-ink-2">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-ink hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-semibold text-brand">
              {category.name}
            </li>
          </ol>
        </nav>
        <h1 className="mt-2 text-title1 text-ink">
          {category.name}
          {page > 1 ? <span className="text-ink-2"> · Page {page}</span> : null}
        </h1>
        {category.description && page === 1 ? (
          <p className="mt-3 max-w-[68ch] text-body text-ink-2">{category.description}</p>
        ) : null}
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <ul className="divide-y divide-line-soft">
            {result.items.map((item) => (
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
                      {item.authorName}
                      {item.date ? <> · <time dateTime={item.date}>{formatDate(item.date)}</time></> : null}
                      {item.minutes ? ` · ${item.minutes} min read` : null}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {result.pages > 1 ? (
            <nav aria-label="Archive pages" className="mt-8 flex items-center justify-between gap-4 border-t border-line-soft pt-6">
              {page > 1 ? (
                <Link
                  href={page === 2 ? path : `${path}?page=${page - 1}`}
                  className="inline-flex h-11 items-center rounded-control px-4 text-subhead font-medium text-ink hover:bg-fill"
                >
                  ‹ Newer stories
                </Link>
              ) : (
                <span />
              )}
              <span className="text-footnote text-ink-2">
                Page {page} of {result.pages}
              </span>
              {page < result.pages ? (
                <Link
                  href={`${path}?page=${page + 1}`}
                  className="inline-flex h-11 items-center rounded-control px-4 text-subhead font-medium text-ink hover:bg-fill"
                >
                  Older stories ›
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start" aria-label="Latest across The Market Stories">
          <CategorySidebar categorySlug={slug} />
        </aside>
      </div>

      {page === 1 ? (
        <section className="mt-16 max-w-3xl border-t border-line-soft pt-6">
          <h2 className="text-headline text-ink">About {category.name} coverage</h2>
          <p className="mt-2 text-subhead text-ink-2">
            The latest developments in {category.name}, including market moves, company news, policy changes and
            analysis from The Market Stories. Stories are for information only and are not financial advice.
          </p>
        </section>
      ) : null}
    </div>
  );
}
