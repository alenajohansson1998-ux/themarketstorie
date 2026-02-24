import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { authConfig } from "@/auth.config";
import dbConnect from "@/lib/mongodb";
import { canManageArticles, logArticleEvent } from "@/lib/articles/workflow";
import Article from "@/models/Article";

interface AutoPublishBody {
  ids?: string[];
  includeDrafts?: boolean;
  dryRun?: boolean;
  limit?: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!canManageArticles(session)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = (await req.json().catch(() => ({}))) as AutoPublishBody;

    const includeDrafts = Boolean(body.includeDrafts);
    const dryRun = Boolean(body.dryRun);
    const limit = Math.min(Math.max(Number(body.limit || 25), 1), 200);

    const statuses = includeDrafts ? ["draft", "review"] : ["review"];
    const query: Record<string, unknown> = {
      status: { $in: statuses },
    };

    if (Array.isArray(body.ids) && body.ids.length > 0) {
      const validIds = body.ids.filter((item) => Types.ObjectId.isValid(item));
      if (!validIds.length) {
        return NextResponse.json(
          { success: false, error: "No valid article ids provided" },
          { status: 400 }
        );
      }
      query._id = { $in: validIds.map((id) => new Types.ObjectId(id)) };
    }

    const candidates = await Article.find(query).sort({ createdAt: 1 }).limit(limit).lean();

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        totalCandidates: candidates.length,
        candidates: candidates.map((item) => ({
          id: String(item._id),
          title: item.title,
          slug: item.slug,
          fromStatus: item.status,
        })),
      });
    }

    if (!candidates.length) {
      return NextResponse.json({
        success: true,
        publishedCount: 0,
        updatedIds: [],
      });
    }

    const targetIds = candidates.map((item) => item._id);
    const now = new Date();

    await Article.updateMany(
      { _id: { $in: targetIds } },
      { $set: { status: "published", publishedAt: now } }
    );

    await Promise.all(
      candidates.map((item) =>
        logArticleEvent({
          articleId: String(item._id),
          action: "published",
          session,
          fromStatus: item.status,
          toStatus: "published",
          note: "Published by auto-publish endpoint",
        })
      )
    );

    return NextResponse.json({
      success: true,
      publishedCount: candidates.length,
      updatedIds: candidates.map((item) => String(item._id)),
    });
  } catch (error) {
    console.error("Auto-publish failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to run auto-publish" },
      { status: 500 }
    );
  }
}
