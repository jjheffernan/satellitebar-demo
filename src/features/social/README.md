# Social

Profile URLs live in `src/data/site.json` → `social`:

- `instagram` → https://www.instagram.com/satellitebarco/
- `facebook`
- `twitter` (X / Twitter — one link)

Rendered on **About** (`SocialLinks.astro`). Header stays nav/CTAs only; footer stays contact utilities.

## Contact embeds

`/contact` embeds:

- **X** — timeline widget (`platform.twitter.com/widgets.js`)
- **Instagram** — Behold when `PUBLIC_BEHOLD_FEED_ID` is set
- **Facebook** — page plugin iframe

## Instagram feed (Behold)

1. Create a feed in the [Behold dashboard](https://app.behold.so) for [@satellitebarco](https://www.instagram.com/satellitebarco/)
2. Copy the feed id from Embed Code
3. Set `PUBLIC_BEHOLD_FEED_ID` in `.env` (and Cloudflare Pages)

Used on About and Contact.
