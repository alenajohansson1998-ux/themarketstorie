"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
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

export function AnalysisOpinionSection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = new URLSearchParams({
          category: 'analysis--opinion',
          status: 'published',
          limit: '4'
        })
        const response = await fetch(`/api/cms/posts?${params}`)
        const data = await response.json()
        if (data.success) {
          setPosts(data.data)
        } else {
          setError("Failed to fetch posts")
        }
      } catch (err) {
        setError("Failed to fetch posts")
        console.error("Error fetching posts:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Analysis & Opinion</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading posts...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Analysis & Opinion</h2>
        </div>
        <div className="text-red-600 text-center py-8">{error}</div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold">Analysis & Opinion</h2>
        </div>
        <Link href="/category/analysis--opinion" className="text-blue-600 hover:underline text-sm">
          View all posts
        </Link>
      </div>
      <div className="space-y-4">
        {posts.map((post: Post, i: number) => (
          <div key={post._id} className="flex items-start space-x-3 pb-4">
            <div className="w-16 h-12 bg-gray-200 rounded shrink-0 overflow-hidden">
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              )}
            </div>
            <div className="flex-1">
              <Link href={`/analysis--opinion/${post.slug}`}>
                <h3 className="font-medium text-sm leading-tight mb-1 hover:text-blue-600 transition-colors cursor-pointer">
                  {post.title}
                </h3>
              </Link>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{post.author.name}</span>
                <span>•</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
