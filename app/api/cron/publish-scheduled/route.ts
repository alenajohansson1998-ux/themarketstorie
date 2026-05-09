import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.AI_AUTOMATION_SECRET || "";
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const cronHeader = req.headers.get("x-cron-secret") || "";
  return bearer === secret || cronHeader === secret;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const now = new Date();

  const result = await Article.updateMany(
    {
      status: { $in: ["draft", "review"] },
      scheduledAt: { $lte: now, $ne: null },
    },
    {
      $set: { status: "published", publishedAt: now, scheduledAt: null },
    }
  );

  return NextResponse.json({
    success: true,
    published: result.modifiedCount,
    checkedAt: now.toISOString(),
  });
}
