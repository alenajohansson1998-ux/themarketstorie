import { getRadarSnapshot } from './market-data';
import { getGrowwSnapshot } from './groww';
import type { RadarSnapshot } from './types';

/** Each adapter contains provider failures so a regional outage preserves the other market. */
export async function getMarketSnapshot(): Promise<RadarSnapshot> {
  const [india, global] = await Promise.all([getGrowwSnapshot(), getRadarSnapshot()]);
  return {
    quotes: [...india.quotes, ...global.quotes],
    asOf: new Date().toISOString(),
    providers: [
      ...(india.providers || []),
      { name: 'Yahoo Finance', status: global.quotes.some(quote => quote.price !== null) ? 'available' : 'unavailable' },
    ],
  };
}
