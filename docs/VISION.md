# Satellite Bar — Vision & Requirements

**Product:** Marketing + ordering hub for a **mobile bartending company** (Satellite Bar Co).  
**Audience:** Event hosts, ops/admin, non-engineering owner.  
**Stack:** **Astro + Svelte only** → Cloudflare Pages. Data as JSON.  
**Related:** [PLAN.md](./PLAN.md).

---

## Vision

Hub where customers see **what they’re ordering** — packages, cocktail menus, then book a date. Modular ops features plug in via env without rewriting the shell.

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
2. Conversion — package → book/quote → (later) deposit.
3. Owner independence — hosting checklists without an engineer.
4. Hot-plug modules — missing env ⇒ feature off, site still up.

## Non-goals (v1)

- Contentful / rich CMS blog
- Neighborhood venue hours as the product
- DIY IdP / payment processor / ESP
- Native apps

---

## Personas

| Persona | Needs |
| --- | --- |
| Event host | Compare packages, see drinks, request a date |
| Planner | Inclusions, service area, contact |
| Admin (later) | Booking queue, payouts |
| Owner | Deploy + toggle modules |

## Surfaces

| Path | Role |
| --- | --- |
| `/` | Brand + ordering snapshot |
| `/packages` | Catalog (Svelte filters) |
| `/menu` | Cocktails |
| `/book` | Inquiry |
| `/about` | Who we are |

## Feature modules

Social, events-calendar, mailing-list, accounts, booking, payments — same hot-plug contract as [PLAN.md](./PLAN.md). UI in Astro slots + Svelte islands; flags via `PUBLIC_FEATURE_*`.

## Success metrics

| Signal | Target |
| --- | --- |
| Host understands offer | Packages page answers “what do I get?” |
| Module off | No dead CTAs |
| Owner | Enables social/mail from checklist alone |
