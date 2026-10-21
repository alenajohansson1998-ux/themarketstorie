'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavData, type NavCategory } from '@/lib/navData';

/** Horizontally scrolling section links. Sits in the page, so it scrolls away with it. */
export default function CategoryBar({ initialCategories = [] }: { initialCategories?: NavCategory[] }) {
  const pathname = usePathname() || '/';
  const { categories: fetched } = useNavData();
  // Server-rendered list first, so the links are in the HTML; client data refreshes it.
  const categories = fetched.length > 0 ? fetched : initialCategories;

  if (categories.length === 0) {
    // Reserve the row's height so content doesn't jump when categories arrive.
    return <div className="h-11 border-b border-line-soft" aria-hidden="true" />;
  }

  return (
    <nav aria-label="Sections" className="border-b border-line-soft">
      <ul className="site-shell no-scrollbar flex h-11 items-center gap-1 overflow-x-auto px-2 md:px-4">
        {categories.map((category) => {
          const href = `/category/${category.slug}`;
          const current = pathname === href;
          return (
            <li key={category._id} className="shrink-0">
              <Link
                href={href}
                aria-current={current ? 'page' : undefined}
                className="inline-flex h-11 items-center rounded-control px-2.5 text-footnote font-medium text-ink-2 transition-colors hover:text-ink aria-[current=page]:text-ink"
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
