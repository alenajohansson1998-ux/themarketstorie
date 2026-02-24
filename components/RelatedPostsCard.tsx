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
    <section className="bg-neutral-50 py-8 px-2 rounded-xl border border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-7 tracking-tight">
          Related Posts / Sponsored Content
        </h3>
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {posts.map((post) => (
            <article
              key={post._id}
              className="group bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col"
            >
              {/* Image */}
              {post.coverImage && (
                <div className="mb-3 overflow-hidden rounded-lg bg-gray-100 aspect-4/3 flex items-center justify-center">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105 rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {/* Title */}
              <h4 className="text-base font-semibold leading-snug line-clamp-2 text-gray-900 group-hover:text-primary-700 mb-1">
                {post.title}
              </h4>
              {/* Meta */}
              <p className="mt-1 text-xs text-gray-500">
                {formatDate(post.createdAt)}
                {post.author && (
                  <>
                    {' '}|{' '}
                    <Link
                          href={post.author?.slug ? `/author/${post.author.slug}` : `/author/${post.author?._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {post.author.name}
                    </Link>
                  </>
                )}
              </p>
              {/* CTA */}
              <Link
                href={`/${post.category.slug}/${post.slug}`}
                className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
