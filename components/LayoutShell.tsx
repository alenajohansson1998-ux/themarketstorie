'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import LiveTicker from './LiveTicker';
import CategoryBar from './CategoryBar';

// Market-facing pages get the ticker; reading pages stay quiet.
const TICKER_PATHS = [/^\/$/, /^\/markets/, /^\/blog/, /^\/category\//, /^\/tag\//, /^\/screener/, /^\/tools/, /^\/crypto-converter/];
const CATEGORY_PATHS = [/^\/$/, /^\/blog/, /^\/category\//, /^\/tag\//];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';

  if (pathname.startsWith('/admin')) {
    return <div className="site-root">{children}</div>;
  }

  // Signed-in app screens keep the light appearance; the public site follows the system.
  const isAppScreen = pathname.startsWith('/dashboard') || pathname.startsWith('/editor');
  const showTicker = TICKER_PATHS.some((pattern) => pattern.test(pathname));
  const showCategories = CATEGORY_PATHS.some((pattern) => pattern.test(pathname));

  return (
    <div className={`site-root ${isAppScreen ? '' : 'theme-auto'}`}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header />
      {showCategories ? <CategoryBar /> : null}
      {showTicker ? <LiveTicker /> : null}
      <main id="main-content" tabIndex={-1} className="site-main outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
