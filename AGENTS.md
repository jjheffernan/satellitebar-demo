# AGENTS.md — Satellite Bar Co

## Product

Mobile bartending **ordering hub** — packages + cocktails + book.

## Languages (hard rule)

**Only these two for site source:**

1. **Astro** (`.astro`) — pages, layouts, static sections, SEO, feature slots
2. **Svelte** (`.svelte`) — interactive islands (`client:*`)

Do **not** add TypeScript, plain app `.js` modules, or SvelteKit routes.
Data is JSON under `src/data/`. Tooling configs (`astro.config.mjs`, `svelte.config.js`) are allowed as build glue only.

## Stack

- Astro 7 + `@astrojs/svelte` + Svelte 5
- Tailwind v4 via Vite plugin
- Deploy: **Cloudflare Pages** or **Netlify** — Functions under `deploy/` (see `deploy/README.md`); both publish `dist/`

## Hard rules

- Brand hero-level on `/`
- Semantic CSS tokens
- Offerings in `src/data/catalog.json`
- Feature UI gated by `PUBLIC_FEATURE_*`

## Docs

- [docs/VISION.md](docs/VISION.md)
- [docs/PLAN.md](docs/PLAN.md)

## Verify

```bash
pnpm build
```
