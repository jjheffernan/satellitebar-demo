# Hosting & modules (owner guide)

Non-engineering checklist for Cloudflare Pages + feature flags.

## Deploy

1. Connect this GitHub repo to **Cloudflare Pages**.
2. Build command: `pnpm build`
3. Output directory: `dist`
4. Compatibility: Node (see `wrangler.jsonc`)
5. Optional: leave `functions/` in place for `/api/*` endpoints

## Turn a feature on

1. Pages → Settings → Environment variables
2. Add every `PUBLIC_FEATURE_*` (and secrets) listed for that module below
3. Save → redeploy
4. Confirm: open `/api/capabilities` — module `active: true`

## Turn a feature off

Remove the flag or set it to `0`. Redeploy. Public shell stays up; gated UI/slots render nothing (or redirect home).

## Module checklist

| Module | Public flags | Secrets | What you should see |
| --- | --- | --- | --- |
| Social | `PUBLIC_FEATURE_SOCIAL=1` | — | Footer social links |
| Hero media | `PUBLIC_FEATURE_HERO_MEDIA=1` | — | Rotating images under home hero |
| Event types | `PUBLIC_FEATURE_EVENT_TYPES=1` | — | Events nav + `/events/*` |
| Drink calculator | `PUBLIC_FEATURE_DRINK_CALCULATOR=1` | — | `/tools/drink-calculator` |
| Locations | `PUBLIC_FEATURE_LOCATIONS=1` | — | Locations nav + `/locations/*` |
| Franchise | `PUBLIC_FEATURE_FRANCHISE=1` | — | `/open` partner form |
| Blog | `PUBLIC_FEATURE_BLOG=1` | — | `/blog` |
| Events calendar | `PUBLIC_FEATURE_EVENTS_CALENDAR=1` | — | Upcoming list on home |
| Live chat | `PUBLIC_FEATURE_LIVE_CHAT=1` | vendor keys later | Floating chat launcher |
| i18n | `PUBLIC_FEATURE_I18N=1` | — | Locale control (copy strategy TBD) |
| Mailing list | `PUBLIC_FEATURE_MAILING_LIST=1` | `MAILING_LIST_API_KEY` | Footer signup → `/api/mailing-list` |
| Booking | `PUBLIC_FEATURE_BOOKING=1` | — | `/book` posts to `/api/booking` |
| Accounts | `PUBLIC_FEATURE_ACCOUNTS=1` | `AUTH_SECRET` | **Not shipped yet** (daytime) |
| Payments | `PUBLIC_FEATURE_PAYMENTS=1` | `STRIPE_SECRET_KEY` | **Not shipped yet** (daytime) |

## Rule of thumb

Missing secrets ⇒ feature stays off or returns a safe error. Never commit API keys. Site source languages stay **Astro + Svelte only**.
