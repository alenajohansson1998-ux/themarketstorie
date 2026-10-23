export type RadarView = 'radar' | 'companies' | 'sectors' | 'calendar' | 'watchlist' | 'terminal';

/** Keep the visible workspace, selected event, and terminal instrument deep-linkable. */
export function radarLocation(current: string, view: RadarView, terminalTab = 'indices', eventSlug?: string) {
  const url = new URL(current);
  if (view === 'radar') url.searchParams.delete('view');
  else url.searchParams.set('view', view);
  if (view === 'terminal' && terminalTab !== 'indices') url.searchParams.set('tab', terminalTab);
  else url.searchParams.delete('tab');
  if (eventSlug !== undefined) {
    if (eventSlug) url.searchParams.set('event', eventSlug);
    else url.searchParams.delete('event');
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
