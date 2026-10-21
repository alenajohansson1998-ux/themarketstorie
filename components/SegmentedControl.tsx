'use client';

import { useRef } from 'react';

export interface Segment {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  label: string;
  segments: Segment[];
  value: string;
  onChange: (id: string) => void;
  /** id prefix used to connect tabs to their panel */
  idPrefix: string;
}

/** Apple-style segmented control with tab semantics and arrow-key navigation. */
export default function SegmentedControl({ label, segments, value, onChange, idPrefix }: SegmentedControlProps) {
  const listRef = useRef<HTMLDivElement>(null);

  function focusTab(index: number) {
    const next = segments[(index + segments.length) % segments.length];
    onChange(next.id);
    requestAnimationFrame(() => {
      listRef.current?.querySelector<HTMLButtonElement>(`#${idPrefix}-tab-${next.id}`)?.focus();
    });
  }

  function handleKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusTab(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusTab(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusTab(segments.length - 1);
    }
  }

  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        className="inline-flex min-w-max gap-0.5 rounded-control bg-fill p-1"
      >
        {segments.map((segment, index) => {
          const selected = segment.id === value;
          return (
            <button
              key={segment.id}
              id={`${idPrefix}-tab-${segment.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(segment.id)}
              onKeyDown={(event) => handleKey(event, index)}
              className={`inline-flex h-9 items-center whitespace-nowrap rounded-md px-4 text-subhead font-medium transition-colors ${
                selected ? 'bg-canvas text-ink shadow-sm' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {segment.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
