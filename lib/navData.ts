'use client';

import { useEffect, useState } from 'react';

export interface NavCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface NavLink {
  name: string;
  href: string;
}

interface NavData {
  categories: NavCategory[];
  navItems: NavLink[];
}

interface RawNavItem {
  name: string;
  href: string;
  order?: number;
  isActive?: boolean;
}

const EMPTY: NavData = { categories: [], navItems: [] };

// Fetched once per page load and shared by the header, category bar and menus.
let cache: NavData | null = null;
let inflight: Promise<NavData> | null = null;

async function loadNavData(): Promise<NavData> {
  const [categoriesResult, navResult] = await Promise.allSettled([
    fetch('/api/categories/subheader').then((res) => (res.ok ? res.json() : [])),
    fetch('/api/admin/nav').then((res) => (res.ok ? res.json() : { navItems: [] })),
  ]);

  const categories: NavCategory[] =
    categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value)
      ? categoriesResult.value
      : [];

  const rawNav: RawNavItem[] =
    navResult.status === 'fulfilled' && Array.isArray(navResult.value?.navItems)
      ? navResult.value.navItems
      : [];

  const navItems = rawNav
    .filter((item) => item.isActive)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({ name: item.name, href: item.href }));

  return { categories, navItems };
}

export function useNavData(): NavData {
  const [data, setData] = useState<NavData>(cache ?? EMPTY);

  useEffect(() => {
    if (cache) return;
    let active = true;
    if (!inflight) {
      inflight = loadNavData()
        .then((result) => {
          cache = result;
          return result;
        })
        .catch(() => EMPTY)
        .finally(() => {
          inflight = null;
        });
    }
    inflight.then((result) => {
      if (active) setData(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
