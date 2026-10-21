import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/cms-utils-client";
import SafeImage from '@/components/SafeImage';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: { name: string; slug: string };
  tags: { name: string; slug: string }[];
  author: { name: string };
  createdAt: string;
  views: number;
}

function StoryTile({ post, size }: { post: Post; size: "lead" | "small" }) {
  const lead = size === "lead";
  return (
    <Link
      href={`/${post.category.slug}/${post.slug}`}
      className={`group relative block overflow-hidden rounded-card bg-fill ${
        lead ? "aspect-4/3 sm:col-span-2 lg:row-span-2 lg:aspect-auto" : "aspect-4/3"
      }`}
    >
      {post.coverImage ? (
        <SafeImage
          src={post.coverImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : null}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />
      <div className={`absolute inset-x-0 bottom-0 text-white ${lead ? "p-5 sm:p-6" : "p-3.5"}`}>
        {lead ? (
          <p className="mb-1 text-footnote text-white/85">
            {post.author?.name} · {formatDate(post.createdAt)}
          </p>
        ) : null}
        <h3 className={`line-clamp-3 text-white ${lead ? "text-title3 sm:text-title2" : "text-subhead font-semibold"}`}>
          {post.title}
        </h3>
      </div>
    </Link>
  );
}

const StockMarketsCategoryGrid: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/cms/posts?status=published&category=stock-markets&limit=9&sortBy=-createdAt");
        const data = await res.json();
        if (data.success) setPosts(data.data);
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-hidden="true">
        <div className="col-span-2 aspect-4/3 animate-pulse rounded-card bg-fill lg:row-span-2 lg:aspect-auto" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-4/3 animate-pulse rounded-card bg-fill" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return <p className="text-body text-ink-2">No stock market stories yet. Check back soon.</p>;
  }

  const [featured, ...rest] = posts;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StoryTile post={featured} size="lead" />
        {rest.slice(0, 8).map((post) => (
          <StoryTile key={post._id} post={post} size="small" />
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href="/category/stock-markets"
          className="inline-flex min-h-11 items-center text-subhead font-medium text-tint hover:underline"
        >
          More stock market news
        </Link>
      </div>
    </div>
  );
};

export default StockMarketsCategoryGrid;
