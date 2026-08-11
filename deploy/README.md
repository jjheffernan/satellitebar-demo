# Deploy adapters

All host Functions live here. Site source stays Astro + Svelte under `src/`.

```
deploy/
  shared/       # libSQL auth + testimonials + calendar helpers (both hosts)
  cloudflare/   # Cloudflare Functions (Pages-style routes → bundled Worker) → /api/*
  netlify/      # Netlify Functions (config maps each to /api/…)
```

| Host | Config | Functions path |
| --- | --- | --- |
| Cloudflare Workers | `wrangler.jsonc` (`assets` + `main`) | `deploy/cloudflare` (root `functions` → symlink; bundled via `wrangler pages functions build`) |
| Netlify | `netlify.toml` | `deploy/netlify` |

Publish dir for both: `dist/` (`pnpm build` also builds the CF Worker bundle into `.cf-worker/`).
