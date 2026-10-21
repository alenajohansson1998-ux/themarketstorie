import type { Metadata } from 'next';
import { SITE_LOCALE, SITE_NAME, absoluteUrl, ogImageUrl } from './site';

interface PageMetadataInput {
  /** Page title without the brand; the root layout template appends " | The Market Stories". */
  title: string;
  description: string;
  /** Path on the canonical origin, e.g. "/markets". */
  path: string;
  /** Use the title exactly as given (no brand suffix). */
  absoluteTitle?: boolean;
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  type?: 'website' | 'article' | 'profile';
}

/** Title, description, canonical, robots, Open Graph and Twitter tags for one route. */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  image,
  imageAlt,
  noindex,
  type = 'website',
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const socialTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const imageUrl = image || ogImageUrl(title);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt || title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [imageUrl],
    },
  };
}
