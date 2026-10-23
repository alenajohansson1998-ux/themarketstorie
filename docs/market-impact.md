# Market Impact Radar

The existing `/markets` route is now the main intelligence workspace. `/market-impact`
redirects to it. No new dependencies were installed.

## Implemented

- Real, traceable Finnhub event reporting and published site coverage, normalized and
  deduplicated into a bounded feed with original publisher URLs and timestamps.
- Filters for event type, region, asset class, publication window, significance and
  search. Event selections and terminal tabs have shareable query URLs.
- Interactive SVG impact networks: direct/indirect exposures, search, zoom, pan,
  branch visibility, keyboard controls, evidence references and alternative outcomes.
- Six Indian stocks/indices from Groww, with a switch to six global observations
  from Yahoo Finance. India is the default snapshot; stocks use INR, index levels
  use points, and timestamps use IST. Both providers supply actual observations
  and historical price series.
  ETF/fund proxies are explicit. Unknown event occurrence times leave reaction
  percentages uncomputed rather than substituting article publication times.
- Server-rendered `/market-impact/events/[slug]` research pages and
  `/market-impact/methodology`. Unreviewed automated event pages are `noindex`.
- Account-owned MongoDB watchlists and separate anonymous browser watchlists.
- Company/sector discovery from sourced events, an embedded TradingView economic
  calendar, and the preserved original indices/stocks/crypto/commodities/bonds/ETF/
  currencies/world terminal under **Market terminal**. Existing `?tab=crypto` links work.

## Files

| Location | Responsibility |
| --- | --- |
| `app/markets/page.tsx`, `layout.tsx` | Server entry, real initial data and canonical metadata |
| `components/market-impact/` | Workspace, graph, historical observations, terminal, watchlists, styles |
| `lib/market-impact/` | Normalization, scoring, documented relationships, prices, timing, query validation, persistence helpers |
| `app/api/market-impact/` | Public cached event/price APIs and private watchlist API |
| `app/market-impact/` | Event research, methodology, primary-route redirect |
| `models/MarketImpactEvent.ts`, `models/RadarWatchlist.ts` | Derived event snapshots and user-owned follows |
| `tests/market-impact-*.test.mjs` | Data, error paths, timing, ownership, watchlist concurrency, deep links and server-rendered UI regression checks |

## Configuration and database

Uses existing server-only `FINNHUB_API_KEY`, `MONGODB_URI`, and authentication setup.
Indian observations additionally require server-only `GROWW_API_KEY` and
`GROWW_API_SECRET` from an active Groww Trading API subscription, plus daily approval
in Groww. The server generates the token; `GROWW_ACCESS_TOKEN` is an optional manual
override. See [Groww setup](groww-market-data.md) for the exact
steps, supported symbols, timestamp assumptions, and display-rights limitations.
`NEXT_PUBLIC_SITE_URL` supplies public canonical links. Yahoo chart observations and
TradingView embeds require no additional key in this implementation. Provider access
does not establish commercial display/storage rights; confirm the selected account's
entitlements before a public rollout. See [data setup](market-impact-data.md).

No manual data migration or seed command is required. Mongoose uses the existing
connection and creates `marketimpactevents` and `radarwatchlists` with their indexes.
No existing post, article, user or market collections are rewritten. Watchlist queries
use the authenticated session user, never a caller-supplied user ID.

## Run and verify

```sh
npm run dev
node --experimental-strip-types --test tests/market-impact-events.test.mjs tests/market-impact-prices.test.mjs tests/market-impact-watchlist.test.mjs tests/market-impact-watchlist-api.test.mjs tests/market-impact-navigation.test.mjs tests/market-impact-ui.test.mjs
node --experimental-strip-types --test tests/groww-market-data.test.mjs tests/groww-auth.test.mjs
npx tsc --noEmit --incremental false
```

Use Node.js 22.6 or later for the focused tests. The existing local server is reused;
this update does not publish or deploy the site.

The focused suites cover authentication, data timing, provider failures, market selection,
watchlists and account ownership. TypeScript and HTTP checks validate the workspace,
event pages, methodology, prices and private endpoints. Live Groww verification
requires a configured, current access token.
No browser session was available for interactive desktop/mobile visual QA.

## Current boundaries

This is the first functional vertical slice. Analysis is explicitly rules-based,
with documented policy-rate and petroleum mechanisms; it does not call an LLM or
claim validated predictions. An entity mention alone does not create a business
relationship. Missing or failed sources remain unavailable, and archived reports
retain original dates.

Later phases include editorial verification/corrections, validated AI analysis,
broader relationship coverage, verified event-occurrence timestamps, scheduled
distributed ingestion and retention controls, personalized email alerts, and
paid access. No alert delivery or billing is represented as working today.
