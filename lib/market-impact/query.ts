import { z } from 'zod';
import { RADAR_ASSET_CLASSES, RADAR_CATEGORIES } from './engine';
import type { RadarEvent } from './types';

export const eventQuerySchema = z.object({
  q: z.string().trim().max(120).default(''),
  category: z.enum(RADAR_CATEGORIES).optional(),
  assetClass: z.enum(RADAR_ASSET_CLASSES).optional(),
  region: z.string().trim().max(60).optional(),
  minSignificance: z.coerce.number().int().min(0).max(100).default(0),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(15),
}).refine(query => !query.from || !query.to || Date.parse(query.from) <= Date.parse(query.to), { message: 'from must be before to', path: ['from'] });

export function queryRadarEvents(events: RadarEvent[], query: z.infer<typeof eventQuerySchema>) {
  const search = query.q.toLocaleLowerCase('en-US');
  const filtered = events.filter(event => (!search || `${event.title} ${event.summary} ${event.entities.map(entity => `${entity.name} ${entity.symbol || ''}`).join(' ')}`.toLocaleLowerCase('en-US').includes(search))
    && (!query.category || event.category === query.category)
    && (!query.region || event.region.toLowerCase() === query.region.toLowerCase())
    && (!query.assetClass || event.assetClasses.includes(query.assetClass))
    && event.significance >= query.minSignificance
    && (!query.from || Date.parse(event.publishedAt) >= Date.parse(query.from))
    && (!query.to || Date.parse(event.publishedAt) <= Date.parse(query.to)));
  return { events: filtered.slice((query.page - 1) * query.limit, query.page * query.limit), pagination: { page: query.page, limit: query.limit, total: filtered.length, pages: Math.ceil(filtered.length / query.limit) } };
}
