import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TagStories from '@/components/TagStories';
import { getTagBySlug, listPosts } from '@/lib/server/content';
import { pageMetadata } from '@/lib/seo/metadata';
import { JsonLd, itemListSchema, webPageSchema } from '@/lib/seo/jsonld';
import { summarize } from '@/lib/seo/site';

// Public URL is /tag/:slug (next.config.ts rewrites it to this route).
export const revalidate = 600;

/** Topic pages with fewer stories than this are thin, so they stay out of the index (links still followed). */
export const MIN_INDEXABLE_TAG_POSTS = 5;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag || tag.postCount === 0) notFound();

  return pageMetadata({
    title: `${tag.name}: Latest Stories`,
    description: summarize(tag.description || `Stories about ${tag.name} from The Market Stories: news, market analysis and explainers.`),
    path: `/tag/${tag.slug}`,
    noindex: tag.postCount < MIN_INDEXABLE_TAG_POSTS,
  });
}

export default async function TagBlogPage({ params }: { params: Params }) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag || tag.postCount === 0) notFound();

  const first = await listPosts({ tagId: tag._id, limit: 12 });
  const posts = first?.data;

  return (
    <>
      {tag.postCount >= MIN_INDEXABLE_TAG_POSTS && posts?.length ? (
        <JsonLd
          data={[
            webPageSchema({
              path: `/tag/${tag.slug}`,
              name: `${tag.name}: Latest Stories`,
              description: summarize(tag.description || `Stories about ${tag.name} from The Market Stories.`),
              type: 'CollectionPage',
              extra: { mainEntity: itemListSchema(posts.map((post) => `/${post.category?.slug}/${post.slug}`)) },
            }),
          ]}
        />
      ) : null}
      <TagStories
        slug={slug}
        initialTag={{ _id: tag._id, name: tag.name, slug: tag.slug, description: tag.description }}
        initialPosts={posts as never}
        initialTotal={tag.postCount}
      />
    </>
  );
}
