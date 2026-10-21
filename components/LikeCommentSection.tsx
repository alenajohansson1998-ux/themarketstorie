"use client";

import { useEffect, useId, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Heart } from "lucide-react";

interface CommentItem {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface Props {
  postId: string;
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function LikeCommentSection({ postId }: Props) {
  const { data: session } = useSession();
  const commentFieldId = useId();

  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    if (!postId) return;

    async function load() {
      try {
        const [likesRes, commentsRes] = await Promise.all([
          fetch(`/api/blog/${postId}/likes`),
          fetch(`/api/blog/${postId}/comments`),
        ]);
        const [likesData, commentsData] = await Promise.all([
          likesRes.json().catch(() => ({})),
          commentsRes.json().catch(() => ({})),
        ]);

        if (likesData.success) {
          setLikes(likesData.likes ?? 0);
          setHasLiked(likesData.hasLiked ?? false);
        }
        if (commentsData.success && Array.isArray(commentsData.comments)) {
          setComments(
            commentsData.comments.map(
              (c: { _id: string; userName: string; text: string; createdAt: string }) => ({
                id: c._id,
                author: c.userName,
                text: c.text,
                createdAt: c.createdAt,
              })
            )
          );
        }
      } catch {
        // Likes and comments are optional; the section shows its empty state.
      }
    }

    void load();
  }, [postId]);

  async function handleLike() {
    if (hasLiked || likesLoading) return;
    try {
      setLikesLoading(true);
      const res = await fetch(`/api/blog/${postId}/likes`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setLikes(data.likes);
        setHasLiked(true);
      }
    } catch {
      // Leave the count unchanged.
    } finally {
      setLikesLoading(false);
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!session?.user) {
      signIn();
      return;
    }

    try {
      setCommentError("");
      setPosting(true);
      const res = await fetch(`/api/blog/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [
          ...prev,
          {
            id: data.comment._id,
            author: data.comment.userName,
            text: data.comment.text,
            createdAt: data.comment.createdAt,
          },
        ]);
        setNewComment("");
      } else {
        setCommentError(data.message || "Your comment wasn’t posted. Try again.");
      }
    } catch {
      setCommentError("Your comment wasn’t posted. Check your connection and try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={handleLike}
        disabled={likesLoading || hasLiked}
        aria-pressed={hasLiked}
        className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-subhead font-semibold transition-colors ${
          hasLiked ? "bg-down/10 text-down" : "bg-surface text-ink hover:bg-fill"
        }`}
      >
        <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} aria-hidden="true" />
        {likes} {likes === 1 ? "like" : "likes"}
        <span className="sr-only">{hasLiked ? "(you liked this)" : ""}</span>
      </button>

      <section aria-labelledby={`${commentFieldId}-heading`}>
        <h2 id={`${commentFieldId}-heading`} className="mb-4 text-title3 text-ink">
          Comments <span className="font-normal text-ink-2">{comments.length}</span>
        </h2>

        {session?.user ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <label htmlFor={commentFieldId} className="mb-1.5 block text-footnote font-medium text-ink">
              Add a comment as {session.user.name}
            </label>
            <textarea
              id={commentFieldId}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              disabled={posting}
              className="w-full resize-y rounded-card border border-line bg-canvas px-4 py-3 text-body text-ink placeholder:text-ink-3 focus:border-tint"
            />
            {commentError ? (
              <p role="alert" className="mt-1 text-footnote text-down">
                {commentError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={posting || !newComment.trim()}
              className="mt-2 inline-flex h-11 items-center rounded-control bg-ink px-5 text-headline text-canvas transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {posting ? "Posting…" : "Post comment"}
            </button>
          </form>
        ) : (
          <p className="mb-6 rounded-card bg-surface px-4 py-3 text-subhead text-ink-2">
            <button type="button" onClick={() => signIn()} className="font-semibold text-tint hover:underline">
              Sign in
            </button>{" "}
            to join the conversation.
          </p>
        )}

        {comments.length === 0 ? (
          <p className="text-subhead text-ink-2">No comments yet. Start the conversation.</p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-3 py-4">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fill text-footnote font-semibold text-ink"
                  aria-hidden="true"
                >
                  {comment.author.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-footnote">
                    <span className="font-semibold text-ink">{comment.author}</span>{" "}
                    <time className="text-ink-2" dateTime={comment.createdAt}>
                      {formatTimestamp(comment.createdAt)}
                    </time>
                  </p>
                  <p className="mt-1 whitespace-pre-line text-body text-ink">{comment.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
