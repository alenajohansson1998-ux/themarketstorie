// Cell color for a % change, from the up/down tokens so it works in light and dark.
export function getHeatmapColor(percent: number): string {
  if (percent >= 0.5) return 'bg-up text-canvas';
  if (percent >= 0.2) return 'bg-up/45 text-ink';
  if (percent >= 0.01) return 'bg-up/15 text-ink';
  if (percent <= -0.5) return 'bg-down text-canvas';
  if (percent <= -0.2) return 'bg-down/45 text-ink';
  if (percent <= -0.01) return 'bg-down/15 text-ink';
  return 'bg-fill text-ink';
}

export function formatPercent(percent: number): string {
  const sign = percent > 0 ? '+' : percent < 0 ? '−' : '';
  return `${sign}${Math.abs(percent).toFixed(2)}%`;
}
