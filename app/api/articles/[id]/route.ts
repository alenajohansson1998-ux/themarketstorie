import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { authConfig } from "@/auth.config";
import dbConnect from "@/lib/mongodb";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";
import { resolveCategoryIdForType } from "@/lib/articles/categoryMapping";
import {
  ArticleStatus,
  isArticleStatus,
  isArticleType,
} from "@/lib/articles/constants";
import { toSlug } from "@/lib/articles/slug";
import { canManageArticles, logArticleEvent } from "@/lib/articles/workflow";
import Article from "@/models/Article";
import Author from "@/models/Author";
import Category from "@/models/Category";

function findArticle(idOrSlug: string) {
  if (Types.ObjectId.isValid(idOrSlug)) {
    return Article.findById(idOrSlug);
  }
  return Article.findOne({ slug: idOrSlug });
}

async function resolveAuthorId(authorId?: string): Promise<string | null> {
  if (!authorId) {
    return null;
  }
  if (!Types.ObjectId.isValid(authorId)) {
    return null;
  }
  const existing = await Author.findById(authorId).select("_id").lean();
  return existing?._id ? String(existing._id) : null;
}

async function resolveCategoryId(input: {
  category?: string;
  type?: string;
}): Promise<string | null> {
  if (input.category) {
    if (Types.ObjectId.isValid(input.category)) {
      const existing = await Category.findById(input.category).select("_id").lean();
      return existing?._id ? String(existing._id) : null;
    }
    const bySlug = await Category.findOne({ slug: input.category })
      .select("_id")
      .lean();
    return bySlug?._id ? String(bySlug._id) : null;
  }

  if (input.type && isArticleType(input.type)) {
    const mapped = await resolveCategoryIdForType(input.type);
    return mapped ? String(mapped) : null;
  }

  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    const isPrivileged = canManageArticles(session);
    const { id } = await params;

    await dbConnect();
    const article = await findArticle(id)
      .populate("category", "name slug")
      .populate("author", "name slug role avatar")
      .lean();

    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    if (!isPrivileged && article.status !== "published") {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch article";
    console.error("Error fetching article:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch article",
        ...(process.env.NODE_ENV !== "production" ? { details: message } : {}),
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!canManageArticles(session)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const article = await findArticle(id);
    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    const body = await req.json();
    const previousStatus = article.status;

    if (typeof body.title === "string" && body.title.trim()) {
      article.title = body.title.trim();
    }

    if (typeof body.slug === "string" && body.slug.trim()) {
      const candidateSlug = toSlug(body.slug);
      const existing = await Article.findOne({
        slug: candidateSlug,
        _id: { $ne: article._id },
      })
        .select("_id")
        .lean();
      if (existing?._id) {
        return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 400 });
      }
      article.slug = candidateSlug;
    } else if (typeof body.title === "string") {
      const generated = toSlug(body.title);
      if (generated && generated !== article.slug) {
        const existing = await Article.findOne({
          slug: generated,
          _id: { $ne: article._id },
        })
          .select("_id")
          .lean();
        if (!existing?._id) {
          article.slug = generated;
        }
      }
    }

    if (typeof body.content === "string") {
      const sanitized = sanitizeRichHtml(body.content);
      if (!sanitized.trim()) {
        return NextResponse.json(
          { success: false, error: "Article content is empty after sanitization" },
          { status: 400 }
        );
      }
      article.content = sanitized;
    }

    if (typeof body.excerpt === "string") {
      article.excerpt = sanitizeRichHtml(body.excerpt);
    }

    if (typeof body.image === "string") {
      article.image = body.image;
    }

    if (Array.isArray(body.tags)) {
      article.tags = body.tags
        .filter((item: unknown): item is string => typeof item === "string")
        .map((item: string) => item.trim())
        .filter(Boolean);
    }

    if (typeof body.aiGenerated === "boolean") {
      article.aiGenerated = body.aiGenerated;
    }

    if (typeof body.type === "string") {
      if (!isArticleType(body.type)) {
        return NextResponse.json({ success: false, error: "Invalid article type" }, { status: 400 });
      }
      article.type = body.type;
    }

    if (body.seo && typeof body.seo === "object") {
      article.seo = {
        ...article.seo,
        metaTitle:
          typeof body.seo.metaTitle === "string"
            ? body.seo.metaTitle
            : article.seo?.metaTitle,
        metaDescription:
          typeof body.seo.metaDescription === "string"
            ? body.seo.metaDescription
            : article.seo?.metaDescription,
        keywords: Array.isArray(body.seo.keywords)
          ? body.seo.keywords.filter((item: unknown): item is string => typeof item === "string")
          : article.seo?.keywords,
      };
    }

    if (typeof body.author === "string") {
      const authorId = await resolveAuthorId(body.author);
      if (!authorId) {
        return NextResponse.json({ success: false, error: "Author not found" }, { status: 404 });
      }
      article.author = new Types.ObjectId(authorId);
    }

    const categoryId = await resolveCategoryId({
      category: typeof body.category === "string" ? body.category : undefined,
      type: typeof body.type === "string" ? body.type : undefined,
    });
    if (typeof body.category === "string" && !categoryId) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    if (categoryId) {
      article.category = new Types.ObjectId(categoryId);
    }

    let nextStatus: ArticleStatus | undefined;
    if (typeof body.status === "string") {
      if (!isArticleStatus(body.status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }
      nextStatus = body.status;
      article.status = body.status;
    }

    if (article.status === "published" && !article.publishedAt) {
      article.publishedAt = new Date();
    }
    if (article.status !== "published" && body.status) {
      article.publishedAt = null;
    }

    await article.save();

    await logArticleEvent({
      articleId: String(article._id),
      action: "updated",
      session,
      fromStatus: previousStatus,
      toStatus: article.status,
      note: "Article updated",
    });

    if (nextStatus && nextStatus !== previousStatus) {
      await logArticleEvent({
        articleId: String(article._id),
        action: "status_changed",
        session,
        fromStatus: previousStatus,
        toStatus: nextStatus,
        note: `Status changed from ${previousStatus} to ${nextStatus}`,
      });
    }

    if (previousStatus !== "published" && article.status === "published") {
      await logArticleEvent({
        articleId: String(article._id),
        action: "published",
        session,
        fromStatus: previousStatus,
        toStatus: "published",
        note: "Article published",
      });
    }

    const populated = await Article.findById(article._id)
      .populate("category", "name slug")
      .populate("author", "name slug role avatar")
      .lean();

    return NextResponse.json({ success: true, data: populated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update article";
    console.error("Error updating article:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!canManageArticles(session)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const article = await findArticle(id);
    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    await Article.deleteOne({ _id: article._id });

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
