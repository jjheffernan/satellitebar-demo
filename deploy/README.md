# Deploy adapters

All host Functions live here. Site source stays Astro + Svelte under `src/`.

```
deploy/
  shared/       # libSQL auth + testimonials + calendar helpers (both hosts)
  cloudflare/   # Cloudflare Pages Functions → /api/*
  netlify/      # Netlify Functions (config maps each to /api/…)
```

| Host | Config | Functions path |
| --- | --- | --- |
| Cloudflare Pages | `wrangler.jsonc` | `deploy/cloudflare` (root `functions` → symlink; Pages requires that name) |
| Netlify | `netlify.toml` | `deploy/netlify` |

Publish dir for both: `dist/` (`pnpm build`).
