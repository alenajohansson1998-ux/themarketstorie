# Market Impact Radar data setup

The first slice reads real market-news records from Finnhub and current published coverage from the existing `Post` and `Article` collections. It does not use the website's synthetic news fallback.

## Configuration

- `FINNHUB_API_KEY`: server-only Finnhub key. The existing legacy `NEXT_PUBLIC_FINNHUB_KEY` is supported during migration; move it to the server-only name to avoid public exposure in other existing integrations.
- `MONGODB_URI`: the site's existing database connection. No second database or migration is required. Mongoose creates the `marketimpactevents` collection and its slug/source/publication indexes using the existing configuration.
- `NEXT_PUBLIC_SITE_URL`: public canonical site origin used to build links to published Market Stories coverage. The default is `https://themarketstories.com`.

Finnhub endpoint: `GET https://finnhub.io/api/v1/news?category=general`, authenticated in the `X-Finnhub-Token` header. See [Finnhub market-news documentation](https://finnhub.io/docs/api/market-news). The configured account successfully returned real provider records during local verification.

Before public deployment, confirm that the chosen Finnhub account and any upstream news rights permit the intended commercial headline/short-summary display, caching, derived event storage and retention. API access alone does not establish redistribution rights. The module stores bounded provider metadata, a short summary, source URLs and the derived analysis; it never fetches or republishes full third-party articles. Adjust retention to the terms of the selected provider plan. Provider-reported publishers and links are preserved; some provider links point to Google News syndication rather than directly to the publisher.

## Fetching and persistence

Public requests share a five-minute, in-process feed cache and a single in-flight refresh per worker. Finnhub requests have an eight-second timeout, a 1.5 MB response limit and a maximum of 100 validated input records. The combined feed contains at most 60 events. A multi-worker deployment has one cache per worker; use a shared job/cache before scaling provider traffic.

Published local coverage is queried with publication-status and date restrictions. Editorial items, including potentially AI-assisted articles, remain labeled editorial; they are never treated as official confirmation. Only headline and excerpt fields are read for event analysis. Events are sorted by original publication time, so older local articles are not inserted above newer provider news.

Derived event snapshots retain stable slugs by source identifiers and are updated idempotently. When ingestion fails, real stored records remain available with their original source timestamps and degraded provider state. An absent database does not prevent current provider records from rendering, but archived links then cannot be guaranteed. This first slice refreshes on cache expiry when requested; a scheduled ingestion worker, retention/correction workflow and distributed rate limits remain later operational work.

## Analysis limits

Analysis uses explicit, uncalibrated rules; no LLM request is made and no AI-generated explanation is claimed. Category, region, asset and issuer matching use headline cues. Multiple geographic cues are labeled global/unspecified instead of choosing an arbitrary country. A name in a headline does not establish a supplier or competitor relationship. Publication timestamps do not become event-occurrence timestamps.

The impact map currently supports only narrowly matched policy-rate and petroleum channels. The relationship references describe general economic mechanisms, not independent confirmation of the current report or proof of causation:

- [Bank of England: how monetary policy transmits](https://www.bankofengland.co.uk/quarterly-bulletin/2024/2024/about-a-rate-of-general-interest-how-monetary-policy-transmits).
- [U.S. EIA: oil prices and outlook](https://www.eia.gov/energyexplained/oil-and-petroleum-products/prices-and-outlook.php).
- [U.S. EIA: use of oil](https://www.eia.gov/energyexplained/oil-and-petroleum-products/use-of-oil.php).

All impact directions remain uncertain. Significance, evidence confidence and uncertainty are separate heuristic dimensions. No score is a prediction probability. Future calendar events, alerts, autonomous AI analysis and causal market-reaction claims are not implemented by this event module.

## API and verification

- `GET /api/market-impact/events`: `q`, `category`, `region`, `assetClass`, `minSignificance`, ISO `from`/`to`, `page` and `limit` (1–60). Invalid filters return 400; empty pages are valid.
- `GET /api/market-impact/events/[slug]`: current or persisted event. Invalid slugs return 400 and absent events return 404. Both endpoints are public, read-only and emit public cache headers.
- `node --test tests/market-impact-events.test.mjs`: normalization, URL/date validation, deduplication, entity/region matching, scoring, source attribution and pagination. Test fixture headlines are explicitly hypothetical and never used in production.
