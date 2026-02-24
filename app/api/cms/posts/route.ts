/**
 * PUT /api/cms/posts/[id] - Update paymentStatus or publicationStatus for a post
 */
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid post ID' }, { status: 400 });
    }

    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (body.paymentStatus) update.paymentStatus = body.paymentStatus;
    if (body.publicationStatus) {
      update.publicationStatus = body.publicationStatus;
      if (body.publicationStatus === 'published') {
        update.publishedAt = new Date();
      } else {
        update.publishedAt = null;
      }
    }

    const post = await Post.findByIdAndUpdate(id, update, { new: true })
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .populate('author', 'name email');
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ success: false, error: 'Failed to update post' }, { status: 500 });
  }
}
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import User from '@/models/User';
import { generateSlug, validateSEO } from '@/lib/cms-utils-client';
import { sanitizeRichHtml } from '@/lib/sanitizeHtml';

/**
 * GET /api/cms/posts - List posts with search, filters, and pagination
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authConfig);
    const isPrivilegedUser = session?.user?.role === 'admin' || session?.user?.role === 'editor';

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category') || '';
    const slug = searchParams.get('slug') || '';
    const publicationStatus = searchParams.get('publicationStatus') || searchParams.get('status') || '';
    const authorId = searchParams.get('author') || '';
    const authorSlug = searchParams.get('authorSlug') || '';
    const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || '-createdAt';
    const trending = searchParams.get('trending');

    const query: Record<string, unknown> = {};
    const authorPopulateFields = isPrivilegedUser
      ? 'name email image bio facebook linkedin'
      : 'name image bio facebook linkedin';

    // Search by title
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by slug (for single post page)
    if (slug) {
      query.slug = slug;
    }

    // Filter by category slug (resolve to _id)
    if (categorySlug) {
      const categoryDoc = await Category.findOne({ slug: categorySlug });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // If category not found, return empty result
        return NextResponse.json({ success: true, data: [], pagination: { total: 0, page, limit, pages: 0 } });
      }
    }


    // Filter by publicationStatus
    if (publicationStatus && isPrivilegedUser) {
      query.publicationStatus = publicationStatus;
    }
    if (!isPrivilegedUser) {
      query.publicationStatus = 'published';
    }

    if (trending === 'true' || trending === 'false') {
      query.trending = trending === 'true';
    }

    // Filter by tag(s)
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      // Support multiple tag IDs, comma-separated
      const tagIds = tagsParam.split(',').map((id) => id.trim());
      query.tags = { $in: tagIds };
    }

    // Filter by authorId or authorSlug
    if (authorId) {
      if (!Types.ObjectId.isValid(authorId)) {
        return NextResponse.json({ success: true, data: [], pagination: { total: 0, page, limit, pages: 0 } });
      }
      query.author = new Types.ObjectId(authorId);
    } else if (authorSlug) {
      // Resolve /author/jane-doe style slug from name, since User does not store a slug field.
      const escapedName = authorSlug
        .trim()
        .replace(/-/g, ' ')
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const authorDoc = await User.findOne({
        name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
      }).select('_id');
      if (authorDoc) {
        query.author = authorDoc._id;
      } else {
        // If author not found, return empty result
        return NextResponse.json({ success: true, data: [], pagination: { total: 0, page, limit, pages: 0 } });
      }
    }

    const skip = (page - 1) * limit;

    // If both category and slug are present, this is a single post fetch, so limit = 1
    let posts;
    if (query.slug && query.category) {
      posts = await Post.find(query)
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .populate('author', authorPopulateFields)
        .limit(1)
        .lean();
    } else {
      posts = await Post.find(query)
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .populate('author', authorPopulateFields)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean();
    }

    // Pagination info
    const total = await Post.countDocuments(query);
    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cms/posts - Create a new post
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const {
      title,
      slug: providedSlug,
      content,
      excerpt,
      coverImage,
      category,
      tags = [],
      seo = {},
      trending,
    } = body;

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sanitizedContent = sanitizeRichHtml(content);
    if (!sanitizedContent.trim()) {
      return NextResponse.json(
        { success: false, error: 'Post content is empty after sanitization' },
        { status: 400 }
      );
    }

    // Validate SEO
    const seoErrors = validateSEO(seo);
    if (Object.keys(seoErrors).length > 0) {
      return NextResponse.json(
        { success: false, error: 'SEO validation failed', details: seoErrors },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = providedSlug || generateSlug(title);

    // Check if slug is unique
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Verify tags exist
    if (tags.length > 0) {
      const existingTags = await Tag.countDocuments({ _id: { $in: tags } });
      if (existingTags !== tags.length) {
        return NextResponse.json(
          { success: false, error: 'One or more tags not found' },
          { status: 404 }
        );
      }
    }

    // Determine paymentStatus and publicationStatus and author based on role
    const isAdminOrEditor = session.user.role === 'admin' || session.user.role === 'editor';
    const paymentStatus = isAdminOrEditor ? (body.paymentStatus || 'paid') : 'pending';
    const publicationStatus = isAdminOrEditor ? (body.publicationStatus || 'draft') : 'draft';
    const authorId = session.user.id; // session.user.id is the User _id

    // Verify author exists
    const author = await User.findById(authorId);
    if (!author) {
      return NextResponse.json(
        { success: false, error: 'Author not found' },
        { status: 404 }
      );
    }
    // Enforce post credit limit for editors/authors (not admin)
    if (author.role === 'editor' || author.role === 'user') {
      if (!author.postCredits || author.postCredits <= 0) {
        return NextResponse.json(
          { success: false, error: 'You have no post credits left. Please purchase more to create new posts.' },
          { status: 403 }
        );
      }
    }

    // Create post
    const post = new Post({
      title,
      slug,
      content: sanitizedContent,
      excerpt: excerpt ? sanitizeRichHtml(excerpt) : sanitizedContent.substring(0, 200),
      coverImage,
      category,
      tags,
      author: authorId,
      paymentStatus,
      publicationStatus,
      seo,
      trending: isAdminOrEditor && typeof trending === 'boolean' ? trending : false,
      publishedAt: publicationStatus === 'published' ? new Date() : null,
    });

    await post.save();
    await post.populate('category', 'name slug');
    await post.populate('tags', 'name slug');
    await post.populate('author', 'name email');

    // Decrement post credits for editor/user
    if (author.role === 'editor' || author.role === 'user') {
      author.postCredits = (author.postCredits || 1) - 1;
      await author.save();
    }

    return NextResponse.json(
      { success: true, data: post },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
