'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  applyRadarWatchlistMutation, emptyRadarWatchlist, normalizeRadarWatchlist,
  RADAR_BROWSER_WATCHLIST_KEY, RadarWatchlistQueue,
} from '@/lib/market-impact/watchlist';
import type { RadarWatchlistData, RadarWatchlistMutation } from '@/lib/market-impact/watchlist';

interface WatchlistState extends RadarWatchlistData { owner: string; loading: boolean; error: string | null }

export function useRadarWatchlist(): {
  eventSlugs: string[]; entityIds: string[];
  toggleEvent: (slug: string) => Promise<void>; toggleEntity: (id: string) => Promise<void>;
  loading: boolean; error: string | null; scope: 'account' | 'browser';
} {
  const { data: session, status } = useSession();
  const owner = status === 'loading' ? 'loading' : status === 'authenticated' && session?.user?.id ? `account:${session.user.id}` : 'browser';
  const scope = owner.startsWith('account:') ? 'account' : 'browser';
  const queue = useRef<RadarWatchlistQueue | null>(null);
  const [state, setState] = useState<WatchlistState>({ ...emptyRadarWatchlist(), owner: '', loading: true, error: null });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    let currentQueue: RadarWatchlistQueue | null = null;
    queue.current = null;
    if (owner === 'loading') return () => { active = false; controller.abort(); };

    async function initialize() {
      try {
        let initial: RadarWatchlistData;
        if (owner === 'browser') {
          const saved = localStorage.getItem(RADAR_BROWSER_WATCHLIST_KEY);
          try { initial = normalizeRadarWatchlist(saved ? JSON.parse(saved) : null); }
          catch { initial = emptyRadarWatchlist(); }
        } else {
          const response = await fetch('/api/market-impact/watchlist', { cache: 'no-store', credentials: 'same-origin', signal: controller.signal });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Could not load your account watchlist.');
          initial = normalizeRadarWatchlist(result);
        }
        if (!active) return;
        const persist = async (mutation: RadarWatchlistMutation): Promise<RadarWatchlistData> => {
          if (!active) throw new Error('Watchlist account changed.');
          if (owner === 'browser') {
            // Read latest browser state so another tab's follows are preserved.
            const saved = localStorage.getItem(RADAR_BROWSER_WATCHLIST_KEY);
            let current: RadarWatchlistData;
            try { current = normalizeRadarWatchlist(saved ? JSON.parse(saved) : null); }
            catch { current = emptyRadarWatchlist(); }
            const next = applyRadarWatchlistMutation(current, mutation);
            try { localStorage.setItem(RADAR_BROWSER_WATCHLIST_KEY, JSON.stringify(next)); }
            catch { throw new Error('Browser storage is unavailable or full. Your follow was not saved.'); }
            return next;
          }
          const response = await fetch('/api/market-impact/watchlist', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mutation), credentials: 'same-origin', signal: controller.signal,
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Could not save your account watchlist.');
          return normalizeRadarWatchlist(result);
        };
        currentQueue = new RadarWatchlistQueue(initial, persist, (data, error) => {
          if (active) setState({ ...data, owner, loading: false, error });
        });
        queue.current = currentQueue;
        setState({ ...initial, owner, loading: false, error: null });
      } catch (error) {
        if (active) setState({ ...emptyRadarWatchlist(), owner, loading: false, error: error instanceof Error ? error.message : 'Could not load your watchlist.' });
      }
    }
    void initialize();
    return () => {
      active = false;
      controller.abort();
      currentQueue?.dispose();
      if (queue.current === currentQueue) queue.current = null;
    };
  }, [owner]);

  const toggle = useCallback(async (kind: 'event' | 'entity', id: string) => {
    if (state.owner !== owner || state.loading || !queue.current) return;
    await queue.current.toggle(kind, id);
  }, [owner, state.owner, state.loading]);
  const toggleEvent = useCallback((slug: string) => toggle('event', slug), [toggle]);
  const toggleEntity = useCallback((id: string) => toggle('entity', id), [toggle]);
  const visible = state.owner === owner ? state : { ...emptyRadarWatchlist(), loading: true, error: null };
  return { eventSlugs: visible.eventSlugs, entityIds: visible.entityIds, toggleEvent, toggleEntity, loading: visible.loading, error: visible.error, scope };
}
