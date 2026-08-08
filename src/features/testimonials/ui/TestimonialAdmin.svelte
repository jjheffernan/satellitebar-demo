<script>
  import { createAuthClient } from "better-auth/client";

  const authClient = createAuthClient();

  let session = $state(null);
  let ready = $state(false);
  let busy = $state(false);
  let error = $state("");
  let pending = $state([]);
  let recent = $state([]);
  let forbidden = $state(false);

  async function loadSession() {
    try {
      const result = await authClient.getSession();
      session = result?.data ?? null;
    } catch {
      session = null;
    }
    ready = true;
  }

  async function loadQueue() {
    error = "";
    forbidden = false;
    try {
      const res = await fetch("/api/testimonials/admin", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) {
        forbidden = true;
        pending = [];
        recent = [];
        return;
      }
      if (res.status === 401) {
        pending = [];
        recent = [];
        return;
      }
      if (!res.ok) {
        error = data.error === "accounts_not_configured"
          ? "Accounts / database not configured on this deploy."
          : "Could not load moderation queue.";
        return;
      }
      pending = Array.isArray(data.pending) ? data.pending : [];
      recent = Array.isArray(data.recent) ? data.recent : [];
    } catch (err) {
      error = "Network error loading queue.";
      console.error(err);
    }
  }

  $effect(() => {
    let cancelled = false;
    loadSession().then(() => {
      if (!cancelled && session?.user) return loadQueue();
    });
    return () => {
      cancelled = true;
    };
  });

  async function signInGoogle() {
    busy = true;
    error = "";
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/admin/testimonials",
      });
    } catch (err) {
      error = "Sign-in unavailable.";
      busy = false;
      console.error(err);
    }
  }

  async function review(id, action) {
    busy = true;
    error = "";
    try {
      const res = await fetch("/api/testimonials/admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        error = data.error === "forbidden" ? "Not an admin account." : "Review failed.";
        busy = false;
        return;
      }
      await loadQueue();
    } catch (err) {
      error = "Network error.";
      console.error(err);
    } finally {
      busy = false;
    }
  }
</script>

<div class="admin">
  {#if !ready}
    <p class="muted">Checking sign-in…</p>
  {:else if !session?.user}
    <p class="muted">Sign in with a Google account on the admin allowlist to moderate testimonials.</p>
    <button type="button" class="btn" disabled={busy} onclick={signInGoogle}>Continue with Google</button>
  {:else if forbidden}
    <p class="err" role="status">
      Signed in as {session.user.email}, but this address is not in <code>ADMIN_EMAILS</code>.
    </p>
  {:else}
    <p class="who">Signed in as <strong>{session.user.email}</strong></p>

    <section aria-labelledby="pending-heading">
      <h2 id="pending-heading">Pending ({pending.length})</h2>
      {#if !pending.length}
        <p class="muted">No submissions waiting.</p>
      {:else}
        <ul>
          {#each pending as item (item.id)}
            <li>
              <blockquote>
                <p>“{item.quote}”</p>
                <footer>
                  <cite>{item.name}</cite>
                  {#if item.role}<span>{item.role}</span>{/if}
                  <span class="meta">{item.authorEmail} · {item.createdAt?.slice(0, 10)}</span>
                </footer>
              </blockquote>
              <div class="actions">
                <button type="button" class="btn btn--ok" disabled={busy} onclick={() => review(item.id, "approve")}>
                  Approve
                </button>
                <button type="button" class="btn btn--warn" disabled={busy} onclick={() => review(item.id, "reject")}>
                  Reject
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    {#if recent.length}
      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading">Recently reviewed</h2>
        <ul class="recent">
          {#each recent as item (item.id)}
            <li>
              <span class="status" data-status={item.status}>{item.status}</span>
              <span>{item.name}</span>
              <span class="muted truncate">“{item.quote}”</span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  {/if}

  {#if error}
    <p class="err" role="status">{error}</p>
  {/if}
</div>

<style>
  .admin {
    display: grid;
    gap: 1.25rem;
  }

  h2 {
    margin: 0 0 0.55rem;
    font-size: 1.05rem;
  }

  .muted {
    color: var(--muted-foreground);
    font-size: 0.9rem;
  }

  .who {
    margin: 0;
    font-size: 0.88rem;
  }

  .err {
    margin: 0;
    color: var(--destructive, #a33);
    font-size: 0.88rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.85rem;
  }

  li {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 0.85rem;
    background: color-mix(in oklch, var(--muted) 22%, transparent);
  }

  blockquote {
    margin: 0 0 0.65rem;
  }

  blockquote p {
    margin: 0 0 0.45rem;
    line-height: 1.4;
  }

  footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.75rem;
    font-size: 0.8rem;
    color: var(--muted-foreground);
  }

  cite {
    font-style: normal;
    font-weight: 600;
    color: var(--foreground);
  }

  .meta {
    flex-basis: 100%;
    font-size: 0.75rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .btn {
    appearance: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--foreground);
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.4rem 0.75rem;
    cursor: pointer;
  }

  .btn--ok {
    border-color: var(--primary);
    color: var(--primary);
  }

  .btn--warn {
    border-color: color-mix(in oklch, var(--foreground) 35%, var(--border));
  }

  .btn:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .recent li {
    display: grid;
    gap: 0.2rem;
    padding: 0.65rem 0.75rem;
  }

  .status {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .status[data-status="approved"] {
    color: var(--primary);
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  code {
    font-size: 0.85em;
  }
</style>
