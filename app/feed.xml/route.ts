import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://themarketstories.com";
const SITE_NAME = "The Market Stories";
const SITE_DESCRIPTION = "Finance & market news — stocks, crypto, commodities, and geopolitics.";
const FEED_LIMIT = 50;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  try {
    await dbConnect();

    const articles = await Article.find({ status: "published" })
      .populate("category", "name slug")
      .populate("author", "name")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(FEED_LIMIT)
      .select("title slug excerpt content image tags category author publishedAt createdAt type")
      .lean();

    const buildDate = new Date().toUTCString();

    const items = articles.map((article) => {
      const cat = article.category as { name?: string; slug?: string } | null;
      const author = article.author as { name?: string } | null;
      const pubDate = (article.publishedAt || article.createdAt) as Date;
      const categorySlug = cat?.slug || article.type || "general";
      const url = `${SITE_URL}/${categorySlug}/${article.slug}`;
      const description = article.excerpt
        ? escapeXml(article.excerpt)
        : escapeXml(stripHtml(article.content as string).slice(0, 220));
      const imageUrl =
        article.image && /^https:\/\//.test(article.image as string) ? article.image : null;

      return `    <item>
      <title>${escapeXml(article.title as string)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <description>${description}</description>
      ${author?.name ? `<author>${escapeXml(author.name)}</author>` : ""}
      ${cat?.name ? `<category>${escapeXml(cat.name)}</category>` : ""}
      ${imageUrl ? `<enclosure url="${escapeXml(imageUrl as string)}" type="image/jpeg" length="0" />` : ""}
    </item>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items.join("\n")}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("RSS feed generation failed:", error);
    return new NextResponse("Failed to generate feed", { status: 500 });
  }
}
