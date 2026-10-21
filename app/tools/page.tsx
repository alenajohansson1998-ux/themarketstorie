import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftRight, CalendarDays, Filter, Globe2, Grid3x3 } from 'lucide-react';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Financial Tools',
  description: 'Explore the stock screener, crypto converter, forex heatmap and other market tools from The Market Stories.',
  path: '/tools',
});

const TOOLS = [
  {
    name: 'Crypto converter',
    href: '/crypto-converter',
    description: 'Convert Bitcoin, Ethereum and 65+ coins into 30+ currencies at live prices.',
    icon: ArrowLeftRight,
  },
  {
    name: 'Forex heatmap',
    href: '/tools/forex-heatmap',
    description: 'See which major currencies are strengthening or weakening, from today back to 2000.',
    icon: Grid3x3,
  },
  {
    name: 'Stock screener',
    href: '/screener',
    description: 'Filter stocks by valuation, performance and fundamentals.',
    icon: Filter,
  },
  {
    name: 'Economic calendar',
    href: '/markets?tab=calendar',
    description: 'This week’s rate decisions, inflation prints and jobs data, by country and importance.',
    icon: CalendarDays,
  },
  {
    name: 'World market globe',
    href: '/markets?tab=world',
    description: 'Today’s move in each country’s main stock market, on an interactive globe.',
    icon: Globe2,
  },
];

export default function ToolsPage() {
  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <header className="mb-10 max-w-3xl">
        <p className="section-label">Tools</p>
        <h1 className="mt-1 text-title1 text-ink">Tools for traders and investors</h1>
        <p className="mt-3 text-title3 font-normal text-ink-2">
          Free converters, maps and screeners built on live market data.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="group flex h-full flex-col rounded-card bg-surface p-6 transition-colors hover:bg-fill"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-control bg-canvas text-ink" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <h2 className="mt-4 text-title3 text-ink">{tool.name}</h2>
                <p className="mt-1.5 flex-1 text-subhead text-ink-2">{tool.description}</p>
                <span className="mt-4 text-subhead font-medium text-tint group-hover:underline">
                  Open {tool.name.toLowerCase()} <span aria-hidden="true">›</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
