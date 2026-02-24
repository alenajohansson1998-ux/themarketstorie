


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
    <main className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Forex Heatmap – Global Currency Strength Overview</h1>
      <section className="mb-8 bg-white rounded-xl shadow p-6 text-gray-800">
        <p className="mb-4">
          The Forex Heatmap displays live forex rates and global currency strength in a visual matrix. It helps users quickly identify strong and weak currencies, monitor forex market trends, and analyze currency pair performance in real time.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2">What This Forex Heatmap Shows</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Live forex heatmap comparing major global currencies</li>
          <li>Currency strength meter based on percentage change</li>
          <li>Real-time forex rates with color-coded momentum</li>
          <li>Clear view of forex market sentiment</li>
          <li>Fast comparison of major and cross currency pairs</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">Currencies Covered</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>US Dollar (USD)</li>
          <li>Euro (EUR)</li>
          <li>British Pound (GBP)</li>
          <li>Japanese Yen (JPY)</li>
          <li>Swiss Franc (CHF)</li>
          <li>Australian Dollar (AUD)</li>
          <li>Canadian Dollar (CAD)</li>
          <li>Chinese Yuan (CNY)</li>
          <li>Indian Rupee (INR)</li>
        </ul>
        <p className="mb-4">Supports analysis of major forex pairs, cross rates, and global currency movements.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Timeframe Analysis</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>1D, 1W, 1M, 3M, 6M</li>
          <li>1Y, YTD, All</li>
        </ul>
        <p className="mb-4">Allows tracking of intraday forex trends, short-term momentum, and long-term currency performance.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">How Traders Use This Forex Tool</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Find the strongest and weakest currencies today</li>
          <li>Confirm forex trend direction</li>
          <li>Monitor currency strength vs weakness</li>
          <li>Analyze forex market momentum across sessions</li>
          <li>Support technical and fundamental analysis</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">Market Session Coverage</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Asian forex session</li>
          <li>European forex session</li>
          <li>US forex session</li>
        </ul>
        <p className="mb-4">Reflects 24-hour global forex market activity.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Data & Update Information</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Live forex market data</li>
          <li>Updates every 5–10 minutes</li>
          <li>Indicative prices for market analysis and education</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">Designed For</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Forex traders</li>
          <li>Currency market analysts</li>
          <li>Investors tracking exchange rates</li>
          <li>Users monitoring global forex markets</li>
        </ul>
      </section>
      <AllRatesClient matrix={matrix} />
      {/* ...existing detailed section retained for extra SEO and user info... */}
      <section className="mt-10 bg-white rounded-xl shadow p-6 text-gray-800">
        <h2 className="text-xl font-bold mb-4">Forex Heatmap – Live Currency Strength & Weakness Tool</h2>
        <p className="mb-4">The Forex Heatmap on TheMarketStories is a visual market analysis tool that displays real-time currency performance across global forex markets. It helps users instantly identify relative strength and weakness between major currencies using color-coded data.</p>
        <h3 className="font-semibold mt-6 mb-2">Key Highlights</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>Real-time comparison of major forex currencies</li>
          <li>Clear visual representation of market momentum</li>
          <li>Color-coded strength and weakness indicators</li>
          <li>Fast market scanning without switching charts</li>
          <li>Clean, professional trading interface</li>
        </ul>
        <h3 className="font-semibold mt-6 mb-2">Currencies Covered</h3>
        <p className="mb-2">The heatmap includes major and actively traded global currencies:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>US Dollar (USD)</li>
          <li>Euro (EUR)</li>
          <li>British Pound (GBP)</li>
          <li>Japanese Yen (JPY)</li>
          <li>Swiss Franc (CHF)</li>
          <li>Australian Dollar (AUD)</li>
          <li>Canadian Dollar (CAD)</li>
          <li>Chinese Yuan (CNY)</li>
          <li>Indian Rupee (INR)</li>
        </ul>
        <h3 className="font-semibold mt-6 mb-2">What the Forex Heatmap Displays</h3>
        <p className="mb-2">Each cell represents the percentage change between a base currency and a quote currency.</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Green cells indicate currency strength</li>
          <li>Red cells indicate currency weakness</li>
          <li>Darker shades show stronger movement</li>
          <li>Lighter shades indicate minimal change</li>
        </ul>
        <p className="mb-4">This allows quick identification of dominant and underperforming currencies.</p>
        <h3 className="font-semibold mt-6 mb-2">How This Tool Is Used</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>Identifying the strongest and weakest currencies</li>
          <li>Confirming trend direction before trades</li>
          <li>Monitoring cross-currency performance</li>
          <li>Observing market-wide sentiment</li>
          <li>Supporting intraday and swing trading decisions</li>
        </ul>
        <h3 className="font-semibold mt-6 mb-2">Supported Market Sessions</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>Asian Session</li>
          <li>European Session</li>
          <li>North American Session</li>
        </ul>
        <p className="mb-4">This helps users track session-based volatility and currency behavior.</p>
        <h3 className="font-semibold mt-6 mb-2">Why Use a Forex Heatmap</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>A complete market overview in one screen</li>
          <li>Faster recognition of currency trends</li>
          <li>Reduced need for multiple charts</li>
          <li>Easier comparison of cross rates</li>
        </ul>
        <h3 className="font-semibold mt-6 mb-2">Ideal For</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>Forex traders and investors</li>
          <li>Market analysts and researchers</li>
          <li>Beginners learning currency dynamics</li>
          <li>Users tracking global financial markets</li>
        </ul>
        <h3 className="font-semibold mt-6 mb-2">Data & Update Information</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>Live forex market data</li>
          <li>Updates every 5–10 minutes</li>
          <li>Reflects short-term currency movement</li>
          <li>Intended for analysis and educational use</li>
        </ul>
        <h3 className="font-semibold mt-6 mb-2">Risk Disclosure</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>Market data may differ from live trading platforms</li>
          <li>Prices are indicative and not trading advice</li>
          <li>Users should apply independent analysis and risk management</li>
        </ul>
        <h3 className="font-semibold mt-6 mb-2">Why Choose TheMarketStories Forex Heatmap</h3>
        <ul className="list-disc ml-6 mb-2">
          <li>Professional-grade currency visualization</li>
          <li>Simple and intuitive design</li>
          <li>Covers global forex markets in one view</li>
          <li>Built for clarity, speed, and usability</li>
        </ul>
      </section>
    </main>
  );
}
