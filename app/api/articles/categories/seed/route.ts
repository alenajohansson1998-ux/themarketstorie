import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import dbConnect from "@/lib/mongodb";
import { canManageArticles } from "@/lib/articles/workflow";
import { ensureDefaultArticleCategories } from "@/lib/articles/categoryMapping";

export async function POST() {
  try {
    const session = await getServerSession(authConfig);
    if (!canManageArticles(session)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const result = await ensureDefaultArticleCategories();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to seed article categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed article categories" },
      { status: 500 }
    );
  }
}
