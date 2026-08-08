<script>
  import { createAuthClient } from "better-auth/client";

  let { enabled = false } = $props();

  const authClient = createAuthClient();

  let session = $state(null);
  let ready = $state(false);
  let busy = $state(false);
  let error = $state("");
  let sent = $state(false);

  let quote = $state("");
  let name = $state("");
  let role = $state("");

  $effect(() => {
    if (!enabled) {
      session = null;
      ready = false;
      return;
    }

    let cancelled = false;
    ready = false;

    authClient
      .getSession()
      .then((result) => {
        if (cancelled) return;
        session = result?.data ?? null;
        if (session?.user?.name && !name) name = session.user.name;
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
        callbackURL: "/#quotes-heading",
      });
    } catch (err) {
      error = "Sign-in unavailable. Try again later.";
      busy = false;
      console.error(err);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (busy || !session?.user) return;
    busy = true;
    error = "";
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          quote: quote.trim(),
          name: name.trim(),
          role: role.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "rate_limited") {
          error = "Slow down — you already sent a few recently.";
        } else if (data.error === "unauthorized") {
          error = "Sign in again, then retry.";
        } else {
          error = "Could not send. Check length and try again.";
        }
        busy = false;
        return;
      }
      sent = true;
      quote = "";
      role = "";
    } catch (err) {
      error = "Network error — try again.";
      console.error(err);
    } finally {
      busy = false;
    }
  }
</script>

{#if enabled}
  <div class="t-form" aria-labelledby="t-form-heading">
    <h3 id="t-form-heading">Share your experience</h3>
    {#if !ready}
      <p class="t-form__muted">Checking sign-in…</p>
    {:else if sent}
      <p class="t-form__ok" role="status">Thanks — your quote is pending review.</p>
    {:else if !session?.user}
      <p class="t-form__muted">Sign in with Google to leave a testimonial for the site.</p>
      <button type="button" class="t-form__btn" disabled={busy} onclick={signInGoogle}>
        Continue with Google
      </button>
    {:else}
      <form class="t-form__fields" onsubmit={submit}>
        <label>
          Quote
          <textarea
            name="quote"
            rows="3"
            required
            minlength="12"
            maxlength="600"
            bind:value={quote}
            placeholder="What stood out about the bar night…"
          ></textarea>
        </label>
        <div class="t-form__row">
          <label>
            Display name
            <input name="name" type="text" required maxlength="80" bind:value={name} />
          </label>
          <label>
            Role / event
            <input
              name="role"
              type="text"
              maxlength="120"
              bind:value={role}
              placeholder="Wedding host · Newark"
            />
          </label>
        </div>
        <button type="submit" class="t-form__btn" disabled={busy}>
          {busy ? "Sending…" : "Submit for review"}
        </button>
      </form>
    {/if}
    {#if error}
      <p class="t-form__error" role="status">{error}</p>
    {/if}
  </div>
{/if}

<style>
  .t-form {
    margin-top: 1rem;
    padding-top: 0.85rem;
    border-top: 1px solid var(--border);
    display: grid;
    gap: 0.55rem;
  }

  h3 {
    margin: 0;
    font-size: 0.95rem;
  }

  .t-form__muted {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.88rem;
  }

  .t-form__ok {
    margin: 0;
    color: var(--primary);
    font-size: 0.9rem;
    font-weight: 600;
  }

  .t-form__error {
    margin: 0;
    font-size: 0.8rem;
    color: var(--destructive, #a33);
  }

  .t-form__fields {
    display: grid;
    gap: 0.65rem;
  }

  .t-form__row {
    display: grid;
    gap: 0.65rem;
  }

  @media (min-width: 640px) {
    .t-form__row {
      grid-template-columns: 1fr 1fr;
    }
  }

  label {
    display: grid;
    gap: 0.3rem;
    font-size: 0.8rem;
    font-weight: 600;
  }

  input,
  textarea {
    font: inherit;
    font-weight: 400;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--muted) 35%, transparent);
    color: var(--foreground);
    padding: 0.5rem 0.65rem;
  }

  .t-form__btn {
    justify-self: start;
    appearance: none;
    border: 1px solid var(--primary);
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--primary);
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.45rem 0.85rem;
    cursor: pointer;
  }

  .t-form__btn:hover:not(:disabled) {
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .t-form__btn:disabled {
    opacity: 0.55;
    cursor: wait;
  }
</style>
