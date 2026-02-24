import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExternalNews from '@/models/ExternalNews';
import { newsAPI } from '@/lib/api/news';
import { sanitizeRichHtml } from '@/lib/sanitizeHtml';

/**
 * POST /api/admin/external-news/sync - Fetch and sync external news articles from API
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

    const { searchParams } = req.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || undefined;

    // Fetch news from API
    const articles = await newsAPI.getFinancialNews(category, limit);

    let created = 0;
    let errors = 0;

    // Save each article to database
    for (const article of articles) {
      try {
        // Always create a new record so we keep every snapshot/article
        const newArticle = new ExternalNews({
          externalId: article.id,
          title: article.title,
          description: sanitizeRichHtml(article.description || ''),
          content: sanitizeRichHtml(article.content || ''),
          author: article.author,
          publishedAt: new Date(article.publishedAt),
          urlToImage: article.urlToImage,
          source: article.source,
          category: article.category,
          tags: article.tags,
          url: article.url,
          fetchedAt: new Date(),
          isActive: true,
        });
        await newArticle.save();
        created++;
      } catch (error) {
        console.error(`Error saving article ${article.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'External news articles synced',
      stats: {
        total: articles.length,
        created,
        updated: 0,
        errors,
      },
    });
  } catch (error: unknown) {
    console.error('Error syncing external news:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync external news',
      },
      { status: 500 }
    );
  }
}
