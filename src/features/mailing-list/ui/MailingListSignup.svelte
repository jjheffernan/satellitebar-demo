<script>
  let email = $state("");
  let status = $state("");

  async function submit(e) {
    e.preventDefault();
    status = "";
    try {
      const res = await fetch("/api/mailing-list", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      status = res.ok ? "Thanks — you’re on the list." : "Could not subscribe right now.";
      if (res.ok) email = "";
    } catch {
      status = "Network error — try again later.";
    }
  }
</script>

<form class="mail" onsubmit={submit}>
  <label>
    Mailing list
    <input type="email" required placeholder="you@example.com" bind:value={email} autocomplete="email" />
  </label>
  <button type="submit">Join</button>
  {#if status}
    <p>{status}</p>
  {/if}
</form>

<style>
  .mail {
    display: grid;
    gap: 0.4rem;
    margin-top: 0.65rem;
  }

  label {
    display: grid;
    gap: 0.25rem;
    font-size: 0.8rem;
    color: var(--muted-foreground);
  }

  input,
  button {
    font: inherit;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    padding: 0.4rem 0.6rem;
  }

  input {
    background: var(--card);
    color: var(--foreground);
  }

  button {
    background: var(--secondary);
    color: var(--secondary-foreground);
    cursor: pointer;
    width: fit-content;
  }

  p {
    margin: 0;
    font-size: 0.8rem;
    color: var(--muted-foreground);
  }
</style>
