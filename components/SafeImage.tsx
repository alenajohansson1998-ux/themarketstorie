'use client';

import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Shown if the image fails. Without one, the image hides and its container's fill shows through. */
  fallbackSrc?: string;
}

/** <img> that never shows the browser's broken-image icon. */
export default function SafeImage({ fallbackSrc, src, alt = '', ...props }: SafeImageProps) {
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

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      ref={ref}
      src={failed ? fallbackSrc : src}
      alt={alt}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}
