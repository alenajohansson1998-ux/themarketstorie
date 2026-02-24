// Returns Tailwind color class for a given % change
export function getHeatmapColor(percent: number): string {
  if (percent >= 0.5) return 'bg-green-900 text-white';
  if (percent >= 0.2) return 'bg-green-600 text-white';
  if (percent >= 0.01) return 'bg-green-300 text-black';
  if (percent === 0) return 'bg-gray-100 text-black';
  if (percent <= -0.5) return 'bg-red-900 text-white';
  if (percent <= -0.2) return 'bg-red-600 text-white';
  if (percent <= -0.01) return 'bg-red-300 text-black';
  return 'bg-gray-100 text-black';
}
