# AI Article System (Market Categories)

This project now includes a separate article pipeline for AI-assisted finance content.

## Models

- `models/Article.ts`
- `models/Author.ts`
- `models/PublicationLog.ts`

## Categories and Types

Article `type` values:

- `global`
- `crypto`
- `commodity`
- `business`
- `geopolitical`

Mapped default category slugs:

- `global` -> `global-markets`
- `crypto` -> `crypto`
- `commodity` -> `commodities`
- `business` -> `business-deals`
- `geopolitical` -> `geopolitics`

Use:

- `POST /api/articles/categories/seed`

to create missing mapped categories.

## Workflow

Recommended flow:

1. AI generates article body from category prompt.
2. Save via `POST /api/articles` with `status: "draft"`.
3. Editor updates and marks `status: "review"`.
4. Publish via:
   - `PUT /api/articles/[id]` with `status: "published"`, or
   - `POST /api/auto-publish` for batch publish.

Every transition is logged in `PublicationLog`.

## Prompt Endpoints

- `GET /api/articles/prompts`
- `GET /api/articles/prompts?type=crypto`

Prompt templates are stored in:

- `lib/articles/prompts.ts`

## Article API

- `GET /api/articles`
- `POST /api/articles`
- `GET /api/articles/[id]`
- `PUT /api/articles/[id]`
- `DELETE /api/articles/[id]`

## Notes

- Management APIs require `admin` or `editor` session role.
- Public article list only returns `published` records.
- HTML content is sanitized before save.
