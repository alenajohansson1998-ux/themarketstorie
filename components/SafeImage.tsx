'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface SafeImageProps {
  src?: string;
  alt?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  style?: CSSProperties;
  /** Shown if the image fails. Without one, the image hides and its container's fill shows through. */
  fallbackSrc?: string;
  /** Use Next.js image optimization for public editorial images. */
  optimized?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
}

function isUnauthorizedCloudinaryImage(src: string): boolean {
  try {
    const url = new URL(src, "https://themarketstories.com");
    return url.hostname === "res.cloudinary.com" && url.pathname.startsWith("/drwlimidd/");
  } catch {
    return false;
  }
}

/** <img> that never shows the browser's broken-image icon. */
export default function SafeImage({
  fallbackSrc,
  src,
  alt = '',
  optimized = false,
  width,
  height,
  sizes,
  className,
  loading,
  style,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // A server-rendered image can fail before hydration, when React isn't yet listening for onError.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
      setFailed(true);
    }
  }, [src]);

  if (failed && !fallbackSrc) return null;
  const sourceIsUnavailable = Boolean(src && isUnauthorizedCloudinaryImage(src));
  const resolvedSrc = sourceIsUnavailable
    ? fallbackSrc && !isUnauthorizedCloudinaryImage(fallbackSrc)
      ? fallbackSrc
      : "/herobaner.png"
    : failed
      ? fallbackSrc
      : src;
  if (!resolvedSrc) return null;

  const handleError = () => {
    if (!failed) setFailed(true);
  };

  if (optimized) {
    return (
      <Image
        ref={ref}
        src={resolvedSrc}
        alt={alt}
        width={width ?? 1200}
        height={height ?? 800}
        sizes={sizes ?? '100vw'}
        className={className}
        loading={loading ?? 'lazy'}
        style={style}
        onError={handleError}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading={loading}
      style={style}
      width={width}
      height={height}
      sizes={sizes}
      onError={handleError}
    />
  );
}
