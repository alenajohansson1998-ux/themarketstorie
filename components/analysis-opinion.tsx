"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDate } from "@/lib/cms-utils-client"

interface Post {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  author: { name: string }
  createdAt: string
}

/** Analysis & Opinion list. The page supplies the section heading. */
export function AnalysisOpinionSection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = new URLSearchParams({ category: "analysis--opinion", status: "published", limit: "4" })
        const response = await fetch(`/api/cms/posts?${params}`)
        const data = await response.json()
        if (data.success) setPosts(data.data)
        else setError(true)
      } catch (err) {
        setError(true)
        console.error("Error fetching posts:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-20 w-28 shrink-0 animate-pulse rounded-control bg-fill" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-fill" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-fill" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || posts.length === 0) {
    return (
      <p className="text-body text-ink-2">
        {error ? "Analysis is unavailable right now. Try again in a few minutes." : "No analysis published yet."}
      </p>
    )
  }

  return (
    <div>
      <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post._id} className="flex gap-4">
            <div className="h-20 w-28 shrink-0 overflow-hidden rounded-control bg-fill">
              {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <h3 className="text-headline text-ink">
                <Link href={`/analysis--opinion/${post.slug}`} className="line-clamp-2 hover:underline">
                  {post.title}
                </Link>
              </h3>
              <p className="mt-1 line-clamp-2 text-subhead text-ink-2">{post.excerpt}</p>
              <p className="mt-1 text-footnote text-ink-2">
                {post.author?.name} · {formatDate(post.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href="/category/analysis--opinion"
        className="mt-4 inline-flex min-h-11 items-center text-subhead font-medium text-tint hover:underline"
      >
        All analysis and opinion
      </Link>
    </div>
  )
}
