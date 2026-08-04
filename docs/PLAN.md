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

## Feature phases

### Phase 1 — Social (`social`)

- [x] Slot `footer.social`
- [ ] Production profile URLs
- [ ] Optional Instagram embed island

### Phase 2 — Events calendar (optional)

- [ ] Static/list adapter when flagged

### Phase 3 — Mailing list

- [ ] Signup island + ESP Function

### Phase 4 — Accounts

- [ ] Hosted IdP; guest + admin (Svelte islands for auth UI)

### Phase 5 — Booking

- [ ] Replace mailto stub; keep form in Astro/Svelte

### Phase 6 — Payments

- [ ] Stripe + PayPal (± Venmo)

### Phase 7 — Owner hosting guide

- [ ] Expand `docs/hosting/*`

## Decision log

| Decision | Choice |
| --- | --- |
| Languages | **Astro + Svelte only** |
| Offerings | `src/data/catalog.json` |
| Interactive UI | Svelte islands |
| Static shell | Astro pages/layouts |
| Hosting | Cloudflare Pages |
| Mistake corrected | SvelteKit-only migration reverted — Astro stays |
