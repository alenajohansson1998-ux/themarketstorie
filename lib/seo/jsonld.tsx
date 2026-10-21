import {
  EDITORIAL_POLICY_PATH,
  LOGO_URL,
  ORGANIZATION_EMAIL,
  ORGANIZATION_ID,
  ORGANIZATION_SAME_AS,
  SITE_ALT_NAME,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
  absoluteUrl,
} from './site';

type JsonLdObject = Record<string, unknown>;

/**
 * Renders one JSON-LD block. "<" is escaped so content from the CMS can never close the script tag.
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const json = JSON.stringify(Array.isArray(data) ? { '@context': 'https://schema.org', '@graph': data } : data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, '\\u003c') }}
    />
  );
}

/** The publisher. Every other node points at it by @id. */
export function organizationSchema(): JsonLdObject {
  return {
    '@type': 'NewsMediaOrganization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: SITE_ALT_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: LOGO_URL, width: 512, height: 512 },
    email: ORGANIZATION_EMAIL,
    sameAs: ORGANIZATION_SAME_AS,
    publishingPrinciples: absoluteUrl(EDITORIAL_POLICY_PATH),
    correctionsPolicy: absoluteUrl(`${EDITORIAL_POLICY_PATH}#corrections`),
    actionableFeedbackPolicy: absoluteUrl(`${EDITORIAL_POLICY_PATH}#corrections`),
  };
}

export function websiteSchema(): JsonLdObject {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: SITE_ALT_NAME,
    inLanguage: SITE_LANGUAGE,
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function webPageSchema({
  path,
  name,
  description,
  type = 'WebPage',
  extra = {},
}: {
  path: string;
  name: string;
  description: string;
  type?: string;
  extra?: JsonLdObject;
}): JsonLdObject {
  const url = absoluteUrl(path);
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: SITE_LANGUAGE,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    ...extra,
  };
}

export interface Crumb {
  name: string;
  path: string;
}

/** Only use where the same trail is visible on the page. */
export function breadcrumbSchema(crumbs: Crumb[]): JsonLdObject {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function itemListSchema(urls: string[]): JsonLdObject {
  return {
    '@type': 'ItemList',
    itemListElement: urls.map((url, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: absoluteUrl(url),
    })),
  };
}

export interface ArticleSchemaInput {
  path: string;
  headline: string;
  description: string;
  images: string[];
  datePublished?: string;
  dateModified?: string;
  section?: string;
  keywords?: string[];
  author: { name: string; path?: string; isOrganization?: boolean };
  type?: 'NewsArticle' | 'Article' | 'BlogPosting' | 'OpinionNewsArticle' | 'AnalysisNewsArticle';
  wordCount?: number;
}

export function articleSchema(input: ArticleSchemaInput): JsonLdObject {
  const url = absoluteUrl(input.path);
  const author = input.author.isOrganization
    ? { '@id': ORGANIZATION_ID }
    : {
        '@type': 'Person',
        name: input.author.name,
        ...(input.author.path ? { url: absoluteUrl(input.author.path) } : {}),
      };

  return {
    '@type': input.type || 'NewsArticle',
    '@id': `${url}#article`,
    headline: input.headline.length > 110 ? `${input.headline.slice(0, 107).trimEnd()}…` : input.headline,
    description: input.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(input.images.length > 0 ? { image: input.images } : {}),
    // Dates are only emitted when the CMS has them; never synthesised.
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    author,
    publisher: { '@id': ORGANIZATION_ID },
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: SITE_LANGUAGE,
    isAccessibleForFree: true,
    ...(input.section ? { articleSection: input.section } : {}),
    ...(input.keywords && input.keywords.length > 0 ? { keywords: input.keywords.join(', ') } : {}),
    ...(input.wordCount ? { wordCount: input.wordCount } : {}),
  };
}
