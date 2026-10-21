import Link from 'next/link';
import AllRatesClient from './AllRatesClient';

async function fetchAllRates() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const res = await fetch(`${baseUrl}/api/tools/forex-heatmap?filter=1D`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.matrix || null;
}

export default async function AllRatesPage() {
  const matrix = await fetchAllRates();
  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <header className="mb-8 max-w-3xl">
        <Link href="/tools/forex-heatmap" className="section-label hover:underline">
          Forex heatmap
        </Link>
        <h1 className="mt-1 text-title1 text-ink">All currency rates</h1>
        <p className="mt-3 text-title3 font-normal text-ink-2">
          Today’s change and cross rates for major currencies, grouped by region.
        </p>
      </header>

      <AllRatesClient matrix={matrix} />

      <section className="article-body mt-12 border-t border-line-soft pt-8">
        <h2>Reading the table</h2>
        <p>
          In the heatmap view, each cell shows how much the base currency (row) moved against the quote currency
          (column) today. Green cells mean the base currency strengthened, red means it weakened, and darker shades
          mean bigger moves.
        </p>
        <p>
          In the cross-rates view, each cell shows how many units of the quote currency one unit of the base currency
          buys.
        </p>
        <h3>How traders use it</h3>
        <ul>
          <li>Spot the strongest and weakest currencies in a region</li>
          <li>Confirm a trend before trading an individual pair</li>
          <li>Compare cross rates without switching between charts</li>
        </ul>
        <p>
          Rates are indicative, may differ from trading platforms and are not trading advice. Use your own analysis and
          risk management.
        </p>
      </section>
    </div>
  );
}
