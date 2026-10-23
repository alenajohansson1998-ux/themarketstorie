'use client';

import { useId, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu, X } from 'lucide-react';

export interface DashboardNavigationItem {
  label: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

export default function DashboardSidebar({ title, items }: { title: string; items: DashboardNavigationItem[] }) {
  const [open, setOpen] = useState(false);
  const navigationId = useId();

  return (
    <aside className="w-full shrink-0 border-b border-gray-200 bg-white lg:sticky lg:top-[var(--site-header-height)] lg:flex lg:h-[calc(100dvh-var(--site-header-height))] lg:w-60 lg:flex-col lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-4 px-5 py-5 lg:px-6 lg:py-7">
        <div>
          <p className="text-xs font-medium text-gray-500">The Market Stories</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-gray-900">{title}</h2>
        </div>
        <button
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls={navigationId}
          onClick={() => setOpen(!open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <div id={navigationId} className={`${open ? 'flex' : 'hidden'} min-h-0 flex-1 flex-col lg:flex`}>
        <nav aria-label={`${title} navigation`} className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-5">
          {items.map((item) => {
            const className = `flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${item.active ? 'bg-gray-100 text-gray-950' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'}`;
            const content = <><span aria-hidden="true" className="shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]">{item.icon}</span><span>{item.label}</span></>;
            const handleClick = () => { item.onClick?.(); setOpen(false); };
            return item.href ? (
              <Link key={item.label} href={item.href} aria-current={item.active ? 'page' : undefined} onClick={handleClick} className={className}>
                {content}
              </Link>
            ) : (
              <button key={item.label} type="button" aria-pressed={item.active} onClick={handleClick} className={className}>
                {content}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-gray-100 px-3 py-4">
          <Link href="/" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900">
            <ArrowLeft size={18} aria-hidden="true" /> Back to website
          </Link>
        </div>
      </div>
    </aside>
  );
}
