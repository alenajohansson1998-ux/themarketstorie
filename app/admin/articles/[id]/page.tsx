"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Save } from "lucide-react";
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";

type ArticleType = "global" | "crypto" | "commodity" | "business" | "geopolitical";
type ArticleStatus = "draft" | "review" | "published";

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  type: ArticleType;
  status: ArticleStatus;
  tags: string[];
  image?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  category?: { name?: string; slug?: string };
  author?: { name?: string; slug?: string };
  updatedAt: string;
  publishedAt?: string;
}

interface PublicationLogItem {
  _id: string;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
  actor?: { name?: string; role?: string };
  createdAt: string;
}

const TYPE_OPTIONS: Array<{ label: string; value: ArticleType }> = [
  { label: "Global Market", value: "global" },
  { label: "Crypto Update", value: "crypto" },
  { label: "Commodity Update", value: "commodity" },
  { label: "Business Deal", value: "business" },
  { label: "Geopolitical Impact", value: "geopolitical" },
];

const TINYMCE_API_KEY =
  process.env.NEXT_PUBLIC_TINYMCE_API_KEY ||
  "cqjhaf886qrh4n1is5ihif9u3fv1yr9c17bme0ojdbvb3chw";

const TINYMCE_INIT = {
  height: 520,
  menubar: true,
  branding: false,
  promotion: false,
  plugins: [
    "advlist",
    "autolink",
    "lists",
    "link",
    "image",
    "charmap",
    "preview",
    "anchor",
    "searchreplace",
    "visualblocks",
    "code",
    "fullscreen",
    "insertdatetime",
    "media",
    "table",
    "help",
    "wordcount",
  ],
  toolbar:
    "undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | " +
    "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
    "link image table | removeformat code fullscreen",
  content_style:
    "body { font-family: Inter, Arial, sans-serif; font-size: 17px; line-height: 1.7; } p { margin: 0 0 1em; }",
};

function statusBadge(status: ArticleStatus): string {
  if (status === "published") return "bg-green-100 text-green-700";
  if (status === "review") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export default function AdminArticleDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const articleId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [logs, setLogs] = useState<PublicationLogItem[]>([]);
  const [prompt, setPrompt] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<ArticleType>("global");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const canEdit =
    status === "authenticated" &&
    (session?.user?.role === "admin" || session?.user?.role === "editor");

  const parsedTags = useMemo(
    () =>
      tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [tags]
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!canEdit) {
      router.push("/");
    }
  }, [status, canEdit, router]);

  const fetchArticle = useCallback(async () => {
    if (!articleId) return;
    try {
      setLoading(true);
      setError("");
      const [articleRes, logRes] = await Promise.all([
        fetch(`/api/articles/${articleId}`, { cache: "no-store" }),
        fetch(`/api/articles/${articleId}/logs`, { cache: "no-store" }),
      ]);

      const articlePayload = await articleRes.json();
      const logPayload = await logRes.json();

      if (!articleRes.ok || !articlePayload.success) {
        throw new Error(articlePayload.error || "Failed to load article");
      }

      const item = articlePayload.data as ArticleData;
      setArticle(item);
      setTitle(item.title || "");
      setType(item.type || "global");
      setExcerpt(item.excerpt || "");
      setContent(item.content || "");
      setTags((item.tags || []).join(", "));
      setImage(item.image || "");
      setMetaTitle(item.seo?.metaTitle || "");
      setMetaDescription(item.seo?.metaDescription || "");
      setLogs(logPayload?.success ? logPayload.data || [] : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch article";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    if (status !== "authenticated" || !articleId) return;
    fetchArticle();
  }, [status, articleId, fetchArticle]);

  useEffect(() => {
    if (!type) return;
    let active = true;
    async function loadPrompt() {
      try {
        setPromptLoading(true);
        const res = await fetch(`/api/articles/prompts?type=${type}`, { cache: "no-store" });
        const payload = await res.json();
        if (!active) return;
        if (!res.ok || !payload.success) {
          setPrompt("");
          return;
        }
        setPrompt(payload.data?.prompt || "");
      } catch (err) {
        console.error("Failed to load prompt", err);
      } finally {
        if (active) {
          setPromptLoading(false);
        }
      }
    }
    loadPrompt();
    return () => {
      active = false;
    };
  }, [type]);

  async function saveArticle(targetStatus?: ArticleStatus) {
    if (!articleId) return;
    try {
      setSaving(true);
      setError("");
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          excerpt,
          content,
          tags: parsedTags,
          image,
          status: targetStatus,
          seo: {
            metaTitle,
            metaDescription,
            keywords: parsedTags,
          },
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Failed to save article");
      }

      const updated = payload.data as ArticleData;
      setArticle(updated);
      setTitle(updated.title || "");
      setType(updated.type || "global");
      setExcerpt(updated.excerpt || "");
      setContent(updated.content || "");
      setTags((updated.tags || []).join(", "));
      setImage(updated.image || "");
      setMetaTitle(updated.seo?.metaTitle || "");
      setMetaDescription(updated.seo?.metaDescription || "");

      const logRes = await fetch(`/api/articles/${articleId}/logs`, { cache: "no-store" });
      const logPayload = await logRes.json();
      setLogs(logPayload?.success ? logPayload.data || [] : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save article";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function copyPrompt() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  }

  if (status === "loading" || loading) {
    return <div className="w-full p-8 text-slate-600">Loading article...</div>;
  }

  if (!article) {
    return (
      <div className="w-full space-y-4 p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Article not found"}
        </div>
        <Link
          href="/admin/articles"
          className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadge(article.status)}`}>
              {article.status}
            </span>
            <span className="text-xs text-slate-500">Slug: {article.slug}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{article.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Last updated: {new Date(article.updatedAt).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/articles"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
          <button
            type="button"
            disabled={saving}
            onClick={() => saveArticle("draft")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => saveArticle("review")}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-60"
          >
            Send to Review
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => saveArticle("published")}
            className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-100 disabled:opacity-60"
          >
            Publish
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => saveArticle()}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ArticleType)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              >
                {TYPE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Cover Image URL</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Content (Google-doc style editor)
              </label>
              <div className="overflow-hidden rounded-lg border border-slate-300">
                <TinyMCEEditor
                  apiKey={TINYMCE_API_KEY}
                  value={content}
                  onEditorChange={(value) => setContent(value)}
                  init={TINYMCE_INIT}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">SEO Meta Title</label>
              <input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">SEO Meta Description</label>
              <input
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Prompt</h2>
            <button
              type="button"
              onClick={copyPrompt}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Copy size={14} />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="max-h-[260px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
            {promptLoading ? (
              <p className="text-sm text-slate-500">Loading prompt...</p>
            ) : (
              <pre className="whitespace-pre-wrap text-xs leading-5 text-slate-700">{prompt}</pre>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <h3 className="text-sm font-semibold text-slate-900">Publication Log</h3>
            <div className="mt-2 max-h-[260px] space-y-2 overflow-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-500">No log entries.</p>
              ) : (
                logs.map((log) => (
                  <div key={log._id} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-slate-800">
                      {log.action}
                      {log.fromStatus || log.toStatus
                        ? ` (${log.fromStatus || "-"} -> ${log.toStatus || "-"})`
                        : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{log.note || "No note"}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {log.actor?.name || "System"} • {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
