import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import { generateSlug, validateSEO } from '@/lib/cms-utils-client';
import { sanitizeRichHtml } from '@/lib/sanitizeHtml';

/**
 * GET /api/cms/posts/[id] - Get a single post
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const post = await Post.findById(id)
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .populate('author', 'name email');

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment views for published posts
    if (post.publicationStatus === 'published') {
      post.views = (post.views || 0) + 1;
      await post.save();
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cms/posts/[id] - Update a post (admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug: providedSlug,
      content,
      excerpt,
      coverImage,
      category,
      tags = [],
      status,
      paymentStatus,
      publicationStatus,
      seo = {},
      trending,
    } = body;

    // Validate SEO if provided
    if (seo && Object.keys(seo).length > 0) {
      const seoErrors = validateSEO(seo);
      if (Object.keys(seoErrors).length > 0) {
        return NextResponse.json(
          { success: false, error: 'SEO validation failed', details: seoErrors },
          { status: 400 }
        );
      }
    }

    // Handle slug update
    if (providedSlug && providedSlug !== post.slug) {
      const existingPost = await Post.findOne({ slug: providedSlug, _id: { $ne: id } });
      if (existingPost) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
      post.slug = providedSlug;
    } else if (title && title !== post.title) {
      post.slug = generateSlug(title);
    }

    // Verify category if provided
    if (category && category !== post.category.toString()) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }
      post.category = category;
    }

    // Verify tags if provided
    if (tags && tags.length > 0) {
      const existingTags = await Tag.countDocuments({ _id: { $in: tags } });
      if (existingTags !== tags.length) {
        return NextResponse.json(
          { success: false, error: 'One or more tags not found' },
          { status: 404 }
        );
      }
      post.tags = tags;
    }

    // Update fields
    if (title) post.title = title;
    if (typeof content === 'string') {
      const sanitizedContent = sanitizeRichHtml(content);
      if (!sanitizedContent.trim()) {
        return NextResponse.json(
          { success: false, error: 'Post content is empty after sanitization' },
          { status: 400 }
        );
      }
      post.content = sanitizedContent;
    }
    if (typeof excerpt === 'string') {
      post.excerpt = sanitizeRichHtml(excerpt);
    } else if (excerpt === null) {
      post.excerpt = undefined;
    }
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (status) {
      post.publicationStatus = status;
      if (status === 'published' && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }
    if (paymentStatus === 'pending' || paymentStatus === 'failed' || paymentStatus === 'paid') {
      post.paymentStatus = paymentStatus;
    }
    if (
      publicationStatus === 'draft' ||
      publicationStatus === 'pending_review' ||
      publicationStatus === 'approved' ||
      publicationStatus === 'rejected' ||
      publicationStatus === 'published'
    ) {
      post.publicationStatus = publicationStatus;
      if (publicationStatus === 'published') {
        post.publishedAt = new Date();
      } else if (post.publishedAt) {
        post.publishedAt = undefined;
      }
    }
    if (seo && Object.keys(seo).length > 0) {
      post.seo = { ...post.seo, ...seo };
    }
    if (typeof trending === 'boolean') {
      post.trending = trending;
    }

    await post.save();
    await post.populate('category', 'name slug');
    await post.populate('tags', 'name slug');
    await post.populate('author', 'name email');

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cms/posts/[id] - Delete a post (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
