'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import LiveTicker from './LiveTicker';
import CategoryBar from './CategoryBar';
import type { NavCategory } from '@/lib/navData';

// Market-facing pages get the ticker; reading pages stay quiet.
const TICKER_PATHS = [/^\/$/, /^\/markets/, /^\/blog/, /^\/category\//, /^\/tag\//, /^\/screener/, /^\/tools/, /^\/crypto-converter/];
const CATEGORY_PATHS = [/^\/$/, /^\/blog/, /^\/category\//, /^\/tag\//];

interface LayoutShellProps {
  children: React.ReactNode;
  /** Rendered on the server and passed through, so it ships as HTML without client JavaScript. */
  footer: React.ReactNode;
  initialCategories?: NavCategory[];
}

export default function LayoutShell({ children, footer, initialCategories = [] }: LayoutShellProps) {
  const pathname = usePathname() || '/';

  // Signed-in app screens keep the light appearance; the public site follows the system.
  const isAdminScreen = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAppScreen = isAdminScreen || pathname.startsWith('/dashboard') || pathname.startsWith('/editor');
  const showTicker = TICKER_PATHS.some((pattern) => pattern.test(pathname));
  const showCategories = CATEGORY_PATHS.some((pattern) => pattern.test(pathname));

  return (
    <div className={`site-root ${isAppScreen ? '' : 'theme-auto'}`}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header />
      {showCategories ? <CategoryBar initialCategories={initialCategories} /> : null}
      {showTicker ? <LiveTicker /> : null}
      <main id="main-content" tabIndex={-1} className="site-main outline-none">
        {children}
      </main>
      {isAdminScreen ? null : footer}
    </div>
  );
}
