# Satellite Bar — Build plan

**Product:** Mobile bartending marketing + ordering hub.  
**Stack:** **Astro + Svelte only** → Cloudflare Pages.  
**Vision:** [VISION.md](./VISION.md) · **Hosting:** [hosting/README.md](./hosting/README.md)

## North star

Customers see what they’re ordering. Features hot-plug via env. **No TypeScript / no app JS / no SvelteKit** in site source.

## Baseline (done)

- [x] Astro 7 + Svelte 5 (`@astrojs/svelte`)
- [x] Mobile bartending hub routes + `src/data/*.json`
- [x] M0 feature slots (`FeatureSlot.astro` + `PUBLIC_FEATURE_*`)
- [x] Language rule restored: **Astro + Svelte only**
- [x] Compact mobile-first shell (home, packages, menu, book, about)

## Competitive reference — Sip (feature inventory)

Reference mobile-bar marketing site (Sip). **Adopt capability, not clone branding.** All of the following are in scope for Satellite Bar planning; nothing from this list is coded from this prompt alone.

| Sip surface | Capability to plan |
| --- | --- |
| Logo mark in header | Distinct brand mark + wordmark |
| ABOUT | About / story page |
| EVENTS ▾ — Social, Weddings, Corporate, Brand Activations | Event-type landing pages (or sections) |
| EVENTS ▾ — Drink Calculator | Interactive drink/quantity calculator island |
| LOCATIONS ▾ | Multi-market / city or service-area pages |
| Open a new location | Franchise / partner / “open a market” inquiry |
| Blog | Lightweight content posts (Astro content or MD — no heavy CMS required) |
| Contact | Dedicated contact page (+ form later) |
| Call Us | Persistent `tel:` header CTA |
| Book Now | Persistent primary booking CTA in header |
| City eyebrow + elevated headline | Market-aware hero copy (`Mobile bar {city}`) |
| Check Availability | Availability / booking entry CTA in hero |
| Central constantly changing image | Auto-rotating hero media (image carousel / slideshow island) |
| Live chat widget | Third-party or embeddable chat (flagged module) |
| Language selector | Locale switcher + translated copy (i18n module) |

## Feature phases

### Phase 1 — Social (`social`)

- [x] Slot `footer.social`
- [x] Production profile URLs
- [ ] Optional Instagram embed island

### Phase 2 — Brand chrome & conversion CTAs

- [x] Header logo mark (not text-only)
- [x] Persistent **Call us** (`tel:`) in header
- [x] Persistent **Book now** CTA in header (wire to `/book` / availability)
- [x] Dedicated **Contact** page (`/contact`)
- [x] Hero primary CTA: **Check availability**

### Phase 3 — Hero media (`hero-media`)

- [x] Full-bleed hero with market eyebrow + headline
- [x] Central **auto-rotating image** island (constantly changing slides; pause on reduce-motion / focus)
- [x] Slide data in JSON (`src/data/hero-media.json` or similar)
- [x] Flag: `PUBLIC_FEATURE_HERO_MEDIA`

### Phase 4 — Event types (`event-types`)

- [x] Nav group **Events** with: Social, Weddings, Corporate, Brand activations
- [x] One landing surface per type (copy + recommended packages + CTA)
- [x] Data-driven from JSON; Astro pages + optional Svelte bits only if interactive

### Phase 5 — Drink calculator (`drink-calculator`)

- [x] Utility under Events (or `/tools/drink-calculator`)
- [x] Svelte island: guests × hours × drink style → suggested volume / package band
- [x] Deep-link into packages / book with prefilled context
- [x] Flag: `PUBLIC_FEATURE_DRINK_CALCULATOR`

### Phase 6 — Locations & expansion (`locations`)

- [x] Locations nav (dropdown of markets / service areas)
- [x] Per-market page or section (city hero copy, local contact, local media)
- [x] **Open a new location** / partner inquiry flow
- [x] Flag: `PUBLIC_FEATURE_LOCATIONS` (± `PUBLIC_FEATURE_FRANCHISE`)

