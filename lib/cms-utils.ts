'use server';

/**
 * Server-side only utility functions for CMS
 * These functions can import server-side dependencies like Mongoose
 */

/**
 * Check if a slug is unique (for validation)
 */
export async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const Post = (await import('@/models/Post')).default;
  const query: any = { slug };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const existing = await Post.findOne(query);
  return !existing;
}
