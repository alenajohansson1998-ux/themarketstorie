"use client";

import StoryCard from "@/components/StoryCard";
import { useBrokerCategoryPosts } from "@/lib/useBrokerCategoryPosts";
import { formatDate } from "@/lib/cms-utils-client";

interface GuidePost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string | null;
  category?: { slug: string; name: string };
}

/** Recent posts from the Brokers category, shown on broker pages. */
export default function BrokerGuides({ title = "Broker guides" }: { title?: string }) {
  const { posts, isLoading } = useBrokerCategoryPosts();
  const guides = (posts as GuidePost[]).slice(0, 3);

  if (!isLoading && guides.length === 0) return null;

  return (
    <section aria-labelledby="broker-guides" className="mx-auto mt-16 max-w-4xl border-t border-line-soft pt-8">
      <h2 id="broker-guides" className="mb-6 text-title2 text-ink">
        {title}
      </h2>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-16/10 animate-pulse rounded-card bg-fill" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
          {guides.map((post) => (
            <StoryCard
              key={post._id}
              href={`/${post.category?.slug ?? "brokers"}/${post.slug}`}
              title={post.title}
              excerpt={post.excerpt}
              image={post.coverImage}
              meta={post.publishedAt ? formatDate(post.publishedAt) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
