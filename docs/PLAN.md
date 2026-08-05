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
- [ ] Instagram business feed on About / Contact (pick option below; **Behold removed**)

#### Instagram feed options (decide before implement)

Need: showcase [@satellitebarco](https://www.instagram.com/satellitebarco/) on the site. Account must be **Professional** (Business/Creator) — Meta killed Basic Display (personal) Dec 2024.

| Option | How it works | Pros | Cons | Fit for us |
| --- | --- | --- | --- | --- |
| **A. First-party Graph API + Pages Function** | Meta app + long-lived token; Cloudflare Function fetches `/me/media`, caches in KV/R2 or edge cache; Svelte island renders grid | No third-party SaaS dashboard; full UI control; Astro+Svelte only | Meta app review, token refresh, more eng time | **Preferred** if we own ops |
| **B. Pane** ([pane.so](https://pane.so/)) | Tiny `<pane-widget>` + script; CDN-cached posts | Fast setup, ~5KB, domain allowlist | Still an external vendor (lighter than Behold) | Good if we want embed ASAP |
| **C. EmbedSocial / Tagembed / Taggbox** | Dashboard → HTML/JS embed | Polished layouts, free tiers exist | SaaS account + branding on free plans; heavier scripts | OK for marketing, same class of pain as Behold |
| **D. SnapWidget / LightWidget-class** | Classic iframe/script feed widgets | Familiar, cheap | Aging UX; ToS/API fragility | Avoid unless nothing else |
| **E. Manual curated JSON** | Owner drops latest post URLs/images into `src/data/instagram.json`; Astro grid | Zero runtime API; matches our data-in-JSON pattern | Not live; needs occasional hand update | Fine interim / brand-control |
| **F. Profile CTA only** | Link + SocialLinks (current state) | Already shipped | No on-site feed | Status quo until A/B/E |

**Recommendation:** Prefer **A** (Graph API + cached Function) or **E** (curated JSON) to stay off external “connect your IG in our app” products. Use **B (Pane)** only if we need a live feed this week with minimal build. Skip Behold-class dashboards unless product owner insists.

**Acceptance (when picked):**

- [ ] Feed on `/about` and/or `/contact` Instagram section
- [ ] Graceful empty/error state + profile link fallback
- [ ] No Behold / no `PUBLIC_BEHOLD_*`
- [ ] Document secrets + refresh in `docs/hosting/`

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

### Phase 7 — Testimonials (not blog)

- [x] Home testimonials from `src/data/testimonials.json`
- [x] **No blog** — dropped; social proof via quotes instead

### Phase 8 — Events calendar (optional) (`events-calendar`)

- [x] Static/list adapter (always on with other content modules)

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
| `social` | _(always on)_ | Footer social |
| `hero-media` | _(always on)_ | Rotating central images |
| `event-types` | _(always on)_ | Social / weddings / corporate / activations |
| `drink-calculator` | _(always on)_ | Planning utility |
| `locations` | _(always on)_ | Markets dropdown + pages |
| `franchise` | _(always on)_ | Open-a-location inquiry |
| `events-calendar` | _(always on)_ | Upcoming list |
| `live-chat` | `PUBLIC_FEATURE_LIVE_CHAT` | Vendor embed |
| `i18n` | `PUBLIC_FEATURE_I18N` | Locale switcher |
| `mailing-list` | `PUBLIC_FEATURE_MAILING_LIST` | Exists in features.json |
| `accounts` | `PUBLIC_FEATURE_ACCOUNTS` | Exists in features.json |
| `booking` | `PUBLIC_FEATURE_BOOKING` | Form posts to Function when on |
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
| Blog | **Dropped** — use testimonials instead |
| Hero media | Auto-rotating images are a first-class module, not decorative fluff |
| Locations | Service markets / cities — not brick-and-mortar bar hours as the product |
| Content modules | Always on (empty `publicEnv`); ops widgets stay flagged |
| Instagram feed | **Behold removed** — prefer Graph API + cache, curated JSON, or lightweight Pane; avoid SaaS dashboards that require a separate app login |
