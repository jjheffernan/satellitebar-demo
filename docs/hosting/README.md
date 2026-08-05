# Hosting & modules (owner guide)

Non-engineering checklist for Cloudflare Pages + feature flags.

## Deploy

1. Connect this GitHub repo to **Cloudflare Pages**.
2. Build command: `pnpm build`
3. Output directory: `dist`
4. Compatibility: Node (see `wrangler.jsonc`)
5. Optional: leave `functions/` in place for `/api/*` endpoints

## Always on (no flag)

These ship with the site shell — Events, Locations, drink calculator, hero media, social footer, calendar, testimonials, packages/menu/book/about/contact.

## Instagram feed (Pane)

Optional public config (not a feature flag):

1. Create a feed at [pane.so](https://pane.so/); allowlist your Pages domain(s)
2. Set `PUBLIC_PANE_FEED_ID=<feed-id>`
3. Redeploy — About / Contact show the live grid; omit the var to keep profile-link fallback

Full decision + acceptance: [PLAN.md](../PLAN.md) Phase 1.

## Turn an ops feature on

1. Pages → Settings → Environment variables
2. Add every `PUBLIC_FEATURE_*` (and secrets) listed below
3. Save → redeploy
4. Confirm: open `/api/capabilities` — module `active: true`

## Turn an ops feature off

Remove the flag or set it to `0`. Redeploy. Public shell stays up.

## Module checklist

| Module | Public flags | Secrets | What you should see |
| --- | --- | --- | --- |
| Live chat | `PUBLIC_FEATURE_LIVE_CHAT=1` | vendor keys later | Floating chat launcher |
| i18n | `PUBLIC_FEATURE_I18N=1` | — | Locale control — **leave off** until real translations |
| Mailing list | `PUBLIC_FEATURE_MAILING_LIST=1` | `MAILING_LIST_API_KEY` | Footer signup → `/api/mailing-list` |
| Booking Function | `PUBLIC_FEATURE_BOOKING=1` | — | `/book` posts to `/api/booking` (else mailto) |
| Accounts | `PUBLIC_FEATURE_ACCOUNTS=1` | IdP keys + `AUTH_SECRET` | **Parked** — see PLAN adoption |
| Payments | `PUBLIC_FEATURE_PAYMENTS=1` | `STRIPE_SECRET_KEY` (+ webhook) | **Parked** — see PLAN adoption |

## Parked: accounts & payments

Do not enable in production yet. When ready, follow the adoption plan in [PLAN.md](../PLAN.md) (prerequisites → Stripe Checkout deposit → hosted IdP → admin). Soft-launch in Stripe test mode first.

## Rule of thumb

Missing secrets ⇒ feature stays off or returns a safe error. Never commit API keys. Site source languages stay **Astro + Svelte only**.
