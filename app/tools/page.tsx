import type { Metadata } from 'next';
import HeatmapTableClient from "./HeatmapTableClient";

export const metadata: Metadata = {
  title: 'Financial Tools | Forex Heatmap, Stock Screener & More',
  description: 'Explore powerful financial tools on The Market Stories — live Forex heatmap, stock screener, crypto converter, and market analysis tools for traders and investors.',
  alternates: { canonical: 'https://themarketstories.com/tools' },
  openGraph: {
    title: 'Financial Tools | The Market Stories',
    description: 'Live Forex heatmap, stock screener, crypto converter and more.',
    url: 'https://themarketstories.com/tools',
    siteName: 'The Market Stories',
    type: 'website',
  },
};

export default function ToolsPage() {
  return (
    <main className="site-container px-4 md:px-6 xl:px-8 py-8">
      <h1 className="text-2xl font-bold mb-4">Tools</h1>
      <p className="mb-6">Welcome to the Tools page. Explore our live Forex Heatmap below.</p>
      <section className="mb-12">
        <HeatmapTableClient />
      </section>
    </main>
  );
}