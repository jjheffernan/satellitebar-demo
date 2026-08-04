<script>
  let { items = [] } = $props();

  const filters = ["all", "25–50", "50–100", "100–180"];
  let active = $state("all");

  let visible = $derived(
    active === "all" ? items : items.filter((p) => p.guests === active),
  );

  function formatUsd(n) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  }
</script>

<div class="catalog">
  <div class="catalog__filters" role="group" aria-label="Filter by guest count">
    {#each filters as filter}
      <button type="button" class:active={active === filter} onclick={() => (active = filter)}>
        {filter === "all" ? "All packages" : filter + " guests"}
      </button>
    {/each}
  </div>

  <ul class="catalog__list">
    {#each visible as pkg (pkg.id)}
      <li>
        <header>
          <h3>{pkg.name}</h3>
          <p class="price">From {formatUsd(pkg.fromPrice)}</p>
        </header>
        <p class="summary">{pkg.summary}</p>
        <dl>
          <div><dt>Guests</dt><dd>{pkg.guests}</dd></div>
          <div><dt>Duration</dt><dd>{pkg.duration}</dd></div>
          <div><dt>Best for</dt><dd>{pkg.bestFor}</dd></div>
        </dl>
        <ul class="includes">
          {#each pkg.includes as line}
            <li>{line}</li>
          {/each}
        </ul>
        <a class="cta" href={`/book?package=${pkg.id}`}>Request this package</a>
      </li>
    {:else}
      <li class="empty">No packages in that guest range.</li>
    {/each}
  </ul>
</div>

<style>
  .catalog__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-bottom: 0.85rem;
  }

  .catalog__filters button {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted-foreground);
    border-radius: var(--radius-md);
    padding: 0.35rem 0.65rem;
    font: inherit;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .catalog__filters button.active,
  .catalog__filters button:hover {
    color: var(--primary-foreground);
    background: var(--primary);
    border-color: var(--primary);
  }

  .catalog__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.65rem;
  }

  .catalog__list > li {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 0.85rem 0.95rem;
    background: var(--card);
  }

  .catalog__list header {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: baseline;
    margin-bottom: 0.25rem;
  }

  .catalog__list h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .price {
    margin: 0;
    color: var(--primary);
    font-weight: 700;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .summary {
    margin: 0 0 0.55rem;
    color: var(--muted-foreground);
    font-size: 0.88rem;
    line-height: 1.35;
  }

  dl {
    display: grid;
    gap: 0.25rem;
    margin: 0 0 0.55rem;
  }

  dl div {
    display: grid;
    grid-template-columns: 5rem 1fr;
    gap: 0.4rem;
    font-size: 0.85rem;
  }

  dt {
    color: var(--muted-foreground);
  }

  dd {
    margin: 0;
  }

  .includes {
    margin: 0 0 0.75rem;
    padding-left: 1rem;
    color: var(--muted-foreground);
    font-size: 0.85rem;
  }

  .cta {
    display: inline-flex;
    text-decoration: none;
    background: var(--primary);
    color: var(--primary-foreground);
    padding: 0.4rem 0.8rem;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 0.85rem;
  }

  .empty {
    border-style: dashed;
    color: var(--muted-foreground);
  }

  @media (min-width: 800px) {
    .catalog__list {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
