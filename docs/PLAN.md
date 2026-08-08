# Satellite Bar — Build plan

**Product:** Mobile bartending marketing + ordering hub.  
**Stack:** **Astro + Svelte only** → Cloudflare Pages **or** Netlify.  
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
- [x] Contact profile embeds (X + Facebook); Instagram profile CTA until feed ships
- [ ] Instagram business feed via **Pane** on About / Contact

#### Instagram feed — chosen: **B. Pane** ([pane.so](https://pane.so/))

**Decision:** Ship a live IG grid with Pane. Skip Behold-class dashboards and defer first-party Graph API until we outgrow a lightweight embed.

| Need | Detail |
| --- | --- |
| Account | [@satellitebarco](https://www.instagram.com/satellitebarco/) must be **Professional** (Business/Creator) |
| Embed | `<pane-widget feed-id="…">` + `https://wgt.pane.so/widget.js` (~5KB, CDN-cached posts) |
| Config | Owner creates feed in Pane → domain allowlist for production (+ preview) → copy `feed-id` |
| Env | `PUBLIC_PANE_FEED_ID` (public; not a secret). Empty ⇒ show profile link fallback only |
| Placement | About “Follow along” + Contact “On social” Instagram column |
| UI | Thin Astro/Svelte wrapper; no Behold; no `PUBLIC_BEHOLD_*` |

**Rejected / deferred for now**

| Option | Why not now |
| --- | --- |
| A. Graph API + Pages Function | Preferred long-term ownership; more eng + Meta review. Revisit if Pane cost/constraints bite |
| C/D. EmbedSocial / SnapWidget-class | Heavier SaaS / aging widgets — same pain class as Behold |
| E. Curated JSON | Fine fallback if Pane is blocked; not the primary path |
| F. Profile CTA only | Current interim until Pane ships |

**Acceptance**

- [ ] Pane widget on `/about` and `/contact` Instagram sections
- [ ] Graceful empty/error state + profile link fallback when `PUBLIC_PANE_FEED_ID` missing or widget fails
- [ ] Domain allowlist documented in `docs/hosting/`
- [ ] No Behold / no `PUBLIC_BEHOLD_*`
- [ ] Feature README + `.env.example` updated

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
- [x] `/events` showcase hub — full shared photo pool + type landings (not conversion-led)
- [x] One landing surface per type (full-bleed cover from pool subset + recommended packages)
- [x] Shared image pool `src/data/events-media.json`; types pick via `images[]` in `event-types.json`
- [x] Data-driven from JSON; Astro pages + optional Svelte bits only if interactive

### Phase 5 — Drink calculator (`drink-calculator`)

- [x] Utility under Events (or `/tools/drink-calculator`)
- [x] Svelte island: guests × hours × drink style → suggested volume / package band
- [x] Reactive vessel gauge by drink style
- [x] Deep-link into packages / book with prefilled context
- [x] Flag: `PUBLIC_FEATURE_DRINK_CALCULATOR`

### Phase 6 — Locations & expansion (`locations`)

- [x] Locations nav (dropdown of markets / service areas)
- [x] Per-market page or section (city hero copy, local contact, local media)
- [x] **Open a new location** / partner inquiry flow (`/open`)
- [x] Flag: `PUBLIC_FEATURE_LOCATIONS` (± `PUBLIC_FEATURE_FRANCHISE`)

### Phase 7 — Testimonials (not blog)

- [x] Home testimonials from `src/data/testimonials.json`
- [x] **No blog** — dropped; social proof via quotes instead

### Phase 8 — Events calendar (optional) (`events-calendar`)

- [x] Static/list adapter on home (Upcoming teaser)
- [x] Full calendar page `/calendar` — month grid + list from `calendar.json`
- [x] Nav under Events → Calendar

### Phase 9 — Live chat (`live-chat`)

- [x] Floating chat launcher + vendor embed (or custom later)
- [x] Proactive greeting bubble (copy in JSON)
- [x] Flag: `PUBLIC_FEATURE_LIVE_CHAT` + vendor keys as secrets

### Phase 10 — i18n (`i18n`) — **parked (flagged off)**

- [x] Locale selector UI exists (`LocaleSwitcher` + `PUBLIC_FEATURE_I18N`)
- [ ] Translated strings / market copy strategy — **not started**
- [x] **Default: leave `PUBLIC_FEATURE_I18N` unset / off** until we have real copy + a market that needs it

Do not expand i18n until a concrete locale (beyond English) is scheduled. Selector stays in the codebase; owner hosting guide keeps the flag listed but recommended off.

### Phase 11 — Mailing list (`mailing-list`)

- [x] Signup island + ESP Function

### Phase 12 — Accounts (`accounts`) — **wire-in done; production parked**

- [x] **Accounts M1 wire-in** — Better Auth + Google SSO (Astro’s preferred auth path); header island; `/api/auth/*` on Cloudflare + Netlify
- [ ] Admin queue / roles (M2) — see [Adoption plan — Accounts & payments](#adoption-plan--accounts--payments)
- [ ] Keep `PUBLIC_FEATURE_ACCOUNTS` **off** in production until secrets + libSQL schema are ready

### Phase 13 — Booking / availability (`booking`)

- [x] Replace mailto stub; keep form in Astro/Svelte
- [x] **Check availability** / **Book now** share one booking module
- [x] Date + market + event-type context from calculator / event pages
- [x] Venue map picker + address fields

### Phase 14 — Payments (`payments`) — **parked**

- [ ] Stripe + PayPal (± Venmo) — see [Adoption plan — Accounts & payments](#adoption-plan--accounts--payments)
- [ ] Deposit after availability confirm

### Phase 15 — Owner hosting guide

- [x] Expand `docs/hosting/*` for every module above (toggle + secrets checklist)
- [ ] Add Pane feed-id + domain allowlist steps when Phase 1 feed ships

## Adoption plan — Accounts & payments

Payments stay **parked**. Accounts has a **Gmail SSO wire-in** (Better Auth + Google) behind `PUBLIC_FEATURE_ACCOUNTS` — leave the flag off in production until secrets + DB migrate are ready. High-risk overnight work remains: money movement, admin roles, PCI-adjacent flows. This section is the adoption contract for the rest.

### Why they wait

| Constraint | Implication |
| --- | --- |
| Booking is inquiry-first today | Deposit only makes sense after availability confirm is trusted |
| No guest identity yet | Payments without accounts ⇒ one-off checkout links; accounts without payments ⇒ empty admin |
| Language rule | Auth + pay UI = **Svelte islands**; server = host Functions (Cloudflare `functions/` or Netlify `netlify/functions/`) — no app JS in `src/` |
| Owner ops | Secrets, webhooks, and refunds must be checklist-driven ([hosting/README.md](./hosting/README.md)) |

### North-star customer loop (when unparked)

```text
Package / calculator / event → Check availability → Book
  → Owner confirms → Deposit invoice
  → Guest pays (Stripe ± PayPal/Venmo) → Confirmation
  → (Optional) guest account sees booking status
```

Accounts and payments are **paired**: ship payment deposit first if we must sequence; accounts unlock “my bookings” and admin queue next. Do not turn on `PUBLIC_FEATURE_ACCOUNTS` or `PUBLIC_FEATURE_PAYMENTS` in production until the matching checklist below is green.

### Prerequisites (gate before any build sprint)

- [ ] Booking Function (`PUBLIC_FEATURE_BOOKING`) stable in production for ≥2 weeks; spam/false-positive rate acceptable
- [ ] Owner can triage inquiries (email or lightweight queue) without an in-app admin
- [ ] Legal: deposit / cancellation copy approved; refund policy one-pager
- [ ] Stripe (and optional PayPal) business account ready; tax/payout settings done
- [ ] Decision: guest accounts **required** for deposit vs **optional** magic-link checkout

### Recommended providers (hosted — no DIY password DB / processor)

| Concern | Choice | Notes |
| --- | --- | --- |
| Auth / SSO | **Better Auth + Google** (chosen) | Astro-documented auth path; Google is the IdP for Gmail SSO; session cookies via `/api/auth/*` Functions; users/sessions in **libSQL/Turso** |
| Card + wallet | **Stripe Checkout** (primary) | Hosted checkout = less PCI surface; Functions create session + webhook |
| Alt pay | **PayPal** (± Venmo where available) | Second button on deposit step only if owner needs it day one |
| Booking↔pay ids | Cloudflare **D1** or **KV** (optional) | Keep PII minimal; never store raw card data |

### Build slices (order matters)

1. **Payments M1 — deposit link**  
   - After owner marks inquiry “confirmed,” Function creates Stripe Checkout Session (fixed or % deposit from JSON).  
   - Email/SMS guest the pay URL (ESP or Stripe receipt).  
   - Webhook `checkout.session.completed` → mark booking `deposit_paid`.  
   - Flag: `PUBLIC_FEATURE_PAYMENTS=1` + `STRIPE_SECRET_KEY` + webhook secret.  
   - UI: Svelte “Pay deposit” state on a tokenized `/book/pay?token=…` page (no public unpaid list).

2. **Payments M2 — guest-facing status**  
   - Success / cancel return URLs; clear copy; link back to packages.  
   - Owner hosting checklist: webhook URL, test mode → live flip.

3. **Accounts M1 — guest auth (wired)**  
   - Better Auth + Google; `PUBLIC_FEATURE_ACCOUNTS=1` + `BETTER_AUTH_SECRET` (or `AUTH_SECRET`), `BETTER_AUTH_URL`, `GOOGLE_CLIENT_*`, `AUTH_DATABASE_URL`.  
   - Svelte island: Continue with Google / sign-out in header (`header.accounts`).  
   - Next: attach auth subject to booking records created while signed in.

4. **Accounts M2 — admin**  
   - Role-gated `/admin` (Astro shell + Svelte table): inquiry queue, confirm, trigger deposit.  
   - Prefer Better Auth roles / allowlist over rolling our own permission DB.

5. **Accounts M3 — guest portal (optional)**  
   - “My bookings” read-only; deep-link to pay if unpaid.

### Flag & secrets contract

| Module | Public flag | Secrets | Safe when missing |
| --- | --- | --- | --- |
| `payments` | `PUBLIC_FEATURE_PAYMENTS` | `STRIPE_SECRET_KEY`, Stripe webhook secret; optional PayPal | Site up; no pay CTAs; booking still works as inquiry |
| `accounts` | `PUBLIC_FEATURE_ACCOUNTS` | `BETTER_AUTH_SECRET` (or `AUTH_SECRET`), `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_DATABASE_URL` (± `AUTH_DATABASE_AUTH_TOKEN`) | Site up; no sign-in chrome when flag off; `/api/auth/*` → 503 if secrets/DB missing |

Missing secrets ⇒ feature **off** or safe error. Never commit keys. Redeploy after env changes; confirm via `/api/capabilities`.

### Rollout & risk controls

| Stage | What | Exit criteria |
| --- | --- | --- |
| Preview | Flags on preview deploy only; Stripe test mode | Happy-path deposit in test; webhook delivers |
| Soft launch | One market / owner-operated events only | ≥5 real deposits; zero double-charge; refund path documented |
| General | Flags on production | Hosting checklist complete; support knows how to refund |

**Hard stops:** Do not enable payments without webhook + idempotent “already paid” handling. Do not enable admin without IdP role checks. Prefer Checkout over Elements for v1.

### Explicit non-goals (first adoption)

- DIY password DB / custom IdP  
- Storing card PANs  
- Full POS / tab-at-event charging  
- Venmo as sole processor  
- Accounts without a booking record to attach to

### Unpark trigger

Product owner schedules a dedicated sprint (not overnight), prerequisites checklist complete, and providers chosen in the Decision log below. Until then: keep both flags **off** in production and treat Modules 12 / 14 as documentation-only.

## Module flag map (planned)

| Module id | Env gate (planned) | Notes |
| --- | --- | --- |
| `social` | _(always on)_ | Footer social + profile embeds; Pane feed-id optional |
| `hero-media` | _(always on)_ | Rotating central images |
| `event-types` | _(always on)_ | Social / weddings / corporate / activations |
| `drink-calculator` | _(always on)_ | Planning utility |
| `locations` | _(always on)_ | Markets dropdown + pages |
| `franchise` | _(always on)_ | Open-a-location inquiry |
| `events-calendar` | _(always on)_ | Upcoming list |
| `live-chat` | `PUBLIC_FEATURE_LIVE_CHAT` | Vendor embed |
| `i18n` | `PUBLIC_FEATURE_I18N` | **Parked — leave off** until real locales |
| `mailing-list` | `PUBLIC_FEATURE_MAILING_LIST` | Exists in features.json |
| `accounts` | `PUBLIC_FEATURE_ACCOUNTS` | **Wire-in** Better Auth + Google; leave off in prod until secrets + migrate |
| `booking` | `PUBLIC_FEATURE_BOOKING` | Form posts to Function when on |
| `payments` | `PUBLIC_FEATURE_PAYMENTS` | **Parked** — see adoption plan |

## Decision log

| Decision | Choice |
| --- | --- |
| Languages | **Astro + Svelte only** |
| Offerings | `src/data/catalog.json` |
| Interactive UI | Svelte islands |
| Static shell | Astro pages/layouts |
| Hosting | **Cloudflare Pages** or **Netlify** (same `dist/`; parallel `/api/*` adapters) |
| Mistake corrected | SvelteKit-only migration reverted — Astro stays |
| Competitive ref | Sip feature set adopted into plan; Satellite brand + compact UX kept |
| Blog | **Dropped** — use testimonials instead |
| Hero media | Auto-rotating images are a first-class module, not decorative fluff |
| Locations | Service markets / cities — not brick-and-mortar bar hours as the product |
| Content modules | Always on (empty `publicEnv`); ops widgets stay flagged |
| Instagram feed | **Pane (B)** — live grid via `PUBLIC_PANE_FEED_ID`; Behold removed; Graph API deferred |
| i18n | **Flagged off** until translated copy exists |
| Accounts | **Better Auth + Google** wire-in; flag off in prod until secrets + libSQL migrate |
| Payments | **Parked** with adoption plan; Stripe Checkout when unparked |
