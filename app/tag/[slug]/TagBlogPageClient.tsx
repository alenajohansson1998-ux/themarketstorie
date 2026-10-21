"use client";

import TagStories from '@/components/TagStories';

export default function TagBlogPageClient({ slug }: { slug: string }) {
  return <TagStories slug={slug} />;
}
