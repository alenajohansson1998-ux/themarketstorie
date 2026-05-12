'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import LiveTicker from './LiveTicker';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      {!isAdmin && <LiveTicker />}
      <main className="main-flex">{children}</main>
      {!isAdmin && <Footer className="footer-sticky" />}
    </>
  );
}
