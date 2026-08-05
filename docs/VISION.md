# Satellite Bar — Vision & Requirements

**Product:** Marketing + ordering hub for a **mobile bartending company** (Satellite Bar Co).  
**Audience:** Event hosts, ops/admin, non-engineering owner.  
**Stack:** **Astro + Svelte only** → Cloudflare Pages. Data as JSON.  
**Related:** [PLAN.md](./PLAN.md).

---

## Vision

Hub where customers see **what they’re ordering** — packages, cocktail menus, then book a date. Modular ops and marketing features plug in via env without rewriting the shell.

Inspired by category leaders (e.g. Sip): strong brand hero, event-type paths, market awareness, tools (drink calculator), rotating proof media, and always-on conversion CTAs — adapted to Satellite Bar’s catalog-first, compact, hot-plug model.

North star:

> Show the offer clearly. Book the night. Flip ops features on by module.

---

## Language rule (non-negotiable)

Site source languages:

| Allowed | Use |
| --- | --- |
| **Astro** (`.astro`) | Pages, layouts, static UI, SEO, feature slots |
| **Svelte** (`.svelte`) | Interactive islands only |

Not allowed in `src/`: TypeScript, plain JS modules, SvelteKit routes.  
JSON/CSS/Markdown for data and styles is fine. `astro.config.mjs` / `svelte.config.js` are tooling only.

---

## Goals

1. Order clarity — packages + cocktails as primary content (`src/data/*.json`).
2. Conversion — package / calculator / event type → check availability → book → (later) deposit.
3. Category parity — Sip-class marketing surfaces (event types, markets, media, chat, i18n) as **optional modules**.
4. Owner independence — hosting checklists without an engineer.
5. Hot-plug modules — missing env ⇒ feature off, site still up.

## Non-goals (v1)

- Heavy headless CMS (e.g. Contentful) as a hard dependency — lightweight Markdown/content collections are OK
- Neighborhood venue **hours** as the product (we are mobile bartending, not a fixed bar)
- DIY IdP / payment processor / ESP / chat vendor — prefer hosted providers behind flags
- Native apps
- Pixel-perfect Sip visual clone (brand + compact Satellite UX stay ours)

---

## Personas

| Persona | Needs |
| --- | --- |
| Event host | Compare packages, see drinks, check availability, request a date |
| Planner | Event-type pages, inclusions, service area / market, contact, calculator |
| Franchise / partner prospect | Open-a-location inquiry |
| Admin (later) | Booking queue, payouts |
| Owner | Deploy + toggle modules; multi-market copy |

## Surfaces (current + planned)

| Path / surface | Role | Status |
| --- | --- | --- |
| `/` | Brand + ordering snapshot + (planned) rotating hero media | Partial |
| `/packages` | Catalog (Svelte filters) | Done |
| `/menu` | Cocktails | Done |
| `/book` | Inquiry / availability | Stub |
| `/about` | Who we are | Done |
| `/contact` | Contact | Planned |
| `/events/{type}` | Social, weddings, corporate, brand activations | Planned |
| `/tools/drink-calculator` | Drink / volume planner | Planned |
| `/locations` (+ `/locations/{market}`) | Markets / service areas | Planned |
| `/open` or franchise inquiry | Open a new location | Planned |
| `/blog` (+ posts) | Lightweight content | Planned |
| Header | Logo, nav mega-menus, Call us, Book now | Partial |
| Chat launcher | Live chat module | Planned |
| Locale control | Language selector | Planned |

## Feature modules

Hot-plug contract: UI in Astro slots + Svelte islands; flags via `PUBLIC_FEATURE_*`. Full phase list and flag map: [PLAN.md](./PLAN.md).

Core planned set: social, hero-media (rotating images), event-types, drink-calculator, locations, franchise, blog, events-calendar, live-chat, i18n, mailing-list, accounts, booking, payments.

## Success metrics

| Signal | Target |
| --- | --- |
| Host understands offer | Packages + event-type pages answer “what do I get?” |
| Media proves the vibe | Rotating hero media loads; reduce-motion respected |
| Calculator helps decide | Output deep-links into package/book with context |
| Module off | No dead CTAs / empty mega-nav items |
| Owner | Enables social / media / chat / mail from checklist alone |
