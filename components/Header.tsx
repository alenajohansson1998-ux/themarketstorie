'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import AuthModal from './AuthModal';
import Logo, { LogoMark } from './Logo';
import { useNavData, type NavLink } from '@/lib/navData';
import { trapFocus, useDismiss, useScrollLock } from '@/lib/useDismiss';

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: { name: string; slug: string };
}

const PRIMARY_NAV: NavLink[] = [
  { name: 'News', href: '/blog' },
  { name: 'Markets', href: '/markets' },
  { name: 'Learn', href: '/learn' },
  { name: 'Brokers', href: '/brokers' },
];

const TOOLS_NAV = [
  { name: 'All Tools', href: '/tools', desc: 'Every converter, map and screener' },
  { name: 'Crypto Converter', href: '/crypto-converter', desc: 'Convert 65+ coins into 30+ currencies' },
  { name: 'Forex Heatmap', href: '/tools/forex-heatmap', desc: 'Currency strength at a glance' },
  { name: 'Stock Screener', href: '/screener', desc: 'Filter stocks by fundamentals' },
];

const SECONDARY_LINKS: NavLink[] = [
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Advertise', href: '/advertise' },
  { name: 'Newsletter', href: '/subscription' },
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
];

const SECONDARY_HREFS = new Set(SECONDARY_LINKS.map((item) => item.href));
const NEWS_PREFIXES = ['/blog', '/category/', '/tag/', '/author/', '/search'];

function isCurrent(pathname: string, href: string) {
  if (href === '/blog') {
    return NEWS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ---------- Search ---------- */

function useArticleSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    setStatus('loading');
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search: trimmed, limit: '5', status: 'published' });
        const response = await fetch(`/api/cms/posts?${params}`, { signal: controller.signal });
        const data = await response.json();
        setResults(data?.success && Array.isArray(data.data) ? data.data : []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setStatus('done');
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return { results, status };
}

