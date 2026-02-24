import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { authConfig } from "@/auth.config";
import dbConnect from "@/lib/mongodb";
import { canManageArticles } from "@/lib/articles/workflow";
import Article from "@/models/Article";
import PublicationLog from "@/models/PublicationLog";

async function resolveArticleId(idOrSlug: string): Promise<string | null> {
  if (Types.ObjectId.isValid(idOrSlug)) {
    const found = await Article.findById(idOrSlug).select("_id").lean();
    return found?._id ? String(found._id) : null;
  }

  const found = await Article.findOne({ slug: idOrSlug }).select("_id").lean();
  return found?._id ? String(found._id) : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!canManageArticles(session)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const articleId = await resolveArticleId(id);
    if (!articleId) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    const logs = await PublicationLog.find({ article: articleId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error loading article logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch article logs" },
      { status: 500 }
    );
  }
}
