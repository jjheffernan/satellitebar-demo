# Social

Profile URLs live in `src/data/site.json` → `social`:

- `instagram` → https://www.instagram.com/satellitebarco/
- `facebook`
- `twitter` (X / Twitter — one link)

Rendered on **About** (`SocialLinks.astro`). Header stays nav/CTAs only; footer stays contact utilities.

## Contact embeds

`/contact` embeds:

- **X** — timeline widget (`platform.twitter.com/widgets.js`)
- **Instagram** — profile link for now; live feed TBD (see `docs/PLAN.md` → Instagram feed options)
- **Facebook** — page plugin iframe

## Instagram feed

Behold was removed (requires an external SaaS dashboard). Options for a business-account feed are tracked in [PLAN.md](../../../docs/PLAN.md).
