<script>
  let { greeting = "", agentName = "Desk", mailtoFallback = "" } = $props();

  let open = $state(false);
  let showHint = $state(true);
</script>

<div class="chat">
  {#if showHint && !open}
    <div class="hint" role="status">
      <p><strong>{agentName}</strong> — {greeting}</p>
      <button type="button" aria-label="Dismiss" onclick={() => (showHint = false)}>×</button>
    </div>
  {/if}

  {#if open}
    <div class="panel" role="dialog" aria-label="Chat">
      <p>{greeting}</p>
      <a href={`mailto:${mailtoFallback}?subject=Chat%20question`}>Email us instead</a>
      <p class="note">Vendor embed wires here when `PUBLIC_FEATURE_LIVE_CHAT` secrets are set.</p>
    </div>
  {/if}

  <button class="launcher" type="button" aria-expanded={open} onclick={() => (open = !open)}>
    {open ? "Close" : "Chat"}
  </button>
</div>

<style>
  .chat {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: 50;
    display: grid;
    justify-items: end;
    gap: 0.5rem;
  }

  .hint,
  .panel {
    max-width: 16rem;
    padding: 0.7rem 0.8rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--card);
    font-size: 0.82rem;
  }

  .hint {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.35rem;
  }

  .hint p,
  .panel p {
    margin: 0;
  }

  .hint button {
    border: 0;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
    font-size: 1rem;
  }

  .panel a {
    color: var(--primary);
  }

  .note {
    margin-top: 0.5rem !important;
    color: var(--muted-foreground);
  }

  .launcher {
    border: 0;
    border-radius: 999px;
    min-width: 3.2rem;
    min-height: 3.2rem;
    padding: 0 0.9rem;
    background: var(--accent);
    color: var(--accent-foreground);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
</style>
