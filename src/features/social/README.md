# Social module

## Enable

1. Set `PUBLIC_FEATURE_SOCIAL=1` in Cloudflare / `.env`.
2. Fill `social` URLs in `src/data/site.json`.
3. Restart `pnpm dev` / redeploy.

Footer social row: `FeatureSlot.astro` → `FooterSocial.svelte`.
