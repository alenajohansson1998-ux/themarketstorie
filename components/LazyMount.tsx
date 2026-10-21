'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyMountProps {
  children: React.ReactNode;
  /** Reserved height while waiting, so nothing shifts when the content mounts. */
  minHeight: number;
  /** How far before the viewport to start mounting. */
  rootMargin?: string;
  label?: string;
}

/** Mounts heavy third-party widgets only when they approach the viewport. */
export default function LazyMount({ children, minHeight, rootMargin = '400px 0px', label }: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    if (typeof IntersectionObserver === 'undefined') {
      const timeout = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timeout);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      aria-busy={!visible}
      style={visible ? undefined : { minHeight }}
    >
      {visible ? children : <div className="h-full w-full animate-pulse rounded-card bg-surface" style={{ minHeight }} />}
    </div>
  );
}
