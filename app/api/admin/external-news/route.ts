import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExternalNews from '@/models/ExternalNews';
import { sanitizeRichHtml } from '@/lib/sanitizeHtml';

/**
 * GET /api/admin/external-news - List external news articles with pagination and filters
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const source = searchParams.get('source') || '';
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || '-publishedAt';

    const query: Record<string, unknown> = {};

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by source
    if (source) {
      query.source = { $regex: source, $options: 'i' };
    }

    // Filter by active status
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const articles = await ExternalNews.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ExternalNews.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: articles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching external news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch external news' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/external-news - Create or update external news article
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const {
      externalId,
      title,
      description,
      content,
      author,
      publishedAt,
      urlToImage,
      source,
      category,
      tags = [],
      url,
      isActive = true,
    } = body;
    const sanitizedDescription = sanitizeRichHtml(description);
    const sanitizedContent = sanitizeRichHtml(content);

    // Validate required fields
    if (!externalId || !title || !sanitizedDescription || !sanitizedContent || !author || !publishedAt || !source || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if article already exists
    const existingArticle = await ExternalNews.findOne({ externalId });

    if (existingArticle) {
      // Update existing article
      existingArticle.title = title;
      existingArticle.description = sanitizedDescription;
      existingArticle.content = sanitizedContent;
      existingArticle.author = author;
      existingArticle.publishedAt = new Date(publishedAt);
      existingArticle.urlToImage = urlToImage;
      existingArticle.source = source;
      existingArticle.category = category;
      existingArticle.tags = tags;
      existingArticle.url = url;
      existingArticle.isActive = isActive;

      await existingArticle.save();

      return NextResponse.json({
        success: true,
        data: existingArticle,
        message: 'External news article updated',
      });
    } else {
      // Create new article
      const article = new ExternalNews({
        externalId,
        title,
        description: sanitizedDescription,
        content: sanitizedContent,
        author,
        publishedAt: new Date(publishedAt),
        urlToImage,
        source,
        category,
        tags,
        url,
        isActive,
        fetchedAt: new Date(),
      });

      await article.save();

      return NextResponse.json(
        { success: true, data: article, message: 'External news article created' },
        { status: 201 }
      );
    }
  } catch (error: unknown) {
    console.error('Error creating/updating external news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create/update external news';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
