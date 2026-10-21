import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StoryCard from '@/components/StoryCard';
import { formatDate } from '@/lib/cms-utils-client';
import { getAuthorProfile } from '@/lib/server/content';
import { JsonLd, webPageSchema } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';
import { absoluteUrl, summarize } from '@/lib/seo/site';

type Params = Promise<{ authorId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { authorId } = await params;
  const profile = await getAuthorProfile(authorId);
  if (!profile || profile.storyCount === 0) notFound();

  return pageMetadata({
    title: `${profile.name} Author Profile`,
    description: summarize(profile.bio || `Read articles by ${profile.name} on The Market Stories.`),
    path: `/author/${encodeURIComponent(authorId)}`,
    image: profile.image,
    type: 'profile',
  });
}

export default async function AuthorPage({ params }: { params: Params }) {
  const { authorId } = await params;
  const profile = await getAuthorProfile(authorId);
  if (!profile || profile.storyCount === 0) notFound();

  const profilePath = `/author/${encodeURIComponent(authorId)}`;
  const stories = profile.stories.filter((story) => story.category?.slug && story.slug);
  const description = summarize(profile.bio || `Articles by ${profile.name} on The Market Stories.`);

  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <JsonLd
        data={[
          webPageSchema({
            path: profilePath,
            name: `${profile.name} Author Profile`,
            description,
            type: 'ProfilePage',
            extra: {
              mainEntity: {
                '@type': 'Person',
                '@id': `${absoluteUrl(profilePath)}#person`,
                name: profile.name,
                url: absoluteUrl(profilePath),
                ...(profile.bio ? { description: profile.bio } : {}),
                ...(profile.image ? { image: profile.image } : {}),
                ...(profile.links.length ? { sameAs: profile.links.map((link) => link.href) } : {}),
              },
            },
          }),
        ]}
      />

      <header className="flex flex-col items-start gap-6 border-b border-line-soft pb-10 sm:flex-row sm:items-center">
        {profile.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.image} alt="" className="h-24 w-24 rounded-full bg-fill object-cover sm:h-28 sm:w-28" />
        ) : (
          <span
            className="flex h-24 w-24 items-center justify-center rounded-full bg-fill text-title1 text-ink sm:h-28 sm:w-28"
            aria-hidden="true"
          >
            {profile.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="max-w-2xl">
          <p className="section-label">Author</p>
          <h1 className="mt-1 text-title1 text-ink">{profile.name}</h1>
          {profile.role ? <p className="mt-1 text-subhead font-medium text-ink-2">{profile.role}</p> : null}
          {profile.bio ? <p className="mt-2 whitespace-pre-line text-body text-ink-2">{profile.bio}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 text-footnote text-ink-2">
            <span>{profile.storyCount} {profile.storyCount === 1 ? 'story' : 'stories'}</span>
            {profile.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-medium text-tint hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <h2 className="mb-6 mt-10 text-title2 text-ink">Stories by {profile.name}</h2>
      {stories.length ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard
              key={String(story._id)}
              href={`/${story.category.slug}/${story.slug}`}
              title={story.title}
              excerpt={story.excerpt}
              image={story.coverImage}
              meta={story.publishedAt ? formatDate(story.publishedAt) : undefined}
            />
          ))}
        </div>
      ) : (
        <p className="text-body text-ink-2">No published stories are available for this author.</p>
      )}
    </div>
  );
}
