import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExternalNews from '@/models/ExternalNews';

/**
 * GET /api/admin/external-news/[id] - Get a single external news article
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const article = await ExternalNews.findById(id);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'External news article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error('Error fetching external news article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch external news article' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/external-news/[id] - Update an external news article
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const body = await req.json();
    const {
      title,
      description,
      content,
      author,
      publishedAt,
      urlToImage,
      source,
      category,
      tags,
      url,
      isActive,
    } = body;

    const article = await ExternalNews.findById(id);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'External news article not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (title !== undefined) article.title = title;
    if (description !== undefined) article.description = description;
    if (content !== undefined) article.content = content;
    if (author !== undefined) article.author = author;
    if (publishedAt !== undefined) article.publishedAt = new Date(publishedAt);
    if (urlToImage !== undefined) article.urlToImage = urlToImage;
    if (source !== undefined) article.source = source;
    if (category !== undefined) article.category = category;
    if (tags !== undefined) article.tags = tags;
    if (url !== undefined) article.url = url;
    if (isActive !== undefined) article.isActive = isActive;

    await article.save();

    return NextResponse.json({
      success: true,
      data: article,
      message: 'External news article updated',
    });
  } catch (error: any) {
    console.error('Error updating external news article:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update external news article' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/external-news/[id] - Delete an external news article
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const article = await ExternalNews.findByIdAndDelete(id);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'External news article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'External news article deleted',
    });
  } catch (error) {
    console.error('Error deleting external news article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete external news article' },
      { status: 500 }
    );
  }
}
