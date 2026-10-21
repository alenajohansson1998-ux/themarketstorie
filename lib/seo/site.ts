import { CONTACT_EMAIL, SOCIAL_LINKS } from '@/lib/siteConfig';

/**
 * Canonical identity of the publication. Canonical URLs and structured data always use the
 * production origin, so preview and local builds never advertise themselves as the canonical site.
 */
export const SITE_URL = 'https://themarketstories.com';
export const SITE_NAME = 'The Market Stories';
export const SITE_ALT_NAME = 'TheMarketStories';
export const SITE_LANGUAGE = 'en';
export const SITE_LOCALE = 'en_US';

export const DEFAULT_TITLE = 'The Market Stories | Financial News & Market Analysis';
export const DEFAULT_DESCRIPTION =
  'Follow global and Indian financial markets, business news, economic developments and technology trends with timely reporting and clear market analysis from The Market Stories.';

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const LOGO_URL = `${SITE_URL}/logo.png`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og`;

export const EDITORIAL_POLICY_PATH = '/editorial-policy';
export const RISK_DISCLOSURE_PATH = '/risk-disclosure';

export const ORGANIZATION_EMAIL = CONTACT_EMAIL;
export const ORGANIZATION_SAME_AS = SOCIAL_LINKS.map((link) => link.href);

/** Absolute URL on the canonical origin. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return clean === '/' ? SITE_URL : `${SITE_URL}${clean}`;
}

/** Dynamic Open Graph image with the page title, for pages without their own image. */
export function ogImageUrl(title?: string, eyebrow?: string): string {
  if (!title) return DEFAULT_OG_IMAGE;
  const params = new URLSearchParams({ title: title.slice(0, 140) });
  if (eyebrow) params.set('eyebrow', eyebrow.slice(0, 40));
  return `${DEFAULT_OG_IMAGE}?${params.toString()}`;
}

/** Plain-text summary trimmed at a word boundary, for meta descriptions. */
export function summarize(text: string | undefined | null, max = 158): string {
  const clean = (text || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, '')}…`;
}
