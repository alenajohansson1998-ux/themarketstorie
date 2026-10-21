import React from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/cms-utils-client';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: { _id: string; name: string; slug: string };
  author: { _id?: string; name: string; email?: string; slug?: string };
  views: number;
  createdAt: string;
}

interface RelatedPostsCardProps {
  posts: Post[];
}

export default function RelatedPostsCard({ posts }: RelatedPostsCardProps) {
  if (!posts.length) return null;

  return (
    <section aria-labelledby="related-stories" className="mt-14 border-t border-line-soft pt-8">
      <h2 id="related-stories" className="mb-6 text-title2 text-ink">
        Related stories
      </h2>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post._id}>
            <article className="group">
              <Link href={`/${post.category.slug}/${post.slug}`} className="block" tabIndex={-1} aria-hidden="true">
                <div className="aspect-16/10 overflow-hidden rounded-card bg-fill">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>
              </Link>
              <h3 className="mt-3 text-headline text-ink">
                <Link href={`/${post.category.slug}/${post.slug}`} className="line-clamp-2 hover:underline">
                  {post.title}
                </Link>
              </h3>
              <p className="mt-1 text-footnote text-ink-2">
                {post.author?.name ? `${post.author.name} · ` : null}
                {formatDate(post.createdAt)}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
