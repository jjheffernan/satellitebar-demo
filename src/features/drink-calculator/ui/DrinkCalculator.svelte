<script>
  let { packages = [] } = $props();

  let guests = $state(60);
  let hours = $state(4);
  let style = $state("mixed");

  const styles = [
    { id: "beer-wine", label: "Beer & wine", factor: 0.7 },
    { id: "mixed", label: "Mixed cocktails", factor: 1 },
    { id: "premium", label: "Premium / full menu", factor: 1.25 },
  ];

  let drinks = $derived(Math.round(guests * hours * 1.3 * (styles.find((s) => s.id === style)?.factor ?? 1)));

  let suggested = $derived.by(() => {
    const sized = packages.filter((p) => p.kind !== "event");
    const pool = sized.length ? sized : packages;
    if (!pool.length) return null;
    if (guests <= 50) return pool.find((p) => (p.guestsMin ?? 25) <= 50) ?? pool[0];
    if (guests <= 100) return pool.find((p) => (p.guestsMin ?? 0) >= 50 && (p.guestsMax ?? 100) <= 100) ?? pool[1] ?? pool[0];
    return pool.find((p) => (p.guestsMin ?? 0) >= 100) ?? pool.at(-1);
  });
</script>

<div class="calc">
  <label>
    Guests
    <input type="number" min="10" max="300" bind:value={guests} />
  </label>
  <label>
    Hours
    <input type="number" min="2" max="8" bind:value={hours} />
  </label>
  <label>
    Drink style
    <select bind:value={style}>
      {#each styles as s}
        <option value={s.id}>{s.label}</option>
      {/each}
    </select>
  </label>

  <p class="result">About <strong>{drinks}</strong> drinks across the night.</p>

  {#if suggested}
    <p class="suggest">
      Suggested band: <strong>{suggested.name}</strong> ({suggested.guests})
    </p>
    <div class="actions">
      <a href={`/packages`}>See packages</a>
      <a class="primary" href={`/book?package=${suggested.id}&guests=${guests}`}>Check availability</a>
    </div>
  {/if}
</div>

<style>
  .calc {
    display: grid;
    gap: 0.75rem;
    max-width: 24rem;
  }

  label {
    display: grid;
    gap: 0.25rem;
    font-size: 0.85rem;
  }

  input,
  select {
    font: inherit;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--foreground);
    padding: 0.45rem 0.65rem;
  }

  .result,
  .suggest {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.92rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .actions a {
    text-decoration: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
  }

  .actions a.primary {
    background: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
  }
</style>
