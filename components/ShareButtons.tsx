
"use client";

import { Twitter, Linkedin, Facebook, Send } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
  image?: string;
  excerpt?: string;
  compact?: boolean;
  vertical?: boolean;
}

export default function ShareButtons({ title, url, image, excerpt, compact = false, vertical = false }: ShareButtonsProps) {
  const encodedTitle = encodeURIComponent(title);

  // Use raw URL for Facebook, LinkedIn, etc.
  const rawUrl = url;

  // Caption includes title, image URL, and excerpt
  const caption = `${title}\n${image ? image + "\n" : ""}${excerpt ? excerpt + "\n" : ""}Read more 👉 ${url}`;

  const wrapperClass = compact
    ? vertical
      ? "flex flex-col items-start gap-2 my-0"
      : "flex items-center gap-1 my-0 whitespace-nowrap"
    : "flex flex-wrap items-center gap-3 my-6";
  const labelClass = compact
    ? vertical
      ? "text-sm font-semibold text-gray-600"
      : "text-sm font-semibold text-gray-600 shrink-0"
    : "text-sm font-semibold text-gray-600";

  return (
    <div className={wrapperClass}>
      <span className={labelClass}>Share:</span>

      {/* WhatsApp - visually prioritized */}
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${rawUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-gray-100 hover:bg-green-100 transition shadow"
        aria-label="Share on WhatsApp"
        style={{ order: 1 }}
      >
        <Send className="w-4 h-4 text-black" />
      </a>

      {/* LinkedIn - visually prioritized */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${rawUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition shadow"
        aria-label="Share on LinkedIn"
        style={{ order: 2 }}
      >
        <Linkedin className="w-4 h-4 text-black" />
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${rawUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition"
        aria-label="Share on Facebook"
        style={{ order: 3 }}
      >
        <Facebook className="w-4 h-4 text-black" />
      </a>

      {/* X (Twitter) */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${rawUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-gray-100 hover:bg-black hover:text-white transition"
        aria-label="Share on X"
        style={{ order: 4 }}
      >
        <Twitter className="w-4 h-4 text-black" />
      </a>

    </div>
  );
}
