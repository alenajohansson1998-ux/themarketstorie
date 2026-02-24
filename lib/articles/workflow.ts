import { Session } from "next-auth";
import { ArticleStatus, PublicationLogAction } from "./constants";
import PublicationLog from "@/models/PublicationLog";

export function canManageArticles(session: Session | null): boolean {
  const role = session?.user?.role;
  return role === "admin" || role === "editor";
}

export async function logArticleEvent(input: {
  articleId: string;
  action: PublicationLogAction;
  session: Session | null;
  fromStatus?: ArticleStatus;
  toStatus?: ArticleStatus;
  note?: string;
  metadata?: Record<string, unknown>;
}) {
  await PublicationLog.create({
    article: input.articleId,
    action: input.action,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    note: input.note || "",
    actor: {
      id: input.session?.user?.id || "",
      name: input.session?.user?.name || "",
      role: input.session?.user?.role || "",
    },
    metadata: input.metadata || {},
  });
}
