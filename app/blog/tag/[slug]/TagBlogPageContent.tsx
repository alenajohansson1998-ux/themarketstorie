'use client';

import TagStories from '@/components/TagStories';

export default function TagBlogPageContent({ slug }: { slug: string }) {
  return <TagStories slug={slug} />;
}
