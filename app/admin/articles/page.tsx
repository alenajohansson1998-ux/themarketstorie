"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Play, Plus, RefreshCw, Search, Sparkles } from "lucide-react";
import { Pagination } from "@/components/CMS/CmsComponents";

type ArticleType = "global" | "crypto" | "commodity" | "business" | "geopolitical";
type ArticleStatus = "draft" | "review" | "published";

interface ArticleItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  type: ArticleType;
  status: ArticleStatus;
  category?: { name?: string; slug?: string };
  author?: { name?: string; slug?: string };
  updatedAt: string;
  publishedAt?: string;
}

interface ApiPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ApiResponse {
  success: boolean;
  data: ArticleItem[];
  pagination: ApiPagination;
  error?: string;
}

interface SummaryCounts {
  total: number;
  draft: number;
  review: number;
  published: number;
}

interface CronRunResponse {
  success?: boolean;
  created?: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  article?: {
    id?: string;
    title?: string;
    slug?: string;
  };
}

const TYPE_OPTIONS: Array<{ label: string; value: ArticleType }> = [
  { label: "Global", value: "global" },
  { label: "Crypto", value: "crypto" },
  { label: "Commodity", value: "commodity" },
  { label: "Business", value: "business" },
  { label: "Geopolitical", value: "geopolitical" },
];

