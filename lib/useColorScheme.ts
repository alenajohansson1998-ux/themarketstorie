'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-color-scheme: dark)';

function subscribe(callback: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getSnapshot(): 'light' | 'dark' {
  return window.matchMedia(QUERY).matches ? 'dark' : 'light';
}

function getServerSnapshot(): 'light' | 'dark' {
  return 'light';
}

/**
 * The reader's system appearance. Pass it to third-party widgets (TradingView)
 * so they match the page. Only meaningful on the public site, which follows the system.
 */
export function useColorScheme(): 'light' | 'dark' {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
