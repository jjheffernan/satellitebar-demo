# Hosting & modules (owner stub)

Full non-eng guide lands in Phase 7. This stub covers **how modules turn on/off**.

## Deploy (short)

1. Connect this repo to Cloudflare Pages.
2. Build command: `pnpm build` · Output: `dist`.
3. Add env vars in Pages → Settings → Environment variables.

## Turn a feature on

1. Open the module README under `src/features/<id>/README.md`.
2. Add every `PUBLIC_FEATURE_*` (and secrets) it lists.
3. Save → Pages redeploys.
4. Confirm: open `/api/capabilities` — module `active: true`.

## Turn a feature off

Remove or set its `PUBLIC_FEATURE_*` to `0`. Redeploy. Public pages stay up; that feature’s UI slots render nothing.

## Rule of thumb

Missing secrets ⇒ feature off, site still works. Never put API keys in the git repo.
