import HeatmapTable from './HeatmapTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forex Heatmap – Global Currency Strength',
  description: 'Compare global currencies in a live matrix. See strength/weakness for EUR, USD, GBP, JPY, CHF, AUD, CNY, CAD, INR. Free, fast, and color-coded.',
};

export default function ForexHeatmapPage() {
  return (
    <main className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">Forex Heatmap – Global Currency Strength</h1>
      <p className="mb-6 text-gray-600">Compare major currencies in a live matrix. Color-coded for strength/weakness. Data updates every 5–10 minutes.</p>
      <HeatmapTable />
    </main>
  );
}
