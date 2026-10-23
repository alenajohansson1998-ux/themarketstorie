import RadarDashboard, { type RadarView } from '@/components/market-impact/RadarDashboard';
import { getRadarFeed } from '@/lib/market-impact/server';
import { getMarketSnapshot } from '@/lib/market-impact/snapshot';

export const revalidate = 120;

interface MarketsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MarketsPage({ searchParams }: MarketsPageProps) {
  const params = await searchParams;
  const [feed, snapshot] = await Promise.all([getRadarFeed(), getMarketSnapshot()]);
  const requestedView = typeof params.view === 'string' ? params.view : undefined;
  const initialMarketTab = typeof params.tab === 'string' ? params.tab : undefined;
  const views = ['radar', 'companies', 'sectors', 'calendar', 'watchlist', 'terminal'];
  const initialView: RadarView = views.includes(requestedView || '') ? requestedView as RadarView : initialMarketTab ? 'terminal' : 'radar';
  const initialEventSlug = typeof params.event === 'string'
    ? params.event
    : feed.events.find(event => event.impacts.length > 0)?.slug;
  return <RadarDashboard initialFeed={feed} initialSnapshot={snapshot} initialView={initialView} initialEventSlug={initialEventSlug} initialMarketTab={initialMarketTab} initialMarket={params.market === 'global' ? 'global' : 'india'} />;
}
