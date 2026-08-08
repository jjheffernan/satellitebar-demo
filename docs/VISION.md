# Satellite Bar — Vision & Requirements

**Product:** Marketing + ordering hub for a **mobile bartending company** (Satellite Bar Co).  
**Audience:** Event hosts, ops/admin, non-engineering owner.  
**Stack:** **Astro + Svelte only** → Cloudflare Pages **or** Netlify. Data as JSON.  
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

1. Order clarity — packages + sample menus as primary content (`src/data/*.json`).
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
- Enabling **accounts** or **payments** in production overnight — accounts has a Better Auth + Google wire-in (flag off until secrets); payments stay parked — see [PLAN.md](./PLAN.md)
- Turning on **i18n** before real translated copy exists

---

## Personas

| Persona | Needs |
| --- | --- |
| Event host | Compare packages, see drinks, check availability, request a date |
| Planner | Event-type pages, inclusions, service area / market, contact, calculator |
| Franchise / partner prospect | Open-a-location / out-of-orbit travel inquiry |
| Admin (later) | Booking queue, payouts — after accounts/payments adoption |
| Owner | Deploy + toggle modules; multi-market copy |

## Surfaces (current)

| Path / surface | Role | Status |
| --- | --- | --- |
| `/` | Brand hero, rotating media, ordering snapshot, testimonials, events teaser | Done |
| `/packages` | Catalog + quote calculator; branded & event packages (Svelte) | Done |
| `/menu` | Interactive sample-menu depth picker (drinks pop in by tier) | Done |
| `/book` | Availability / inquiry (map, address, context from calculator/events) | Done |
| `/about` | Story + 3-pane social embeds (X / IG / FB) | Done |
| `/contact` | Contact details + social profile badges (no embeds) | Done |
| `/events` | Full photo pool showcase + event-type landings (not conversion-led) | Done |
| `/events/{type}` | Full-bleed landing from shared pool subset + fitting packages | Done |
| `/calendar` | Full public event calendar (month grid + list); home keeps Upcoming teaser | Done |
| `/tools/drink-calculator` | Guests × hours × style → volume / package band | Done |
| `/locations` | Markets hub + map | Done |
| `/locations/{market}` | Per-market landing | Done |
| `/open` | Open a location / out-of-orbit travel inquiry | Done |
| Header | Logo, nav (Events / Locations / Menu), Call us, Book now | Done |
| Footer | Contact utilities, share links, social | Done |
| Home testimonials | Host quotes from JSON | Done |
| Chat launcher | Live chat module | Flagged (`PUBLIC_FEATURE_LIVE_CHAT`) |
| Locale control | Language selector | **Parked** — leave `PUBLIC_FEATURE_I18N` off |
| Guest / admin accounts | Better Auth + Google SSO wire-in; admin later | **Flagged** (`PUBLIC_FEATURE_ACCOUNTS`) — leave off until secrets + DB |
| Payments / deposit | Stripe (± PayPal) after confirm | **Parked** — see PLAN adoption |

## Feature modules

Hot-plug contract: UI in Astro slots + Svelte islands; flags via `PUBLIC_FEATURE_*`. Full phase list, Pane social decision, and accounts/payments adoption plan: [PLAN.md](./PLAN.md).

Core set: social (Pane IG feed), hero-media, event-types, drink-calculator, locations, franchise, testimonials (not blog), events-calendar, live-chat, i18n (parked), mailing-list, accounts (Better Auth + Google wire-in, flag off), booking, payments (parked).

Customer content modules are **always on**. Ops widgets (chat, i18n, mail, booking Function, accounts, payments) stay behind `PUBLIC_FEATURE_*`.

## Success metrics

| Signal | Target |
| --- | --- |
| Host understands offer | Packages + event-type pages answer “what do I get?” |
| Media proves the vibe | Rotating hero media loads; reduce-motion respected; IG feed (Pane) when configured |
| Calculator helps decide | Output deep-links into package/book with context |
| Module off | No dead CTAs / empty mega-nav items |
| Owner | Enables social / media / chat / mail from checklist alone |
| Later: deposit | Confirmed booking → pay link → paid status without DIY card handling |
