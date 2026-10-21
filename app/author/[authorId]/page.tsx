import { notFound } from 'next/navigation';
import { Facebook, Linkedin } from 'lucide-react';
import StoryCard from '@/components/StoryCard';
import { formatDate } from '@/lib/cms-utils-client';

interface Author {
  name?: string;
  bio?: string;
  facebook?: string;
  linkedin?: string;
  image?: string;
}

interface AuthorPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  createdAt: string;
  views?: number;
  category: { slug: string };
  author?: Author;
}

async function getAuthorPosts(authorIdOrSlug: string): Promise<AuthorPost[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || '';

  // Try fetching by ID first
  let res = await fetch(`${baseUrl}/api/cms/posts?author=${encodeURIComponent(authorIdOrSlug)}`);
  if (res.ok) {
    const data = await res.json();
    if (data.data && data.data.length > 0) return data.data;
  }

  // Fallback: fetch by slugified name
  res = await fetch(`${baseUrl}/api/cms/posts?authorSlug=${encodeURIComponent(authorIdOrSlug)}`);
  if (res.ok) {
    const data = await res.json();
    return data.data || [];
  }
  return [];
}

export default async function AuthorPage({ params }: { params: Promise<{ authorId: string }> }) {
  const { authorId } = await params;
  const posts = await getAuthorPosts(authorId);
  if (!posts || posts.length === 0) return notFound();

  const authorObj: Author = posts[0]?.author || {};

  const authorName = authorObj.name || authorId.replace(/-/g, ' ');
  const authorBio = authorObj.bio || '';
  const authorFacebook = authorObj.facebook || '';
  const authorLinkedin = authorObj.linkedin || '';
  const authorImage = (typeof authorObj.image === 'string' && authorObj.image.match(/^https?:\/\//)) ? authorObj.image : '';

  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <header className="flex flex-col items-start gap-6 border-b border-line-soft pb-10 sm:flex-row sm:items-center">
        {authorImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={authorImage} alt="" className="h-24 w-24 rounded-full bg-fill object-cover sm:h-28 sm:w-28" />
        ) : (
          <span
            className="flex h-24 w-24 items-center justify-center rounded-full bg-fill text-title1 text-ink sm:h-28 sm:w-28"
            aria-hidden="true"
          >
            {authorName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="max-w-2xl">
          <p className="section-label">Author</p>
          <h1 className="mt-1 text-title1 capitalize text-ink">{authorName}</h1>
          {authorBio ? <p className="mt-2 whitespace-pre-line text-body text-ink-2">{authorBio}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 text-footnote text-ink-2">
            <span>
              {posts.length} {posts.length === 1 ? 'story' : 'stories'}
            </span>
            {authorFacebook ? (
              <a
                href={authorFacebook.startsWith('http') ? authorFacebook : `https://${authorFacebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 font-medium text-tint hover:underline"
              >
                <Facebook className="h-4 w-4" aria-hidden="true" />
                Facebook
              </a>
            ) : null}
            {authorLinkedin ? (
              <a
                href={authorLinkedin.startsWith('http') ? authorLinkedin : `https://${authorLinkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 font-medium text-tint hover:underline"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
                LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <h2 className="mt-10 mb-6 text-title2 text-ink">Stories by {authorName}</h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <StoryCard
            key={post._id}
            href={`/${post.category.slug}/${post.slug}`}
            title={post.title}
            excerpt={post.excerpt}
            image={post.coverImage}
            meta={formatDate(post.createdAt)}
          />
        ))}
      </div>
    </div>
  );
}
