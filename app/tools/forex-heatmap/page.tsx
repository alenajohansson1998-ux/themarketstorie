import HeatmapTable from './HeatmapTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forex Heatmap – Global Currency Strength',
  description: 'Compare global currencies in a live matrix. See strength/weakness for EUR, USD, GBP, JPY, CHF, AUD, CNY, CAD, INR. Free, fast, and color-coded.',
};

export default function ForexHeatmapPage() {
  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12">
      <header className="mb-8 max-w-3xl">
        <p className="section-label">Tools</p>
        <h1 className="mt-1 text-title1 text-ink">Forex heatmap</h1>
        <p className="mt-3 text-title3 font-normal text-ink-2">
          See which major currencies are strengthening or weakening, and by how much.
        </p>
      </header>
      <HeatmapTable />
    </div>
  );
}
