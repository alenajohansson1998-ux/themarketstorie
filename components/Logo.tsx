interface LogoMarkProps {
  className?: string;
}

/** The "M" mark, drawn in the current text color so it works on light and dark surfaces. */
export function LogoMark({ className = 'h-7 w-7' }: LogoMarkProps) {
  return (
    <svg viewBox="40 40 400 400" className={className} fill="currentColor" aria-hidden="true">
      <path d="M60 58h78l105 172 102-172h75L243 345 123 148v254l-63 13z" />
      <path d="M138 205l60 100v87l-60 10z" />
      <path d="M285 305l60-100v190l-60-10z" />
      <path d="M362 175l58-87v327l-58-7z" />
    </svg>
  );
}

export default function Logo({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-ink">
      <LogoMark />
      {showWordmark ? (
        <span className="text-headline font-semibold tracking-tight">TheMarketStories</span>
      ) : null}
    </span>
  );
}
