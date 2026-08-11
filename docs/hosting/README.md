# Hosting & modules (owner guide)

Non-engineering checklist for **Cloudflare Workers** or **Netlify** + feature flags.

Site build is the same on both: `pnpm build` → `dist/` (Cloudflare also emits `.cf-worker/` for `/api/*`).  
`/api/*` lives under [`deploy/`](../../deploy/README.md) (shared helpers + per-host adapters).

## Choose a host

| | Cloudflare Workers | Netlify |
| --- | --- | --- |
| Config | `wrangler.jsonc` | `netlify.toml` |
| API routes | `deploy/cloudflare/api/*.js` (root `functions` → symlink; bundled at build) | `deploy/netlify/*.mjs` (`path: /api/…`) |
| Env vars | Worker → Settings → Variables and Secrets | Site → Project configuration → Environment variables |
| Headers | `public/_headers` (copied to `dist/`) | same `_headers` in publish dir |
| Local API | `pnpm cf:dev` (after `pnpm build`) | `npx netlify dev` (optional) |

Pick **one** production host. You can keep the other config in-repo for a future move.

---

## Deploy — Cloudflare Workers

1. Connect this GitHub repo to **Workers Builds** (Workers & Pages)
2. Build command: `pnpm build`
3. Deploy command: leave default (`npx wrangler deploy` / `pnpm run cf:deploy`)
4. Compatibility: Node (see `wrangler.jsonc` — `nodejs_compat`)
5. Leave `deploy/cloudflare/` (and root `functions` symlink) in place for `/api/*`

## Deploy — Netlify

1. Connect this GitHub repo to **Netlify**
2. Build settings are in `netlify.toml` (`pnpm build` → `dist`)
3. Node **22** + pnpm **9.15.0** (set in `netlify.toml`)
4. Leave `deploy/netlify/` in place for `/api/*`

CLI (optional):

```bash
npx netlify deploy --build --prod
```

---

## Always on (no flag)

These ship with the site shell — Events, Locations, drink calculator, hero media, social footer, calendar, testimonials, packages/menu/book/about/contact.

## Instagram feed (Pane)

Optional public config (not a feature flag):

1. Create a feed at [pane.so](https://pane.so/); allowlist your production domain(s) (and preview domains)
2. Set `PUBLIC_PANE_FEED_ID=<feed-id>`
3. Redeploy — About shows the live grid when wired; omit the var for profile-link fallback

Full decision + acceptance: [PLAN.md](../PLAN.md) Phase 1.

## Turn an ops feature on

1. Host dashboard → Environment variables (Cloudflare Worker **or** Netlify)
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
| Accounts | `PUBLIC_FEATURE_ACCOUNTS=1` | See [Accounts — Better Auth + Google](#accounts--better-auth--google) | Header “Continue with Google” when fully configured |
| Payments | `PUBLIC_FEATURE_PAYMENTS=1` | `STRIPE_SECRET_KEY` (+ webhook) | **Parked** — see PLAN adoption |

## Accounts — Better Auth + Google

Gmail SSO is wired (Astro’s preferred auth path: **Better Auth** + Google). Leave `PUBLIC_FEATURE_ACCOUNTS` **off** in production until the checklist below is green.

1. Create a Google Cloud **OAuth 2.0 Client ID** (Web application).
2. Authorized redirect URI (must match your live origin):
   - `{BETTER_AUTH_URL}/api/auth/callback/google`
   - Local example: `http://localhost:4321/api/auth/callback/google` (only if Functions are proxied locally)
3. Create a **Turso / libSQL** database; apply Better Auth schema (`npx auth@latest migrate` against a local auth config, or run the generated SQL in the Turso console).
4. Set env vars, then redeploy:

| Var | Notes |
| --- | --- |
| `PUBLIC_FEATURE_ACCOUNTS=1` | Shows header chrome |
| `BETTER_AUTH_SECRET` | ≥32 random chars (`AUTH_SECRET` accepted as alias) |
| `BETTER_AUTH_URL` | Canonical site origin, no trailing slash (e.g. `https://your-domain.example`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `AUTH_DATABASE_URL` | `libsql://…` (or file URL for local Node/Netlify experiments) |
| `AUTH_DATABASE_AUTH_TOKEN` | Turso token when using remote libSQL |
| `ADMIN_EMAILS` | Comma-separated Google emails allowed to moderate testimonials and manage `/admin/calendar` |

Confirm: `/api/capabilities` lists `accounts` as `active: true`. Missing secrets ⇒ `/api/auth/*` returns **503** JSON (`accounts_not_configured`).

### Testimonials (sign-in + approve)

With accounts configured:

1. Hosts sign in on the home page (“Share your experience”) and submit a quote → stored as **pending** in libSQL.
2. Admins open `/admin/testimonials`, sign in with an `ADMIN_EMAILS` address, **Approve** or **Reject**.
3. Approved quotes appear on the home page via `GET /api/testimonials` **without a rebuild** (seed JSON remains the offline fallback).

API routes:

- Cloudflare: `deploy/cloudflare/api/auth/[[path]].js`, `…/testimonials.js`, `…/testimonials/admin.js`
- Netlify: `deploy/netlify/auth.mjs` → `/api/auth/*`; `testimonials.mjs` / `testimonials-admin.mjs`

### Calendar admin (SVAR)

Same auth DB + `ADMIN_EMAILS`:

1. Open `/admin/calendar`, sign in, edit in SVAR (Day/Week/Month).
2. **Save to server** publishes to libSQL — public `/calendar` and home Upcoming merge `GET /api/calendar` (seed JSON fallback if DB off).
3. Import/export `.ics` or JSON from the admin toolbar (import replaces all events).

API routes: `GET /api/calendar`; admin `GET|POST|PUT|DELETE /api/calendar/admin`; `POST /api/calendar/admin/import`.

## Parked: payments

Do not enable payments in production yet. When ready, follow the adoption plan in [PLAN.md](../PLAN.md) (prerequisites → Stripe Checkout deposit → admin). Soft-launch in Stripe test mode first.

Webhook URLs (when payments ship) must match the host you chose:

- Cloudflare: `https://<your-pages-domain>/api/…`
- Netlify: `https://<your-netlify-domain>/api/…`

## Rule of thumb

Missing secrets ⇒ feature stays off or returns a safe error. Never commit API keys. Site source languages stay **Astro + Svelte only**.
