import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import BlogPostClient from '@/components/BlogPostClient';
import { getRelatedStories, getStory } from '@/lib/server/content';
import { buildArticleView, type ArticleView } from '@/lib/articles/view';
import { pageMetadata } from '@/lib/seo/metadata';
import { JsonLd, articleSchema, breadcrumbSchema } from '@/lib/seo/jsonld';
import { absoluteUrl, ogImageUrl, summarize } from '@/lib/seo/site';

// Pages are rendered on first request and refreshed every ten minutes.
export const revalidate = 600;

type Params = Promise<{ category: string; slug: string }>;

async function loadArticle(category: string, slug: string): Promise<ArticleView | null> {
  const record = await getStory(slug);
  if (!record) return null;
  return buildArticleView(record.kind, record.doc, category);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await loadArticle(category, slug);
  if (!article) notFound();

  const description = summarize(article.metaDescription || article.excerpt || article.html);
  const base = pageMetadata({
    title: article.metaTitle || article.title,
    description,
    path: article.path,
    image: article.image || ogImageUrl(article.title, article.category?.name),
    imageAlt: article.title,
    noindex: article.noindex,
    type: 'article',
  });

  // Syndicated third-party stories carry noindex (set by buildArticleView) rather than a cross-domain canonical.
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      ...(article.datePublished ? { publishedTime: article.datePublished } : {}),
      ...(article.dateModified ? { modifiedTime: article.dateModified } : {}),
      ...(article.category ? { section: article.category.name } : {}),
      ...(article.author ? { authors: [article.author.href ? absoluteUrl(article.author.href) : article.author.name] } : {}),
      tags: article.tags.map((tag) => tag.name),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { category, slug } = await params;
  const article = await loadArticle(category, slug);
  if (!article) notFound();

  // One URL per story: /wrong-section/slug redirects to the story's own section.
  if (article.kind !== 'external' && article.category && article.category.slug !== category) {
    permanentRedirect(article.path);
  }

  const related = article.category ? await getRelatedStories(article.category.slug, slug) : [];

  const crumbs = [
    { name: 'Home', path: '/' },
    ...(article.category ? [{ name: article.category.name, path: article.category.href }] : []),
    { name: article.title, path: article.path },
  ];

  const schemaType = article.isOpinion ? 'OpinionNewsArticle' : 'NewsArticle';

  return (
    <>
      {article.noindex ? null : (
        <JsonLd
          data={[
            articleSchema({
              type: schemaType,
              path: article.path,
              headline: article.title,
              description: summarize(article.metaDescription || article.excerpt || article.html, 300),
              images: article.image ? [article.image] : [],
              datePublished: article.datePublished,
              dateModified: article.dateModified,
              section: article.category?.name,
              keywords: article.tags.map((tag) => tag.name),
              wordCount: article.wordCount,
              author: {
                name: article.author?.name || 'The Market Stories',
                path: article.author?.isAi ? undefined : article.author?.href,
                // AI Desk stories are attributed to the publisher, not to an invented person.
                isOrganization: !article.author || article.author.isAi,
              },
            }),
            breadcrumbSchema(crumbs),
          ]}
        />
      )}
      <BlogPostClient article={article} related={related as never} />
    </>
  );
}
