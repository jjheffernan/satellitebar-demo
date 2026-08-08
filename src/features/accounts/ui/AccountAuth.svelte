<script>
  import { createAuthClient } from "better-auth/client";

  let { enabled = false } = $props();

  const authClient = createAuthClient();

  let session = $state(null);
  let ready = $state(false);
  let busy = $state(false);
  let error = $state("");

  $effect(() => {
    if (!enabled) {
      session = null;
      ready = false;
      return;
    }

    let cancelled = false;
    ready = false;
    error = "";

    authClient
      .getSession()
      .then((result) => {
        if (cancelled) return;
        session = result?.data ?? null;
        ready = true;
      })
      .catch(() => {
        if (cancelled) return;
        session = null;
        ready = true;
      });

    return () => {
      cancelled = true;
    };
  });

  async function signInGoogle() {
    if (busy) return;
    busy = true;
    error = "";
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      error = "Sign-in unavailable. Try again later.";
      busy = false;
      console.error(err);
    }
  }

  async function signOut() {
    if (busy) return;
    busy = true;
    error = "";
    try {
      await authClient.signOut();
      session = null;
    } catch (err) {
      error = "Sign-out failed.";
      console.error(err);
    } finally {
      busy = false;
    }
  }

  const label = $derived(
    session?.user?.name || session?.user?.email || "Account",
  );
</script>

{#if enabled}
  <div class="account-auth" data-ready={ready}>
    {#if !ready}
      <span class="account-auth__status" aria-hidden="true">…</span>
    {:else if session?.user}
      <span class="account-auth__who" title={session.user.email ?? label}>{label}</span>
      <button type="button" class="account-auth__btn" disabled={busy} onclick={signOut}>
        Sign out
      </button>
    {:else}
      <button type="button" class="account-auth__btn account-auth__btn--google" disabled={busy} onclick={signInGoogle}>
        Continue with Google
      </button>
    {/if}
    {#if error}
      <p class="account-auth__error" role="status">{error}</p>
    {/if}
  </div>
{/if}

<style>
  .account-auth {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem 0.65rem;
    max-width: 12rem;
  }

  .account-auth__status {
    color: var(--muted-foreground);
    font-size: 0.85rem;
  }

  .account-auth__who {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--muted-foreground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 7.5rem;
  }

  .account-auth__btn {
    appearance: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--muted) 40%, transparent);
    color: var(--foreground);
    font: inherit;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.35rem 0.65rem;
    cursor: pointer;
    white-space: nowrap;
  }

  .account-auth__btn:hover:not(:disabled) {
    border-color: color-mix(in oklch, var(--primary) 45%, var(--border));
    color: var(--primary);
  }

  .account-auth__btn:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .account-auth__btn--google {
    background: color-mix(in oklch, var(--card) 80%, transparent);
  }

  .account-auth__error {
    margin: 0;
    flex-basis: 100%;
    font-size: 0.7rem;
    color: var(--destructive, #a33);
    line-height: 1.3;
  }
</style>
