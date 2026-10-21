import type { Metadata } from 'next';
import BlogIndexClient from '@/components/BlogIndexClient';
import { listPosts } from '@/lib/server/content';
import { pageMetadata } from '@/lib/seo/metadata';
import { JsonLd, itemListSchema, webPageSchema } from '@/lib/seo/jsonld';

export const revalidate = 300;

const TITLE = 'Latest Financial News and Analysis';
const DESCRIPTION =
  'The latest financial news and analysis from The Market Stories: global and Indian markets, stocks, brokers, investing, the economy and geopolitics.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: '/blog' });

const PAGE_SIZE = 12;

export default async function BlogPage() {
  const result = await listPosts({ limit: PAGE_SIZE, page: 1 });
  const posts = result?.data;
  const pagination = result
    ? { total: result.total, page: 1, limit: PAGE_SIZE, pages: Math.ceil(result.total / PAGE_SIZE) }
    : undefined;

  return (
    <>
      <JsonLd
        data={[
          webPageSchema({
            path: '/blog',
            name: TITLE,
            description: DESCRIPTION,
            type: 'CollectionPage',
            extra: posts?.length
              ? { mainEntity: itemListSchema(posts.map((post) => `/${post.category?.slug}/${post.slug}`)) }
              : {},
          }),
        ]}
      />
      <BlogIndexClient initialPosts={posts as never} initialPagination={pagination} />
    </>
  );
}
