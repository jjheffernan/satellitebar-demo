# Social

Profile URLs live in `src/data/site.json` → `social`:

- `instagram` → https://www.instagram.com/satellitebarco/
- `facebook`
- `twitter` (X / Twitter — one link)

Rendered on **About** (`SocialLinks.astro`). Header stays nav/CTAs only; footer stays contact utilities.

## Instagram feed (Behold)

About also embeds [@behold/svelte](https://github.com/BeholdSocial/behold-svelte):

1. Create a feed in the [Behold dashboard](https://app.behold.so) connected to [@satellitebarco](https://www.instagram.com/satellitebarco/)
2. Copy the feed id from Embed Code
3. Set `PUBLIC_BEHOLD_FEED_ID` in `.env` (and Cloudflare Pages)

Widget only mounts when that env var is set.
