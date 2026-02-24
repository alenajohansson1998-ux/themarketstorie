import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { authConfig } from "@/auth.config";
import dbConnect from "@/lib/mongodb";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";
import { resolveCategoryIdForType } from "@/lib/articles/categoryMapping";
import {
  isArticleStatus,
  isArticleType,
  ArticleStatus,
} from "@/lib/articles/constants";
import { toSlug } from "@/lib/articles/slug";
import { canManageArticles, logArticleEvent } from "@/lib/articles/workflow";
import Article from "@/models/Article";
import Author from "@/models/Author";
import Category from "@/models/Category";

async function resolveAuthorId(authorId?: string): Promise<string> {
  if (authorId && Types.ObjectId.isValid(authorId)) {
    const existing = await Author.findById(authorId).select("_id").lean();
    if (!existing?._id) {
      throw new Error("Author not found");
    }
    return String(existing._id);
  }

  const aiAuthor = await Author.findOneAndUpdate(
    { slug: "ai-desk" },
    {
      $setOnInsert: {
        name: "AI Desk",
        slug: "ai-desk",
        role: "ai",
        bio: "Automated market coverage with editorial review.",
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  )
    .select("_id")
    .lean();

  return String(aiAuthor._id);
}

async function resolveCategoryId(input: {
  category?: string;
  type: string;
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

  if (!isArticleType(input.type)) {
    return null;
  }

  const mapped = await resolveCategoryIdForType(input.type);
  return mapped ? String(mapped) : null;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authConfig);
    const isPrivileged = canManageArticles(session);
    const { searchParams } = req.nextUrl;

    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 100);
    const search = (searchParams.get("search") || "").trim();
    const slug = (searchParams.get("slug") || "").trim();
    const status = (searchParams.get("status") || "").trim();
    const type = (searchParams.get("type") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const sortBy = (searchParams.get("sort") || "-createdAt").trim();

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    if (slug) {
      query.slug = slug;
    }

    if (isArticleType(type)) {
      query.type = type;
    }

    if (isPrivileged && isArticleStatus(status)) {
      query.status = status;
    }

    if (!isPrivileged) {
      query.status = "published";
    }

    if (category) {
      if (Types.ObjectId.isValid(category)) {
        query.category = new Types.ObjectId(category);
      } else {
        const categoryDoc = await Category.findOne({ slug: category })
          .select("_id")
          .lean();
        if (!categoryDoc?._id) {
          return NextResponse.json({
            success: true,
            data: [],
            pagination: { total: 0, page, limit, pages: 0 },
          });
        }
        query.category = categoryDoc._id;
      }
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Article.find(query)
        .populate("category", "name slug")
        .populate("author", "name slug role avatar")
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!canManageArticles(session)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const slugInput = typeof body.slug === "string" ? body.slug.trim() : "";
    const excerptInput = typeof body.excerpt === "string" ? body.excerpt : "";
    const contentInput = typeof body.content === "string" ? body.content : "";
    const type = typeof body.type === "string" ? body.type : "";
    const image = typeof body.image === "string" ? body.image : "";
    const statusInput = typeof body.status === "string" ? body.status : "";
    const aiGenerated = body.aiGenerated !== false;
    const seo = typeof body.seo === "object" && body.seo ? body.seo : {};

    if (!title || !contentInput || !isArticleType(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "title, content, and valid type are required",
        },
        { status: 400 }
      );
    }

    const content = sanitizeRichHtml(contentInput);
    if (!content.trim()) {
      return NextResponse.json(
        { success: false, error: "Article content is empty after sanitization" },
        { status: 400 }
      );
    }

    const excerpt = excerptInput
      ? sanitizeRichHtml(excerptInput)
      : content.replace(/<[^>]*>/g, " ").trim().slice(0, 220);
    const slug = toSlug(slugInput || title);
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Unable to generate a valid slug" },
        { status: 400 }
      );
    }

    const existingSlug = await Article.findOne({ slug }).select("_id").lean();
    if (existingSlug?._id) {
      return NextResponse.json(
        { success: false, error: "Slug already exists" },
        { status: 400 }
      );
    }

    const categoryId = await resolveCategoryId({ category: body.category, type });
    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Category not found. Create mapped categories first (global-markets, crypto, commodities, business-deals, geopolitics).",
        },
        { status: 400 }
      );
    }

    const authorId = await resolveAuthorId(body.author);
    const tags = Array.isArray(body.tags)
      ? body.tags
          .filter((item: unknown): item is string => typeof item === "string")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];

    const status: ArticleStatus = isArticleStatus(statusInput) ? statusInput : "draft";
    const publishedAt = status === "published" ? new Date() : null;

    const article = await Article.create({
      title,
      slug,
      excerpt,
      content,
      category: categoryId,
      tags,
      type,
      image,
      author: authorId,
      seo: {
        metaTitle: typeof seo.metaTitle === "string" ? seo.metaTitle : "",
        metaDescription:
          typeof seo.metaDescription === "string" ? seo.metaDescription : "",
        keywords: Array.isArray(seo.keywords)
          ? seo.keywords.filter((item: unknown): item is string => typeof item === "string")
          : [],
      },
      status,
      aiGenerated,
      publishedAt,
    });

    await logArticleEvent({
      articleId: String(article._id),
      action: "created",
      session,
      toStatus: status,
      note: "Article created",
      metadata: { type, aiGenerated },
    });

    if (status === "published") {
      await logArticleEvent({
        articleId: String(article._id),
        action: "published",
        session,
        fromStatus: "review",
        toStatus: "published",
        note: "Article published on create",
      });
    }

    const populated = await Article.findById(article._id)
      .populate("category", "name slug")
      .populate("author", "name slug role avatar")
      .lean();

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create article";
    console.error("Error creating article:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
