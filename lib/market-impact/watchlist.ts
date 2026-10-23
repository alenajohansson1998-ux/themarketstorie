export const MAX_RADAR_FOLLOWS = 100;
export const RADAR_BROWSER_WATCHLIST_KEY = 'tms:radar-watchlist:v1';

export interface RadarWatchlistData { eventSlugs: string[]; entityIds: string[] }
export interface RadarWatchlistMutation { kind: 'event' | 'entity'; id: string; following: boolean }
export const emptyRadarWatchlist = (): RadarWatchlistData => ({ eventSlugs: [], entityIds: [] });

export function validRadarFollowId(kind: 'event' | 'entity', id: unknown): id is string {
  return typeof id === 'string' && id.length <= 120 && (kind === 'event' ? /^[a-z0-9]+(?:-[a-z0-9]+)*$/ : /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/).test(id);
}

export function parseRadarWatchlistMutation(value: unknown): RadarWatchlistMutation {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid watchlist change.');
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !['kind', 'id', 'following'].includes(key)) || (input.kind !== 'event' && input.kind !== 'entity') || !validRadarFollowId(input.kind, input.id) || typeof input.following !== 'boolean') {
    throw new Error('Provide kind, a valid ID and a following boolean.');
  }
  return { kind: input.kind, id: input.id, following: input.following };
}

export function normalizeRadarWatchlist(value: unknown): RadarWatchlistData {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const events = Array.isArray(input.eventSlugs) ? input.eventSlugs : [];
  const entities = Array.isArray(input.entityIds) ? input.entityIds : [];
  const eventSlugs = [...new Set(events.filter((id) => validRadarFollowId('event', id)))].slice(0, MAX_RADAR_FOLLOWS) as string[];
  const entityIds = [...new Set(entities.filter((id) => validRadarFollowId('entity', id)))].slice(0, MAX_RADAR_FOLLOWS - eventSlugs.length) as string[];
  return { eventSlugs, entityIds };
}

export function applyRadarWatchlistMutation(data: RadarWatchlistData, mutation: RadarWatchlistMutation): RadarWatchlistData {
  const field = mutation.kind === 'event' ? 'eventSlugs' : 'entityIds';
  const present = data[field].includes(mutation.id);
  if (mutation.following && !present && data.eventSlugs.length + data.entityIds.length >= MAX_RADAR_FOLLOWS) {
    throw new Error('Your watchlist can hold up to 100 events and entities. Unfollow one to add another.');
  }
  return { ...data, [field]: mutation.following ? present ? data[field] : [...data[field], mutation.id] : data[field].filter((id) => id !== mutation.id) };
}

interface PendingChange { mutation: RadarWatchlistMutation; resolve: () => void }

/** Serial persistence with immediate optimistic state, rollback and identity disposal. */
export class RadarWatchlistQueue {
  private confirmed: RadarWatchlistData;
  private pending: PendingChange[] = [];
  private running = false;
  private disposed = false;
  private error: string | null = null;
  private persist: (mutation: RadarWatchlistMutation) => Promise<RadarWatchlistData>;
  private onChange: (data: RadarWatchlistData, error: string | null) => void;

  constructor(initial: RadarWatchlistData, persist: (mutation: RadarWatchlistMutation) => Promise<RadarWatchlistData>, onChange: (data: RadarWatchlistData, error: string | null) => void) {
    this.confirmed = normalizeRadarWatchlist(initial);
    this.persist = persist;
    this.onChange = onChange;
  }

  snapshot(): RadarWatchlistData {
    return this.pending.reduce((data, change) => {
      try { return applyRadarWatchlistMutation(data, change.mutation); }
      catch { return data; }
    }, this.confirmed);
  }

  toggle(kind: 'event' | 'entity', id: string): Promise<void> {
    if (this.disposed) return Promise.resolve();
    if (!validRadarFollowId(kind, id)) { this.error = 'This item cannot be followed.'; this.emit(); return Promise.resolve(); }
    const state = this.snapshot();
    const mutation = { kind, id, following: !(kind === 'event' ? state.eventSlugs : state.entityIds).includes(id) };
    try { applyRadarWatchlistMutation(state, mutation); }
    catch (error) { this.error = (error as Error).message; this.emit(); return Promise.resolve(); }
    this.error = null;
    const completion = new Promise<void>((resolve) => this.pending.push({ mutation, resolve }));
    this.emit();
    void this.drain();
    return completion;
  }

  dispose(): void {
    this.disposed = true;
    for (const change of this.pending) change.resolve();
    this.pending = [];
  }

  private emit(): void { if (!this.disposed) this.onChange(this.snapshot(), this.error); }

  private async drain(): Promise<void> {
    if (this.running || this.disposed) return;
    this.running = true;
    while (this.pending.length && !this.disposed) {
      const change = this.pending[0];
      try {
        const result = await this.persist(change.mutation);
        if (!this.disposed) this.confirmed = normalizeRadarWatchlist(result);
      } catch (error) {
        if (!this.disposed) this.error = error instanceof Error ? error.message : 'Could not save your watchlist.';
      }
      if (this.disposed) break;
      this.pending.shift();
      change.resolve();
      this.emit();
    }
    this.running = false;
  }
}
