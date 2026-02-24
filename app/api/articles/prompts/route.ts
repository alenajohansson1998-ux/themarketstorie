import { NextRequest, NextResponse } from "next/server";
import { isArticleType } from "@/lib/articles/constants";
import { getAllArticlePrompts, getArticlePrompt } from "@/lib/articles/prompts";

export async function GET(req: NextRequest) {
  const typeParam = (req.nextUrl.searchParams.get("type") || "").trim();

  if (!typeParam) {
    return NextResponse.json({ success: true, data: getAllArticlePrompts() });
  }

  if (!isArticleType(typeParam)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid type. Use global, crypto, commodity, business, or geopolitical.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { type: typeParam, prompt: getArticlePrompt(typeParam) },
  });
}
