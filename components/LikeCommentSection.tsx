"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Heart, MessageCircle, Send, LogIn } from "lucide-react";

interface CommentItem {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface Props {
  postId: string;
}

export default function LikeCommentSection({ postId }: Props) {
  const { data: session } = useSession();

  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
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
                timestamp: new Date(c.createdAt).toLocaleString(),
              })
            )
          );
        }
      } catch {
        // non-critical — silently ignore
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
      // ignore
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
      setCommentsLoading(true);
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
            timestamp: new Date(data.comment.createdAt).toLocaleString(),
          },
        ]);
        setNewComment("");
      } else {
        setCommentError(data.message || "Failed to post comment.");
      }
    } catch {
      setCommentError("Something went wrong. Please try again.");
    } finally {
      setCommentsLoading(false);
    }
  }

  return (
    <div className="mt-10 border-t border-gray-100 pt-8 space-y-8">

      {/* Like button */}
      <button
        onClick={handleLike}
        disabled={likesLoading || hasLiked}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-sm border ${
          hasLiked
            ? "bg-red-50 border-red-200 text-red-600 cursor-default"
            : "bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500 hover:bg-red-50"
        } disabled:opacity-60`}
      >
        <Heart className={`w-4 h-4 ${hasLiked ? "fill-red-500 text-red-500" : ""}`} />
        {likes} {likes === 1 ? "Like" : "Likes"}
      </button>

      {/* Comments */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <MessageCircle className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-bold text-gray-900">
            Comments <span className="text-gray-400 font-normal text-base">({comments.length})</span>
          </h3>
        </div>

        {/* Comment form */}
        {session?.user ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-bold text-sm">
                {session.user.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  disabled={commentsLoading}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition"
                />
                {commentError && (
                  <p className="mt-1 text-xs text-red-500">{commentError}</p>
                )}
                <button
                  type="submit"
                  disabled={commentsLoading || !newComment.trim()}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition"
                >
                  <Send className="w-4 h-4" />
                  {commentsLoading ? "Posting…" : "Post Comment"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-6 flex items-center gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-4">
            <LogIn className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-sm text-gray-600">
                <button
                  onClick={() => signIn()}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Sign in
                </button>{" "}
                to join the conversation and post a comment.
              </p>
            </div>
          </div>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-500 font-bold text-sm">
                  {comment.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800">{comment.author}</span>
                    <span className="text-xs text-gray-400">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