### Phase 7 — Blog (`blog`)

- [x] Lightweight posts (Markdown / Astro content collections — **not** Contentful-required)
- [x] Index + post pages; nav link
- [x] Flag: `PUBLIC_FEATURE_BLOG` (optional; can ship always-on if owner prefers)

### Phase 8 — Events calendar (optional) (`events-calendar`)

- [x] Static/list adapter when flagged (public upcoming appearances)

### Phase 9 — Live chat (`live-chat`)

- [x] Floating chat launcher + vendor embed (or custom later)
- [x] Proactive greeting bubble (copy in JSON)
- [x] Flag: `PUBLIC_FEATURE_LIVE_CHAT` + vendor keys as secrets

### Phase 10 — i18n (`i18n`)

- [x] Locale selector UI (e.g. English + future locales)
- [ ] Translated strings / market copy strategy
- [x] Flag: `PUBLIC_FEATURE_I18N`

### Phase 11 — Mailing list (`mailing-list`)

- [x] Signup island + ESP Function

### Phase 12 — Accounts (`accounts`)

- [ ] Hosted IdP; guest + admin (Svelte islands for auth UI) — **blocked overnight (high-risk)**

### Phase 13 — Booking / availability (`booking`)

- [x] Replace mailto stub; keep form in Astro/Svelte
- [x] **Check availability** / **Book now** share one booking module
- [x] Date + market + event-type context from calculator / event pages

### Phase 14 — Payments (`payments`)

- [ ] Stripe + PayPal (± Venmo) — **blocked overnight (high-risk)**
- [ ] Deposit after availability confirm

### Phase 15 — Owner hosting guide

- [x] Expand `docs/hosting/*` for every module above (toggle + secrets checklist)

## Module flag map (planned)

| Module id | Env gate (planned) | Notes |
| --- | --- | --- |
| `social` | `PUBLIC_FEATURE_SOCIAL` | Exists |
| `hero-media` | `PUBLIC_FEATURE_HERO_MEDIA` | Rotating central images |
| `event-types` | `PUBLIC_FEATURE_EVENT_TYPES` | Social / weddings / corporate / activations |
| `drink-calculator` | `PUBLIC_FEATURE_DRINK_CALCULATOR` | Planning utility |
| `locations` | `PUBLIC_FEATURE_LOCATIONS` | Markets dropdown + pages |
| `franchise` | `PUBLIC_FEATURE_FRANCHISE` | Open-a-location inquiry |
| `blog` | `PUBLIC_FEATURE_BLOG` | Optional |
| `events-calendar` | `PUBLIC_FEATURE_EVENTS_CALENDAR` | Exists in features.json |
| `live-chat` | `PUBLIC_FEATURE_LIVE_CHAT` | Vendor embed |
| `i18n` | `PUBLIC_FEATURE_I18N` | Locale switcher |
| `mailing-list` | `PUBLIC_FEATURE_MAILING_LIST` | Exists in features.json |
| `accounts` | `PUBLIC_FEATURE_ACCOUNTS` | Exists in features.json |
| `booking` | `PUBLIC_FEATURE_BOOKING` | Exists in features.json |
| `payments` | `PUBLIC_FEATURE_PAYMENTS` | Exists in features.json |

## Decision log

| Decision | Choice |
| --- | --- |
| Languages | **Astro + Svelte only** |
| Offerings | `src/data/catalog.json` |
| Interactive UI | Svelte islands |
| Static shell | Astro pages/layouts |
| Hosting | Cloudflare Pages |
| Mistake corrected | SvelteKit-only migration reverted — Astro stays |
| Competitive ref | Sip feature set adopted into plan; Satellite brand + compact UX kept |
| Blog | Allowed as lightweight Astro content — **not** Contentful-required |
| Hero media | Auto-rotating images are a first-class module, not decorative fluff |
| Locations | Service markets / cities — not brick-and-mortar bar hours as the product |
