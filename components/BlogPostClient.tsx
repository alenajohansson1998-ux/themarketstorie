"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/cms-utils-client';
import ShareButtons from '@/components/ShareButtons';
import RelatedPostsCard from '@/components/RelatedPostsCard';
import ArticleSidebar from '@/components/ArticleSidebar';
import LikeCommentSection from '@/components/LikeCommentSection';
import { readingMinutes, type ArticleView } from '@/lib/articles/view';
import { EDITORIAL_POLICY_PATH, RISK_DISCLOSURE_PATH, absoluteUrl } from '@/lib/seo/site';

interface RelatedPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: { _id: string; name: string; slug: string };
  author: { _id?: string; name: string; slug?: string };
  views: number;
  createdAt: string;
}

interface BlogPostClientProps {
  article: ArticleView;
  related: RelatedPost[];
}

/** Shown as "Updated" only when the story changed meaningfully after publication. */
function wasUpdated(published?: string, modified?: string) {
  if (!published || !modified) return false;
  return new Date(modified).getTime() - new Date(published).getTime() > 60 * 60 * 1000;
}

export default function BlogPostClient({ article, related }: BlogPostClientProps) {
  const minutes = readingMinutes(article.wordCount);
  const updated = wasUpdated(article.datePublished, article.dateModified);

  return (
    <div className="site-container px-4 py-8 md:px-6 lg:py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-16">
        <article className="min-w-0">
          <header className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="text-footnote text-ink-2">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-ink hover:underline">
                    Home
                  </Link>
                </li>
                {article.category ? (
                  <>
                    <li aria-hidden="true">›</li>
                    <li>
                      <Link href={article.category.href} className="font-semibold text-brand hover:underline">
                        {article.category.name}
                      </Link>
                    </li>
                  </>
                ) : null}
              </ol>
            </nav>

            {article.isOpinion ? (
              <p className="mt-3 inline-flex rounded-full bg-fill px-2.5 py-0.5 text-caption font-semibold uppercase tracking-wide text-ink">
                Analysis &amp; opinion
              </p>
            ) : null}

            <h1 className="mt-2 text-title1 text-ink lg:text-[2.5rem] lg:leading-[1.12]">{article.title}</h1>
            {article.excerpt ? <p className="mt-4 text-title3 font-normal text-ink-2">{article.excerpt}</p> : null}

            <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-footnote text-ink-2">
              {article.author ? (
                <>
                  <span>
                    By{' '}
                    {article.author.href ? (
                      <Link href={article.author.href} className="font-semibold text-ink hover:underline" rel="author">
                        {article.author.name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-ink">{article.author.name}</span>
                    )}
                  </span>
                  <span aria-hidden="true">·</span>
                </>
              ) : null}
              {article.datePublished ? (
                <span>
                  Published <time dateTime={article.datePublished}>{formatDate(article.datePublished)}</time>
                </span>
              ) : null}
              {updated && article.dateModified ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Updated <time dateTime={article.dateModified}>{formatDate(article.dateModified)}</time>
                  </span>
                </>
              ) : null}
              <span aria-hidden="true">·</span>
              <span>{minutes} min read</span>
              {typeof article.views === 'number' && article.views > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{article.views.toLocaleString('en-US')} views</span>
                </>
              ) : null}
            </p>

            {article.aiGenerated ? (
              <p className="mt-4 rounded-card bg-surface px-4 py-3 text-subhead text-ink-2">
                This story was written with AI assistance from market data and news reports, and published by The
                Market Stories AI Desk.{' '}
                <Link href={`${EDITORIAL_POLICY_PATH}#ai`} className="font-medium text-tint hover:underline">
                  How we use AI
                </Link>
              </p>
            ) : null}
          </header>

          {article.image ? (
            <figure className="relative mt-8 aspect-video w-full max-w-4xl overflow-hidden rounded-media bg-fill">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 860px"
                priority
              />
            </figure>
          ) : null}

          <div className="article-body mt-8" dangerouslySetInnerHTML={{ __html: article.html }} />

          {article.source ? (
            <p className="mt-2 max-w-3xl text-subhead text-ink-2">
              Source:{' '}
              <a
                href={article.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-tint hover:underline"
              >
                {article.source.name}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </p>
          ) : null}

          <footer className="mt-10 max-w-3xl space-y-8 border-t border-line-soft pt-8">
            {article.isOpinion ? (
              <p className="text-subhead text-ink-2">
                This is an analysis and opinion piece. Views are the author&apos;s own.
              </p>
            ) : null}

            {article.tags.length > 0 ? (
              <div>
                <h2 className="sr-only">Topics</h2>
                <ul className="flex flex-wrap gap-2">
                  {article.tags.map((tag) =>
                    tag.href ? (
                      <li key={tag.name}>
                        <Link
                          href={tag.href}
                          className="inline-flex min-h-9 items-center rounded-full bg-surface px-3.5 text-footnote font-medium text-ink hover:bg-fill"
                        >
                          {tag.name}
                        </Link>
                      </li>
                    ) : (
                      <li
                        key={tag.name}
                        className="inline-flex min-h-9 items-center rounded-full bg-surface px-3.5 text-footnote text-ink-2"
                      >
                        {tag.name}
                      </li>
                    )
                  )}
                </ul>
              </div>
            ) : null}

            {article.author ? (
              <section aria-labelledby="about-author" className="flex gap-4 rounded-card bg-surface p-5">
                {article.author.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.author.image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                ) : (
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fill text-headline text-ink"
                    aria-hidden="true"
                  >
                    {article.author.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <h2 id="about-author" className="text-headline text-ink">
                    {article.author.href ? (
                      <Link href={article.author.href} className="hover:underline">
                        {article.author.name}
                      </Link>
                    ) : (
                      article.author.name
                    )}
                  </h2>
                  {article.author.bio ? (
                    <p className="mt-1 text-subhead text-ink-2">{article.author.bio}</p>
                  ) : article.author.isAi ? (
                    <p className="mt-1 text-subhead text-ink-2">
                      The AI Desk publishes data-driven market updates written with AI assistance.
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}

            <p className="text-footnote text-ink-2">
              This article is for information only and is not financial advice. Markets carry risk, including the loss
              of capital.{' '}
              <Link href={RISK_DISCLOSURE_PATH} className="text-tint hover:underline">
                Risk disclosure
              </Link>
              {' · '}
              <Link href={EDITORIAL_POLICY_PATH} className="text-tint hover:underline">
                Editorial policy
              </Link>
              {' · '}
              <Link href="/contact" className="text-tint hover:underline">
                Report an error
              </Link>
            </p>

            <ShareButtons title={article.title} url={absoluteUrl(article.path)} />

            {article.interactionId ? <LikeCommentSection postId={article.interactionId} /> : null}
          </footer>

          <RelatedPostsCard posts={related} />
        </article>

        <ArticleSidebar excludeSlug={article.excludeSlug} />
      </div>
    </div>
  );
}