function SearchForm({
  id,
  autoFocus,
  onNavigate,
}: {
  id: string;
  autoFocus?: boolean;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { results, status } = useArticleSearch(query);
  const trimmed = query.trim();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    onNavigate();
  }

  return (
    <div>
      <form role="search" onSubmit={submit} className="relative">
        <label htmlFor={id} className="sr-only">
          Search articles
        </label>
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2"
          aria-hidden="true"
        />
        <input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search news, markets and tools"
          autoFocus={autoFocus}
          autoComplete="off"
          className="h-11 w-full rounded-control bg-surface pl-10 pr-4 text-body text-ink placeholder:text-ink-3"
        />
      </form>

      {trimmed.length >= 3 ? (
        <div className="mt-3" aria-live="polite">
          {status === 'loading' && results.length === 0 ? (
            <p className="px-1 py-2 text-subhead text-ink-2">Searching…</p>
          ) : results.length === 0 && status === 'done' ? (
            <p className="px-1 py-2 text-subhead text-ink-2">No articles match “{trimmed}”.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {results.map((post) => (
                <li key={post._id}>
                  <Link
                    href={`/${post.category?.slug ?? 'blog'}/${post.slug}`}
                    onClick={onNavigate}
                    className="block rounded-control px-1 py-3 hover:bg-surface"
                  >
                    {post.category?.name ? (
                      <span className="text-caption font-semibold uppercase tracking-wide text-ink-2">
                        {post.category.name}
                      </span>
                    ) : null}
                    <span className="mt-0.5 block text-headline text-ink">{post.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`/search?q=${encodeURIComponent(trimmed)}`}
            onClick={onNavigate}
            className="mt-2 inline-flex min-h-11 items-center px-1 text-subhead font-medium text-tint hover:underline"
          >
            See all results for “{trimmed}”
          </Link>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Dropdown menu ---------- */

function NavMenu({
  label,
  buttonContent,
  align = 'left',
  current,
  children,
}: {
  label: string;
  buttonContent: React.ReactNode;
  align?: 'left' | 'right';
  current?: boolean;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback((reason?: 'outside' | 'escape') => {
    setOpen(false);
    if (reason === 'escape') buttonRef.current?.focus();
  }, []);

  useDismiss(containerRef, open, close);

  function focusItem(index: number) {
    const items = containerRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]');
    if (!items || items.length === 0) return;
    const next = (index + items.length) % items.length;
    items[next].focus();
  }

  function handleMenuKeys(event: React.KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(containerRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(index - 1);
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={containerRef} onKeyDown={open ? handleMenuKeys : undefined}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => focusItem(0));
          }
        }}
        className={`inline-flex h-11 items-center gap-1 rounded-control px-3 text-subhead font-medium transition-colors hover:text-ink ${
          current || open ? 'text-ink' : 'text-ink/75'
        }`}
      >
        {buttonContent}
      </button>
      {open ? (
        <div
          id={menuId}
          className={`elevated absolute top-full z-50 mt-1 w-72 p-2 ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

const menuItemClass =
  'block rounded-control px-3 py-2.5 text-subhead text-ink hover:bg-surface focus-visible:bg-surface';

/* ---------- Header ---------- */

export default function Header() {
  const pathname = usePathname() || '/';
  const { data: session } = useSession();
  const { navItems, categories } = useNavData();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const desktopSearchId = useId();
  const mobileSearchId = useId();

  const adminNav = navItems.filter((item) => !SECONDARY_HREFS.has(item.href));
  const primaryNav = adminNav.length > 0 ? adminNav : PRIMARY_NAV;
  const toolsCurrent = TOOLS_NAV.some((tool) => isCurrent(pathname, tool.href));

  const closeSearch = useCallback((reason?: 'outside' | 'escape') => {
    setIsSearchOpen(false);
    if (reason === 'escape') searchButtonRef.current?.focus();
  }, []);
  useDismiss(searchRef, isSearchOpen, closeSearch);

  const closeSheet = useCallback(() => {
    setIsSheetOpen(false);
    menuButtonRef.current?.focus();
  }, []);
  useScrollLock(isSheetOpen);

  useEffect(() => {
    if (!isSheetOpen) return;
    // Move focus into the sheet so keyboard and screen-reader users start inside it.
    requestAnimationFrame(() => {
      sheetRef.current?.querySelector<HTMLElement>('button[aria-label="Close menu"]')?.focus();
    });
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') closeSheet();
      else trapFocus(event, sheetRef.current);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isSheetOpen, closeSheet]);

  const user = session?.user;
  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <>
      <header className="nav-material sticky top-0 z-50 border-b border-line-soft">
        <div className="site-shell flex h-13 items-center gap-2 px-4 md:px-6" ref={searchRef}>
          <Link href="/" aria-label="TheMarketStories home" className="mr-2 inline-flex h-11 shrink-0 items-center rounded-control">
            <span className="hidden sm:inline-flex">
              <Logo />
            </span>
            <span className="text-ink sm:hidden">
              <LogoMark />
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden min-w-0 flex-1 items-center md:flex">
            {primaryNav.slice(0, 2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                className="inline-flex h-11 items-center rounded-control px-3 text-subhead font-medium text-ink/75 transition-colors hover:text-ink aria-[current=page]:text-ink"
              >
                {item.name}
              </Link>
            ))}
            <NavMenu
              label="Tools"
              current={toolsCurrent}
              buttonContent={
                <>
                  Tools <ChevronDown size={14} aria-hidden="true" />
                </>
              }
            >
              {(close) => (
                <ul>
                  {TOOLS_NAV.map((tool) => (
                    <li key={tool.href}>
                      <Link href={tool.href} data-menu-item onClick={close} className={menuItemClass}>
                        <span className="block font-medium">{tool.name}</span>
                        <span className="block text-footnote text-ink-2">{tool.desc}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </NavMenu>
            {primaryNav.slice(2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                className="inline-flex h-11 items-center rounded-control px-3 text-subhead font-medium text-ink/75 transition-colors hover:text-ink aria-[current=page]:text-ink"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              ref={searchButtonRef}
              type="button"
              aria-label={isSearchOpen ? 'Close search' : 'Search'}
              aria-expanded={isSearchOpen}
              aria-controls="site-search-panel"
              onClick={() => setIsSearchOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-control text-ink/80 hover:text-ink"
            >
              {isSearchOpen ? <X size={20} aria-hidden="true" /> : <Search size={20} aria-hidden="true" />}
            </button>

            <div className="hidden md:block">
              {user ? (
                <NavMenu
                  label="Account"
                  align="right"
                  buttonContent={
                    user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt="" className="h-8 w-8 rounded-full bg-fill object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fill text-footnote font-semibold text-ink">
                        {initial}
                      </span>
                    )
                  }
                >
                  {(close) => (
                    <>
                      <div className="border-b border-line-soft px-3 pb-2 pt-1">
                        <p className="truncate text-subhead font-semibold text-ink">{user.name}</p>
                        {user.email ? <p className="truncate text-footnote text-ink-2">{user.email}</p> : null}
                      </div>
                      <ul className="pt-1">
                        <li>
                          <Link href="/dashboard" data-menu-item onClick={close} className={menuItemClass}>
                            Dashboard
                          </Link>
                        </li>
                        {user.role === 'admin' ? (
                          <li>
                            <Link href="/admin" data-menu-item onClick={close} className={menuItemClass}>
                              Admin
                            </Link>
                          </li>
                        ) : null}
                        <li>
                          <Link href="/subscription" data-menu-item onClick={close} className={menuItemClass}>
                            Newsletter
                          </Link>
                        </li>
                        <li>
                          <button
                            type="button"
                            data-menu-item
                            onClick={() => {
                              close();
                              signOut();
                            }}
                            className={`${menuItemClass} w-full text-left`}
                          >
                            Sign out
                          </button>
                        </li>
                      </ul>
                    </>
                  )}
                </NavMenu>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex h-11 items-center rounded-control px-3 text-subhead font-medium text-tint hover:text-tint-strong"
                >
                  Sign in
                </button>
              )}
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={isSheetOpen}
              aria-controls="site-menu-sheet"
              onClick={() => {
                setIsSearchOpen(false);
                setIsSheetOpen(true);
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-control text-ink/80 hover:text-ink md:hidden"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>

          {isSearchOpen ? (
            <div
              id="site-search-panel"
              className="absolute inset-x-0 top-full border-b border-line-soft bg-canvas shadow-[0_16px_32px_rgb(0_0_0/0.08)]"
            >
              <div className="mx-auto max-w-2xl px-4 py-5 md:px-6">
                <SearchForm id={desktopSearchId} autoFocus onNavigate={() => setIsSearchOpen(false)} />
              </div>
            </div>
          ) : null}
        </div>
      </header>

      {/* Mobile menu sheet */}
      {isSheetOpen ? (
        <div
          id="site-menu-sheet"
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] overflow-y-auto bg-canvas md:hidden"
        >
          <div className="flex h-13 items-center justify-between border-b border-line-soft px-4">
            <Link href="/" onClick={() => setIsSheetOpen(false)} className="inline-flex h-11 items-center">
              <Logo />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeSheet}
              className="inline-flex h-11 w-11 items-center justify-center rounded-control text-ink"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-8 px-4 pb-12 pt-4">
            <SearchForm id={mobileSearchId} onNavigate={() => setIsSheetOpen(false)} />

            <nav aria-label="Primary">
              <ul className="divide-y divide-line-soft">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsSheetOpen(false)}
                      aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                      className="flex min-h-12 items-center text-title3 text-ink"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <section aria-labelledby="sheet-tools">
              <h2 id="sheet-tools" className="section-label mb-2">
                Tools
              </h2>
              <ul>
                {TOOLS_NAV.map((tool) => (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      onClick={() => setIsSheetOpen(false)}
                      className="flex min-h-11 items-center text-body text-ink"
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {categories.length > 0 ? (
              <section aria-labelledby="sheet-sections">
                <h2 id="sheet-sections" className="section-label mb-2">
                  Sections
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <li key={category._id}>
                      <Link
                        href={`/category/${category.slug}`}
                        onClick={() => setIsSheetOpen(false)}
                        className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-subhead text-ink"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="sheet-account" className="border-t border-line-soft pt-6">
              <h2 id="sheet-account" className="sr-only">
                Account
              </h2>
              {user ? (
                <div className="space-y-1">
                  <p className="text-footnote text-ink-2">Signed in as {user.name}</p>
                  <Link href="/dashboard" onClick={() => setIsSheetOpen(false)} className="flex min-h-11 items-center text-body text-ink">
                    Dashboard
                  </Link>
                  {user.role === 'admin' ? (
                    <Link href="/admin" onClick={() => setIsSheetOpen(false)} className="flex min-h-11 items-center text-body text-ink">
                      Admin
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSheetOpen(false);
                      signOut();
                    }}
                    className="flex min-h-11 items-center text-body text-tint"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSheetOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="inline-flex h-11 w-full items-center justify-center rounded-control bg-ink text-headline text-canvas"
                >
                  Sign in or create account
                </button>
              )}
            </section>

            <ul className="flex flex-wrap gap-x-5 text-subhead text-ink-2">
              {SECONDARY_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setIsSheetOpen(false)} className="inline-flex min-h-11 items-center hover:text-ink">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
