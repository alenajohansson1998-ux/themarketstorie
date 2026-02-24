import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Facebook, Linkedin } from 'lucide-react';

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
  const latestPosts = posts.slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Full-width author bio section */}
      <div className="max-w-6xl mx-auto w-full bg-white rounded-2xl shadow-lg p-8 mb-10 flex flex-col items-start">
        <Link href="/" className="text-blue-600 hover:underline text-sm mb-2">&lt; Back to Home</Link>
        <div className="flex items-center gap-6 w-full">
          {authorImage ? (
            <img
              src={authorImage}
              alt={authorName}
              className="w-44 h-44 rounded-full object-cover border border-gray-200 shadow"
            />
          ) : (
            <div className="w-44 h-44 rounded-full bg-orange-500 flex items-center justify-center text-white text-4xl font-bold">
              {authorName.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Blogs by {authorName}</h1>
            {authorBio && (
              <p className="text-gray-700 text-base mb-2 whitespace-pre-line">{authorBio}</p>
            )}
            {(authorFacebook || authorLinkedin) && (
              <div className="flex gap-4 mb-2 items-center">
                {authorFacebook && (
                  <a
                    href={authorFacebook.startsWith('http') ? authorFacebook : `https://${authorFacebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-black hover:font-bold hover:text-black text-sm group"
                  >
                    <Facebook className="w-4 h-4 text-black group-hover:font-bold group-hover:text-black" />
                    Facebook
                  </a>
                )}
                {authorLinkedin && (
                  <a
                    href={authorLinkedin.startsWith('http') ? authorLinkedin : `https://${authorLinkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-black hover:font-bold hover:text-black text-sm group"
                  >
                    <Linkedin className="w-4 h-4 text-black group-hover:font-bold group-hover:text-black" />
                    LinkedIn
                  </a>
                )}
              </div>
            )}
            <span className="text-gray-500 text-sm">Showing {posts.length} post{posts.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Articles and Latest Posts below bio */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-start gap-8">
        <section className="w-full md:max-w-3xl">
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-xl shadow p-6 flex gap-4">
                {post.coverImage && (
                  <div className="w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <Link href={`/${post.category.slug}/${post.slug}`} className="text-lg font-semibold text-blue-700 hover:underline">
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{post.views || 0} views</span>
                  </div>
                  <p className="mt-2 text-gray-700 line-clamp-2">{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Sidebar */}
        <aside className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24" style={{ minHeight: '350px' }}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Latest Posts</h3>
            <div className="space-y-4">
              {latestPosts.map((post) => (
                <div key={post._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <Link href={`/${post.category.slug}/${post.slug}`} className="block hover:text-blue-600 transition-colors">
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">{post.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.views || 0} views</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
