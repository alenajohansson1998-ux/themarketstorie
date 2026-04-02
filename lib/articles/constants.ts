export const ARTICLE_TYPES = [
  "global",
  "crypto",
  "commodity",
  "business",
  "geopolitical",
] as const;

export type ArticleType = (typeof ARTICLE_TYPES)[number];

export const ARTICLE_CATEGORY_SLUG_BY_TYPE: Record<ArticleType, string> = {
  global: "global-markets",
  crypto: "crypto",
  commodity: "commodities",
  business: "business-deals",
  geopolitical: "geopolitics",
};

export const ARTICLE_STATUSES = ["draft", "review", "published"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const PUBLICATION_LOG_ACTIONS = [
  "created",
  "updated",
  "status_changed",
  "published",
  "ai_generated",
] as const;

export type PublicationLogAction = (typeof PUBLICATION_LOG_ACTIONS)[number];

export function isArticleType(value: unknown): value is ArticleType {
  return typeof value === "string" && ARTICLE_TYPES.includes(value as ArticleType);
}

export function isArticleStatus(value: unknown): value is ArticleStatus {
  return (
    typeof value === "string" &&
    ARTICLE_STATUSES.includes(value as ArticleStatus)
  );
}
