import mongoose from "mongoose";
import Category from "@/models/Category";
import { ArticleType, ARTICLE_CATEGORY_SLUG_BY_TYPE } from "./constants";

export const CATEGORY_SLUG_BY_TYPE = ARTICLE_CATEGORY_SLUG_BY_TYPE;

export const DEFAULT_ARTICLE_CATEGORIES = [
  { name: "Global Markets", slug: CATEGORY_SLUG_BY_TYPE.global },
  { name: "Crypto", slug: CATEGORY_SLUG_BY_TYPE.crypto },
  { name: "Commodities", slug: CATEGORY_SLUG_BY_TYPE.commodity },
  { name: "Business Deals", slug: CATEGORY_SLUG_BY_TYPE.business },
  { name: "Geopolitics", slug: CATEGORY_SLUG_BY_TYPE.geopolitical },
] as const;

export async function resolveCategoryIdForType(
  type: ArticleType
): Promise<mongoose.Types.ObjectId | null> {
  const slug = CATEGORY_SLUG_BY_TYPE[type];
  const category = await Category.findOne({ slug }).select("_id").lean();
  if (!category?._id) {
    return null;
  }
  return category._id as mongoose.Types.ObjectId;
}

export async function ensureDefaultArticleCategories() {
  const created: string[] = [];
  const existing: string[] = [];

  for (const item of DEFAULT_ARTICLE_CATEGORIES) {
    const found = await Category.findOne({ slug: item.slug }).select("_id").lean();
    if (found) {
      existing.push(item.slug);
      continue;
    }

    await Category.create({
      name: item.name,
      slug: item.slug,
      description: `${item.name} updates and analysis.`,
      showInHeader: true,
      isMainHeader: false,
    });
    created.push(item.slug);
  }

  return { created, existing };
}
