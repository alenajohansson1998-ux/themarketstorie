import Link from 'next/link';
import { LogoMark } from './Logo';
import { SOCIAL_LINKS } from '@/lib/siteConfig';

const COLUMNS = [
  {
    title: 'Markets',
    links: [
      { name: 'Markets overview', href: '/markets' },
      { name: 'Stock screener', href: '/screener' },
      { name: 'Crypto converter', href: '/crypto-converter' },
      { name: 'Forex heatmap', href: '/tools/forex-heatmap' },
    ],
  },
  {
    title: 'News',
    links: [
      { name: 'Latest news', href: '/blog' },
      { name: 'Stock markets', href: '/category/stock-markets' },
      { name: 'Crypto', href: '/category/crypto' },
      { name: 'Commodities', href: '/category/commodity' },
      { name: 'Analysis & opinion', href: '/category/analysis--opinion' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { name: 'Trading basics', href: '/learn' },
      { name: 'Broker reviews', href: '/brokers' },
      { name: 'All tools', href: '/tools' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About us', href: '/about' },
      { name: 'Advertise', href: '/advertise' },
      { name: 'Contact', href: '/contact' },
      { name: 'Newsletter', href: '/subscription' },
      { name: 'RSS feed', href: '/feed.xml' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Terms', href: '/terms' },
      { name: 'Privacy policy', href: '/privacy' },
      { name: 'Risk disclosure', href: '/risk-disclosure' },
    ],
  },
];



export default function Footer() {
  return (
    <footer className="border-t border-line-soft bg-surface text-footnote text-ink-2">
      <div className="site-shell space-y-8 px-4 py-10 md:px-6">
        <p className="max-w-3xl border-b border-line-soft pb-6">
          Market data may be delayed and is provided for information only. Nothing on TheMarketStories is
          financial advice. Investing involves risk, including the loss of capital.{' '}
          <Link href="/risk-disclosure" className="text-tint hover:underline">
            Read the full risk disclosure
          </Link>
          .
        </p>

        <nav aria-label="Site directory" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="mb-2 text-footnote font-semibold text-ink">{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-9 items-center hover:text-ink hover:underline">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-4 border-t border-line-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-ink">
            <LogoMark className="h-5 w-5" />
            <p className="text-ink-2">
              &copy; {new Date().getFullYear()} TheMarketStories. Independent financial news.
            </p>
          </div>
          <ul className="-ml-3 flex items-center" aria-label="Follow TheMarketStories">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.label} (opens in a new tab)`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-2 hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
                    <path d={social.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
