# Satellite Bar Co

Marketing + ordering hub for a **mobile bartending** company.

## Languages

**Astro + Svelte only** for site source. No TypeScript / no app JS / no SvelteKit.

## Stack

- Astro 7 (pages/layouts)
- Svelte 5 islands (`client:load` where interactive)
- Tailwind CSS v4
- Deploy on **Cloudflare Workers** or **Netlify** (see [docs/hosting/README.md](docs/hosting/README.md))

## Quick start

```bash
pnpm install
pnpm dev
```

Optional: `PUBLIC_FEATURE_SOCIAL=1`

## Routes

| Path | Purpose |
|------|---------|
| `/` | Hub |
| `/packages` | Package catalog (Svelte filter island) |
| `/menu` | Cocktails |
| `/book` | Booking request |
| `/about` | Company |

## Docs

- [docs/VISION.md](docs/VISION.md)
- [docs/PLAN.md](docs/PLAN.md)
- [docs/hosting/README.md](docs/hosting/README.md)
