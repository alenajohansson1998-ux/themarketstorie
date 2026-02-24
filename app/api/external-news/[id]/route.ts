import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExternalNews from '@/models/ExternalNews';
import { newsAPI } from '@/lib/api/news';

/**
 * GET /api/external-news/[id] - Get external news article by ID (public endpoint)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    // First, try to get the latest active article with this externalId from database
    const article = await ExternalNews.findOne({ externalId: id, isActive: true })
      .sort({ publishedAt: -1 })
      .exec();

    if (article) {
      // Increment views
      article.views = (article.views || 0) + 1;
      await article.save();

      return NextResponse.json({
        success: true,
        data: {
          id: article.externalId,
          title: article.title,
          description: article.description,
          content: article.content,
          author: article.author,
          publishedAt: article.publishedAt.toISOString(),
          urlToImage: article.urlToImage,
          source: article.source,
          category: article.category,
          tags: article.tags,
          url: article.url,
        },
      });
    }

    // If not in database, try to fetch from API
    const apiArticle = await newsAPI.getNewsById(id);
    if (apiArticle) {
      return NextResponse.json({
        success: true,
        data: apiArticle,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Article not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching external news article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch external news article' },
      { status: 500 }
    );
  }
}
