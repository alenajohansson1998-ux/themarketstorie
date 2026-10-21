import { cache } from 'react';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import Article from '@/models/Article';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import Author from '@/models/Author';
import User from '@/models/User';
import ExternalNews from '@/models/ExternalNews';
import Broker from '@/models/Broker';

/**
 * Server-side reads for public pages. Pages render from these directly, so crawlers get the
 * headlines, text and links in the HTML instead of waiting for client-side API calls.
 * Every function returns plain JSON (ObjectIds and Dates become strings) safe to pass to client components.
 * Every function fails soft: on a database error it returns empty data so the page can fall back to client fetching.
 */

// Ensure referenced models are registered before populate().
void User;
void Author;
void Category;
void Tag;

type Plain = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const PUBLIC_USER_FIELDS = 'name image bio facebook linkedin';
const PUBLIC_AUTHOR_FIELDS = 'name slug bio avatar role website linkedin x';

async function connect(): Promise<boolean> {
  try {
    await dbConnect();
    return true;
  } catch (error) {
    console.error('content: database unavailable', error);
    return false;
  }
}

/* ---------- Categories and tags ---------- */

interface HeaderCategory {
  _id: string;
  name: string;
  slug: string;
}

export const getHeaderCategories = cache(async (): Promise<HeaderCategory[]> => {
  if (!(await connect())) return [];
  try {
    const rows = await Category.find({ showInHeader: true }).select('_id name slug').sort({ name: 1 }).lean();
    return rows.map((row) => ({ _id: String(row._id), name: row.name, slug: row.slug }));
  } catch (error) {
    console.error('content: header categories failed', error);
    return [];
  }
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Plain | null> => {
  if (!(await connect())) return null;
  try {
    const row = await Category.findOne({ slug }).select('_id name slug description updatedAt').lean();
    return row ? plain(row) : null;
  } catch {
    return null;
  }
});

export const getTagBySlug = cache(async (slug: string): Promise<(Plain & { postCount: number }) | null> => {
  if (!(await connect())) return null;
  try {
    const tag = await Tag.findOne({ slug: new RegExp(`^${escapeRegex(slug)}$`, 'i') })
      .select('_id name slug description')
      .lean<Plain>();
    if (!tag) return null;
    const postCount = await Post.countDocuments({ tags: tag._id, publicationStatus: 'published' });
    return { ...plain(tag), postCount };
  } catch {
    return null;
  }
});

export const getBrokerBySlug = cache(async (slug: string): Promise<Plain | null> => {
  if (!(await connect())) return null;
  try {
    const broker = await Broker.findOne({ slug }).lean<Plain>();
    return broker ? plain(broker) : null;
  } catch (error) {
    console.error('content: broker lookup failed', error);
    return null;
  }
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ---------- Lists ---------- */

interface PostQuery {
  categorySlug?: string;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  trending?: boolean;
  limit?: number;
  page?: number;
  sort?: string;
  /** Include story HTML only when a server component derives a small value from it. */
  includeContent?: boolean;
}

/** Same shape as GET /api/cms/posts for a public visitor. */
export async function listPosts(query: PostQuery = {}): Promise<{ data: Plain[]; total: number } | null> {
  if (!(await connect())) return null;
  try {
    const limit = query.limit ?? 10;
    const page = Math.max(query.page ?? 1, 1);
    const filter: Plain = { publicationStatus: 'published' };
    if (query.trending !== undefined) filter.trending = query.trending;
    if (query.tagId) filter.tags = query.tagId;
    if (query.authorId) filter.author = query.authorId;
    if (query.categoryId) filter.category = query.categoryId;
    if (query.categorySlug) {
      const category = await getCategoryBySlug(query.categorySlug);
      if (!category) return { data: [], total: 0 };
      filter.category = category._id;
    }
    const [rows, total] = await Promise.all([
      Post.find(filter)
        .select(
          [
            '_id title slug excerpt coverImage category tags author publishedAt updatedAt createdAt views trending',
            query.includeContent ? 'content' : '',
          ]
            .filter(Boolean)
            .join(' ')
        )
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .populate('author', PUBLIC_USER_FIELDS)
        .sort(query.sort || { publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);
    return { data: plain(rows), total };
  } catch (error) {
    console.error('content: listPosts failed', error);
    return null;
  }
}

interface ArticleQuery {
  categorySlug?: string;
  aiOnly?: boolean;
  limit?: number;
  page?: number;
  authorId?: string;
  /** Include story HTML only when a server component derives a small value from it. */
  includeContent?: boolean;
}

/** Same shape as GET /api/articles for a public visitor. */
export async function listArticles(query: ArticleQuery = {}): Promise<{ data: Plain[]; total: number } | null> {
  if (!(await connect())) return null;
  try {
    const limit = query.limit ?? 10;
    const page = Math.max(query.page ?? 1, 1);
    const filter: Plain = { status: 'published' };
    if (query.aiOnly) filter.aiGenerated = true;
    if (query.authorId) filter.author = query.authorId;
    if (query.categorySlug) {
      const category = await getCategoryBySlug(query.categorySlug);
      if (!category) return { data: [], total: 0 };
      filter.category = category._id;
    }
    const [rows, total] = await Promise.all([
      Article.find(filter)
        .select(
          [
            '_id title slug excerpt image category author publishedAt updatedAt createdAt aiGenerated type',
            query.includeContent ? 'content' : '',
          ]
            .filter(Boolean)
            .join(' ')
        )
        .populate('category', 'name slug')
        .populate('author', PUBLIC_AUTHOR_FIELDS)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);
    return { data: plain(rows), total };
  } catch (error) {
    console.error('content: listArticles failed', error);
    return null;
  }
}

/* ---------- Single stories ---------- */

export type StoryRecord =
  | { kind: 'cms'; doc: Plain }
  | { kind: 'ai'; doc: Plain }
  | { kind: 'external'; doc: Plain };

/** Finds a published story by slug, whichever collection it lives in. */
export const getStory = cache(async (slug: string): Promise<StoryRecord | null> => {
  if (!(await connect())) return null;
  try {
    if (/^\d+$/.test(slug)) {
      const external = await ExternalNews.findOne({ externalId: slug, isActive: true }).sort({ fetchedAt: -1 }).lean<Plain>();
      return external ? { kind: 'external', doc: plain(external) } : null;
    }
    const post = await Post.findOne({ slug, publicationStatus: 'published' })
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .populate('author', PUBLIC_USER_FIELDS)
      .lean();
    if (post) return { kind: 'cms', doc: plain(post) };

    const article = await Article.findOne({ slug, status: 'published' })
      .populate('category', 'name slug')
      .populate('author', PUBLIC_AUTHOR_FIELDS)
      .lean();
    if (article) return { kind: 'ai', doc: plain(article) };
    return null;
  } catch (error) {
    console.error('content: getStory failed', error);
    throw error;
  }
});

/** Up to `limit` other stories from the same section, newest first, in the post-list shape. */
export async function getRelatedStories(categorySlug: string, excludeSlug: string, limit = 4): Promise<Plain[]> {
  const [posts, articles] = await Promise.all([
    listPosts({ categorySlug, limit: limit + 1 }),
    listArticles({ categorySlug, limit: limit + 1 }),
  ]);
  const fromArticles = (articles?.data ?? []).map((article) => ({
    _id: article._id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    coverImage: article.image,
    category: article.category,
    author: article.author?.name ? { name: article.author.name } : undefined,
    views: 0,
    publishedAt: article.publishedAt,
    createdAt: article.createdAt,
  }));
  return [...(posts?.data ?? []), ...fromArticles]
    .filter((item) => item.slug !== excludeSlug)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/* ---------- Authors ---------- */

export interface AuthorProfile {
  kind: 'author' | 'user';
  id: string;
  name: string;
  storyCount: number;
  slug?: string;
  bio?: string;
  image?: string;
  role?: string;
  links: { label: string; href: string }[];
  stories: Plain[];
}

/** Resolves /author/[id] for staff/AI authors (Author model) and CMS contributors (User model). */
export const getAuthorProfile = cache(async (idOrSlug: string): Promise<AuthorProfile | null> => {
  if (!(await connect())) return null;
  try {
    const author = await Author.findOne({ slug: idOrSlug }).lean<Plain>();
    if (author) {
      const articles = await listArticles({ authorId: author._id, limit: 30 });
      const links = [
        author.website && { label: 'Website', href: author.website },
        author.linkedin && { label: 'LinkedIn', href: author.linkedin },
        author.x && { label: 'X', href: author.x },
      ].filter(Boolean) as { label: string; href: string }[];
      return {
        kind: 'author',
        id: String(author._id),
        name: author.name,
        slug: author.slug,
        bio: author.bio || undefined,
        image: author.avatar || undefined,
        role: author.role,
        links,
        stories: (articles?.data ?? []).map((article) => ({
          _id: article._id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          coverImage: article.image,
          category: article.category,
          publishedAt: article.publishedAt,
          createdAt: article.publishedAt || article.createdAt,
        })),
        storyCount: articles?.total ?? 0,
      };
    }

    let user: Plain | null = null;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      user = await User.findById(idOrSlug).select(PUBLIC_USER_FIELDS).lean<Plain>();
    }
    if (!user) {
      // Contributors have no slug field; /author/jane-doe resolves from the name.
      const pattern = idOrSlug.trim().replace(/-/g, ' ');
      user = await User.findOne({ name: new RegExp(`^${escapeRegex(pattern)}$`, 'i') })
        .select(PUBLIC_USER_FIELDS)
        .lean<Plain>();
    }
    if (!user) return null;
    const posts = await listPosts({ authorId: user._id, limit: 30 });
    const links = [
      user.facebook && { label: 'Facebook', href: user.facebook },
      user.linkedin && { label: 'LinkedIn', href: user.linkedin },
    ].filter(Boolean) as { label: string; href: string }[];
    return {
      kind: 'user',
      id: String(user._id),
      name: user.name,
      bio: user.bio || undefined,
      image: user.image || undefined,
      links,
      stories: posts?.data ?? [],
      storyCount: posts?.total ?? 0,
    };
  } catch (error) {
    console.error('content: getAuthorProfile failed', error);
    return null;
  }
});
