"use client";

import { useState } from "react";
import { Check, Facebook, Link2, Linkedin, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const buttonClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink transition-colors hover:bg-fill";

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const links = [
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, icon: <MessageCircle className="h-4 w-4" aria-hidden="true" /> },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, icon: <Linkedin className="h-4 w-4" aria-hidden="true" /> },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: <Facebook className="h-4 w-4" aria-hidden="true" /> },
    { label: "Share on X", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, icon: <XIcon /> },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-subhead font-semibold text-ink">Share</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${link.label} (opens in a new tab)`}
          className={buttonClass}
        >
          {link.icon}
        </a>
      ))}
      <button type="button" onClick={copyLink} className={buttonClass} aria-label={copied ? "Link copied" : "Copy link"}>
        {copied ? <Check className="h-4 w-4 text-up" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