function statusBadge(status: ArticleStatus): string {
  if (status === "published") return "bg-green-100 text-green-700";
  if (status === "review") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function formatType(type: ArticleType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

type ManualCronKind = "global" | "crypto" | "commodity";

const RUN_BUTTON_CLASS =
  "inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-60";

export default function AdminArticlesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ArticleStatus>("");
  const [typeFilter, setTypeFilter] = useState<"" | ArticleType>("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [manualRunLoading, setManualRunLoading] = useState<ManualCronKind | "">("");
  const [notice, setNotice] = useState("");

  const [pagination, setPagination] = useState<ApiPagination>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  });
  const [summary, setSummary] = useState<SummaryCounts>({
    total: 0,
    draft: 0,
    review: 0,
    published: 0,
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(pagination.page));
    params.set("limit", String(pagination.limit));
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("type", typeFilter);
    return params.toString();
  }, [pagination.page, pagination.limit, search, statusFilter, typeFilter]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user?.role !== "admin" && session.user?.role !== "editor")) {
      router.push("/");
    }
  }, [status, session, router]);

  const fetchSummary = useCallback(async () => {
    try {
      const [allRes, draftRes, reviewRes, pubRes] = await Promise.all([
        fetch("/api/articles?limit=1", { cache: "no-store" }),
        fetch("/api/articles?status=draft&limit=1", { cache: "no-store" }),
        fetch("/api/articles?status=review&limit=1", { cache: "no-store" }),
        fetch("/api/articles?status=published&limit=1", { cache: "no-store" }),
      ]);

      const [all, draft, review, published] = await Promise.all([
        allRes.json(),
        draftRes.json(),
        reviewRes.json(),
        pubRes.json(),
      ]);

      setSummary({
        total: all?.pagination?.total ?? 0,
        draft: draft?.pagination?.total ?? 0,
        review: review?.pagination?.total ?? 0,
        published: published?.pagination?.total ?? 0,
      });
    } catch (err) {
      console.error("Failed to fetch article summary", err);
    }
  }, []);

  const fetchArticles = useCallback(async (nextPage?: number) => {
    try {
      setError("");
      if (nextPage === undefined) {
        setRefreshing(true);
      }
      setLoading(true);
      const params = new URLSearchParams(queryString);
      if (typeof nextPage === "number") {
        params.set("page", String(nextPage));
      }

      const res = await fetch(`/api/articles?${params.toString()}`, { cache: "no-store" });
      const payload = (await res.json()) as ApiResponse;

      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Failed to fetch articles");
      }

      setItems(payload.data || []);
      setPagination((prev) => payload.pagination || prev);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch articles";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [queryString]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchArticles();
  }, [status, fetchArticles]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchSummary();
  }, [status, fetchSummary]);

  async function changeStatus(id: string, nextStatus: ArticleStatus) {
    try {
      setActionLoadingId(id);
      setError("");
      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Failed to change article status");
      }

      setItems((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                status: nextStatus,
                publishedAt:
                  nextStatus === "published"
                    ? new Date().toISOString()
                    : item.publishedAt,
              }
            : item
        )
      );

      fetchSummary();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change status";
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function seedCategories() {
    try {
      setSeedLoading(true);
      setError("");
      setNotice("");
      const res = await fetch("/api/articles/categories/seed", {
        method: "POST",
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Failed to seed categories");
      }
      await fetchArticles();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to seed categories";
      setError(message);
    } finally {
      setSeedLoading(false);
    }
  }

  async function runManualCron(kind: ManualCronKind) {
    try {
      setManualRunLoading(kind);
      setError("");
      setNotice("");

      const endpoint =
        kind === "global"
          ? "/api/cron/daily-global-overview?force=1"
          : kind === "crypto"
            ? "/api/cron/daily-crypto-update?force=1"
            : "/api/cron/daily-commodities-geopolitical-report?force=1";

      const label =
        kind === "global"
          ? "Global overview"
          : kind === "crypto"
            ? "Crypto update"
            : "Commodities report";

      const res = await fetch(endpoint, {
        method: "POST",
      });
      const payload = (await res.json()) as CronRunResponse;

      if (!res.ok || !payload.success) {
        throw new Error(payload.error || `Failed to run ${label.toLowerCase()} auto-publish`);
      }

      const title = payload.article?.title?.trim();
      if (payload.created) {
        setNotice(title ? `${label} published: ${title}` : `${label} published.`);
      } else if (payload.skipped) {
        setNotice(payload.reason || `${label} already exists for today.`);
      } else {
        setNotice(`${label} automation completed.`);
      }

      await fetchArticles();
      await fetchSummary();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to run manual auto-publish";
      setError(message);
    } finally {
      setManualRunLoading("");
    }
  }

  if (status === "loading") {
    return (
      <div className="w-full p-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Articles</h1>
          <p className="mt-1 text-slate-600">Draft to Review to Publish workflow</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => runManualCron("global")}
            disabled={Boolean(manualRunLoading)}
            className={RUN_BUTTON_CLASS}
          >
            <Play size={16} />
            {manualRunLoading === "global" ? "Running Global..." : "Run Global Update Now"}
          </button>
          <button
            type="button"
            onClick={() => runManualCron("crypto")}
            disabled={Boolean(manualRunLoading)}
            className={RUN_BUTTON_CLASS}
          >
            <Play size={16} />
            {manualRunLoading === "crypto" ? "Running Crypto..." : "Run Crypto Update Now"}
          </button>
          <button
            type="button"
            onClick={() => runManualCron("commodity")}
            disabled={Boolean(manualRunLoading)}
            className={RUN_BUTTON_CLASS}
          >
            <Play size={16} />
            {manualRunLoading === "commodity" ? "Running Commodity..." : "Run Commodity Report Now"}
          </button>
          <button
            type="button"
            onClick={seedCategories}
            disabled={seedLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <Sparkles size={16} />
            {seedLoading ? "Seeding..." : "Seed Categories"}
          </button>
          <button
            type="button"
            onClick={() => fetchArticles()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={16} />
            New Article
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Draft</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.draft}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Review</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.review}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Published</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.published}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="Search title or excerpt"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter((e.target.value as ArticleStatus) || "");
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="published">Published</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter((e.target.value as ArticleType) || "");
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="">All Types</option>
            {TYPE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-6 text-sm text-slate-600">Loading articles...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No articles found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Updated
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="max-w-[360px]">
                          <Link
                            href={`/admin/articles/${item._id}`}
                            className="font-medium text-slate-900 hover:underline"
                          >
                            {item.title}
                          </Link>
                          <p className="mt-1 truncate text-xs text-slate-500">{item.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{formatType(item.type)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.category?.name || "Unmapped"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {new Date(item.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/articles/${item._id}`}
                            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Open
                          </Link>
                          {item.status === "draft" ? (
                            <button
                              type="button"
                              disabled={actionLoadingId === item._id}
                              onClick={() => changeStatus(item._id, "review")}
                              className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-60"
                            >
                              Send Review
                            </button>
                          ) : null}
                          {item.status === "review" ? (
                            <button
                              type="button"
                              disabled={actionLoadingId === item._id}
                              onClick={() => changeStatus(item._id, "published")}
                              className="rounded-md border border-green-300 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800 hover:bg-green-100 disabled:opacity-60"
                            >
                              Publish
                            </button>
                          ) : null}
                          {item.status === "published" ? (
                            <button
                              type="button"
                              disabled={actionLoadingId === item._id}
                              onClick={() => changeStatus(item._id, "draft")}
                              className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                            >
                              Back to Draft
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 px-4 pb-2">
              <Pagination
                currentPage={pagination.page}
                totalPages={Math.max(pagination.pages, 1)}
                onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
