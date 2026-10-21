# SEO + GEO audit and implementation report

**Site:** [themarketstories.com](https://themarketstories.com)
**Reviewed:** 2026-10-21
**Branch:** `seo/technical-seo-geo`
**Status:** Implemented in the local branch; not deployed.

## Scope and limits

This review covered the Next.js App Router, MongoDB/Mongoose content models, metadata, story and archive routes, structured data, `robots.txt`, sitemap, internal links, and server-rendered output. The public site was reviewed read-only. Local production-mode smoke checks were run on the successful build before the final title and privacy copy edits; those final edits pass TypeScript and changed-file ESLint checks. A later production build retry was interrupted by an already-running Next dev process sharing `.next`; details are in [Validation](#validation).

Google Search Console, analytics, CDN configuration, and PageSpeed/Lighthouse were not connected. Search demand, rankings, traffic, Core Web Vitals, and exhaustive broken-link status therefore remain unverified. No search volumes or ranking estimates are included.

## Architecture

- Next.js 16 App Router with a Mongoose-backed CMS (`Post`, `Article`, `Category`, `Tag`, `Author`, and `Broker`).
- Public story URLs use `/{category}/{slug}`. `/category/:slug` and `/tag/:slug` rewrite to their `/blog/...` implementations.
- The homepage, blog index, category archives, tag archives, author profiles, broker details, and story page now read public content on the server where appropriate. Client components retain pagination and interaction.
- Shared SEO helpers are in `lib/seo/`; direct public database reads and list projections are in `lib/server/content.ts`.

## Prioritized findings

| Priority | Finding and evidence | Work completed | Status |
|---|---|---|---|
| P1 | The live `/blog` page exposed “Loading stories” in its initial page extraction, so story links depended on a browser-side API request. This weakens initial discovery and makes content visibility less reliable. | Added server-rendered first pages for the blog, category and tag archives and the homepage; retained client pagination/search. | Fixed in branch; production still needs deployment. |
| P1 | The homepage HTML measured **5,416,907 bytes** locally. Its largest inline script was 4,096,386 characters and began with a base64 JPEG inside story HTML. List queries were returning full CMS bodies to card components. | Added narrow MongoDB projections for list queries. Category archives request body text only to calculate reading time, then pass only card fields onward. | Fixed and remeasured at **199,462 bytes**; largest inline script 36,926 characters; no embedded base64 image found. |
| P1 | Route metadata had duplicated brand strings, incomplete canonical consistency, or generic titles across public routes. | Centralized canonical, robots, Open Graph and Twitter metadata; added unique route metadata and fixed duplicate title wording for News, Analysis & Opinion, and tag archives. | Fixed in branch. |
| P1 | Dynamic routes could publish synthetic dates by treating `createdAt` as `publishedAt`; sitemap last-modified values could also be invented. | Article dates and visible listing dates now use actual publication fields only; sitemap last-modified is omitted without a real date. | Fixed in branch. |
| P1 | Sitemap categories could include empty archives and tags could include thin pages; preview hosts could be advertised as canonical. | Sitemap uses the production origin, includes categories with published stories and tags with at least five published CMS stories, deduplicates URLs, and omits query URLs. `robots.txt` points to the production sitemap and leaves public assets crawlable. | Fixed in branch; local sitemap smoke check found 947 unique production-origin URLs. |
| P1 | Article pages needed crawlable body content, accurate author/date fields, and structured data sourced from the record. | Added direct server story lookup, visible server-rendered article content, canonical article metadata, `NewsArticle`/`OpinionNewsArticle`, and visible-trail breadcrumbs. Unknown author/date fields are not fabricated. | Fixed in branch. |
| P2 | Public About/Advertise copy included audience and performance figures (500K readers, 120+ countries, 40K subscribers and 85%) without evidence supplied in the repository. | Removed unsubstantiated metrics and process/independence claims locally. Added an editorial policy for sourcing, reporting versus opinion, AI assistance, corrections, sponsorship and financial information. | Fixed locally; public copy changes only after deployment. |
| P2 | Privacy copy contained `[Your Business Address]` and `[Your Phone Number]`. | Removed the placeholders; retained the existing contact email instead of inventing details. | Fixed in branch; consider legal review of the rest of the policy. |
| P2 | The tabbed `/learn` page contains useful beginner topics but does not give each topic a stable article URL. Only the selected tab is a clear first-page answer. | No URL changes made. Recommended content work is in the GEO plan and roadmap. | Follow-up opportunity. |
| P2 | Missing dynamic resources return a streamed 200 response with `noindex` in local checks (for example, a missing story and an empty tag). | Added early `notFound()` checks in metadata/page code and a global not-found page. | UI/noindex is verified; strict HTTP 404 remains limited by Next.js streaming. See below. |
| P3 | Full-site mobile performance, broken links, image transfer sizes and Core Web Vitals need a real browser/lab crawl. | Deferred third-party chart/market widgets until near viewport and defer the globe until idle on wide screens; list payloads are smaller. | Requires PageSpeed/Lighthouse and production monitoring. |

### Streaming 404 behavior

The local production smoke check returned HTTP 200 plus `noindex` for a missing dynamic article, while unmatched paths use the custom not-found page. Next.js documents that a streamed `notFound()` response keeps status 200 and emits `noindex`; if a strict 404 status is required, resource existence must be checked before the body streams, for example in a fast proxy check. See [Next.js loading and streaming behavior](https://nextjs.org/docs/app/api-reference/file-conventions/loading). This branch does not add a database lookup to middleware/proxy because that would put a database dependency in front of dynamic requests. Search engines should see the noindex directive, but analytics and crawlers may still classify these URLs as soft 404s.

## Implemented metadata and structured data

- Homepage title: **The Market Stories | Financial News & Market Analysis**.
- Homepage description: **Follow global and Indian financial markets, business news, economic developments and technology trends with timely reporting and clear market analysis from The Market Stories.**
- Homepage H1: **Financial news, market analysis and business insights**.
- `pageMetadata()` centralizes canonical URLs, index/follow directives, Open Graph and Twitter metadata. Canonical URLs use `https://themarketstories.com` in production and preview builds.
- Homepage JSON-LD graph: `NewsMediaOrganization`, `WebSite`, `WebPage`.
- Story JSON-LD: `NewsArticle` or `OpinionNewsArticle`, plus `BreadcrumbList` where a visible breadcrumb exists. Dates, images, keywords, author and publisher are built from the actual record; missing dates/authors are not invented. Syndicated external stories remain `noindex`.
- Category pages use `CollectionPage` and `ItemList`; editorial policy uses `WebPage`. A consistent publisher `@id` is shared across schema.
- Dynamic Open Graph image route and logo asset are available at `/og` and `/logo.png`.

## Keyword map and content plan

These are page-intent targets, not volume claims. Confirm active archive slugs against the deployed sitemap before promoting them.

| Page | Primary intent | Supporting content |
|---|---|---|
| `/` | financial news; market analysis; global and Indian financial markets | Daily reporting, market context, business and economic developments. |
| `/category/stock-markets` | Indian stock market news; share market updates | Company filings, exchange announcements, index and breadth data. |
| `/category/global-markets` | global markets news; international market analysis | Official central-bank releases, exchange data and company filings. |
| `/category/news` | business, world and market news | Reported developments with source links and clear dates. |
| `/category/business-deals` | business deals and company developments | Transaction terms, company disclosures and regulatory filings. |
| `/category/analysis--opinion` | market analysis and opinion | Label facts, estimates, forecasts and opinion distinctly. |
| `/category/crypto` and `/category/commodities` | crypto market news; commodity market news | Cite exchange, issuer, regulator or primary data sources; explain data timestamps. |
| `/learn` | financial markets, stocks, forex, crypto and investing basics | Existing lessons include stocks, forex, technical/fundamental analysis, risk management, financial statements and economic indicators. Give each substantial lesson a stable URL. |

Recommended evergreen pieces should answer a real question directly in the opening paragraph, then show a worked example and cite primary material: “What are stocks?”, “How do you read a balance sheet?”, “What is forex trading?”, “How do interest-rate decisions affect markets?”, and “How do position size and risk/reward work?”. Add jurisdiction-specific explanations only when the publication can verify the relevant rules and sources. Use Search Console impressions, clicks, CTR and position before prioritizing updates; no volume, difficulty or traffic estimate is available here.

## Technical SEO checklist

- **P1 — Done locally:** SSR headlines and links on home, blog, category, tag and story pages.
- **P1 — Done locally:** canonical host, unique metadata, article date/author handling, JSON-LD, sitemap and robots rules.
- **P1 — Done locally:** remove unsupported audience claims and contact placeholders; publish an editorial and corrections policy.
- **P1 — Before deploy:** review legal/privacy wording and verify the editorial policy accurately describes the actual newsroom process.
- **P1 — Before deploy:** deploy the branch, then check representative URLs and submit `/sitemap.xml` in Search Console.
- **P2 — Next:** verify published author biographies, bylines, source links, and any broker ratings/review counts against their real source data.
- **P2 — Next:** split the most useful `/learn` lessons into stable, server-rendered URLs without changing existing URLs without redirects.
- **P2 — Next:** run a production crawl, Lighthouse/PageSpeed mobile tests, and Core Web Vitals review; none was available in this workspace.
- **P3 — Maintenance:** resolve the repository-wide lint backlog and duplicate Mongoose slug-index warnings; the build also warns that the `middleware` convention is deprecated in favor of `proxy`.

## GEO and authority plan

1. Lead each explainer with a concise answer, then define terms and add a worked example.
2. Link claims to primary sources: exchange disclosures, company filings, regulator notices, official statistics and central-bank releases. Label estimates and forecasts.
3. Keep visible author, publication and update details accurate. Add review details only when a real reviewer and process exist.
4. Build topic clusters around stock markets, global markets, business/economy, crypto, commodities, forex and the existing `/learn` topics; connect explainers to current reporting and back.
5. Measure Search Console query/page performance and production Core Web Vitals monthly. Do not promise citations or rankings in answer engines.

## 30/60/90-day roadmap

| Window | Work |
|---|---|
| Days 1–30 | Deploy after editorial/legal review. Submit the sitemap. Inspect indexed article, category and tag URLs; monitor 404/soft-404, canonical and structured-data reports. Run a mobile PageSpeed/Lighthouse baseline. |
| Days 31–60 | Use Search Console queries and landing-page data to select a small set of underperforming pages. Expand the highest-value existing lessons into stable URLs, cite primary sources, and strengthen links between explainers and current reporting. Verify bylines, bios, sponsorship labels and broker-data sources. |
| Days 61–90 | Update content where query intent or facts changed. Review index coverage, clicks, CTR, positions and Core Web Vitals. Consolidate thin tag/archive pages based on actual traffic and links; preserve redirects for any approved URL changes. |

## Changed files

- **SEO foundation:** `lib/seo/site.ts`, `lib/seo/metadata.ts`, `lib/seo/jsonld.tsx`, `lib/server/content.ts`, `lib/articles/view.ts`, `lib/cms-utils-client.ts`.
- **Routes and metadata:** `app/page.tsx`, `app/layout.tsx`, `app/not-found.tsx`, `app/blog/page.tsx`, `app/blog/category/[slug]/page.tsx`, `app/blog/tag/[slug]/page.tsx`, `app/category/[slug]/page.tsx`, `app/tag/[slug]/page.tsx`, `app/[category]/[slug]/page.tsx`, `app/author/[authorId]/page.tsx`, `app/brokers/[id]/page.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/feed.xml/route.ts`, `app/markets/[symbol]/page.tsx`, `app/crypto-converter/page.tsx`, `app/crypto-converter/[pair]/page.tsx`, `app/tools/page.tsx`, `app/tools/forex-heatmap/page.tsx`, `app/tools/forex-heatmap/all-rates/layout.tsx`, `app/search/page.tsx`, `app/about/page.tsx`, `app/advertise/page.tsx`, `app/privacy/page.tsx`, `app/risk-disclosure/page.tsx`, `app/terms/page.tsx`, `app/subscription/page.tsx`.
- **Route metadata layouts:** `app/advertise/layout.tsx`, `app/brokers/layout.tsx`, `app/contact/layout.tsx`, `app/learn/layout.tsx`, `app/markets/layout.tsx`, `app/screener/layout.tsx`, `app/search/layout.tsx`.
- **Editorial and assets:** `app/editorial-policy/page.tsx`, `app/og/route.ts`, `app/logo.png/route.tsx`.
- **Components:** `components/BlogIndexClient.tsx` (moved from the old client blog route), `components/BlogPostClient.tsx`, `components/HomeTopNewsGrid.tsx`, `components/FeaturedAiArticlesSection.tsx`, `components/StockMarketsCategoryGrid.tsx`, `components/NewsCategoryGrid.tsx`, `components/TagStories.tsx`, `components/analysis-opinion.tsx`, `components/RelatedPostsCard.tsx`, `components/ArticleSidebar.tsx`, `components/CategorySidebar.tsx`, `components/CategoryBar.tsx`, `components/BrokerGuides.tsx`, `components/HeroBanner.tsx`, `components/LayoutShell.tsx`, `components/Footer.tsx`, `components/LazyMount.tsx`, `components/DeferredGlobe.tsx`.
- **Dependencies:** `package.json`, `package-lock.json` (corrected the Next.js ESLint config dependency so the project lint command can run). Old duplicate metadata modules and the prior client-only tag wrapper were removed.

## Validation

- `npx tsc --noEmit`: passed after the route-title edits. The subsequent privacy change only removed placeholder text; ESLint on that file and the changed query/archive files passed afterward.
- ESLint on the changed server-query, category and tag files: passed. Earlier changed-file lint checks also passed.
- `npm run lint`: fails repository-wide with **85 errors and 105 warnings**, primarily existing admin/editor hooks, `<img>` use and `any` types in unrelated files. This is a baseline backlog, not a clean lint result.
- `git diff --check`: passed (Git reports line-ending normalization warnings for several edited files).
- `npm run build`: passed after the database projection and homepage payload fix. A final rebuild after the small title/privacy edits compiled, then failed during TypeScript checking because `.next/dev/types/routes.d.ts` was malformed while another Next dev process held `.next/dev/lock`. I left that active process/cache untouched; the workspace review blocked an attempt to remove its generated file. The route-title edits pass standalone TypeScript, and the privacy copy change is text-only with changed-file lint passing. A clean isolated production rebuild remains outstanding.
- Local production smoke check before the final title/privacy edits: homepage, `/blog`, `/editorial-policy`, `/category/stock-markets`, a published article, `/robots.txt` and `/sitemap.xml` returned 200; representative metadata/canonicals were present; JSON-LD blocks parsed as JSON. Sitemap contained 947 unique canonical-origin URLs. Homepage HTML fell from 5.42 MB to 199 KB after list projection.
- No test script exists in `package.json`. No production deploy, Search Console inspection, live crawler test, or lab performance test was run.
- The package install reported **27 npm audit findings** (4 moderate, 21 high, 2 critical) during the ESLint dependency repair; review the dependency tree before any broad automated upgrades.

## Deployment notes

Deploy branch `seo/technical-seo-geo` through the site's normal CI/hosting process after reviewing policy and legal copy. The canonical origin is intentionally fixed to `https://themarketstories.com`; keep production routes and redirects on that host. After deployment, verify the homepage, one category, one tag, one CMS story and one AI-desk story; check `/robots.txt`, `/sitemap.xml`, canonical tags and JSON-LD; then submit the sitemap in Search Console and run mobile performance checks. The production site has not been changed by this work.
