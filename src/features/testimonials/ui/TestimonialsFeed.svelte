<script>
  let { seed = [] } = $props();

  let items = $state([...seed]);

  function merge(seedItems, apiItems) {
    const map = new Map();
    for (const item of seedItems) {
      if (item?.id) map.set(item.id, item);
    }
    for (const item of apiItems) {
      if (item?.id) map.set(item.id, item);
    }
    return [...map.values()];
  }

  $effect(() => {
    let cancelled = false;
    items = [...seed];

    fetch("/api/testimonials")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (cancelled) return;
        const apiItems = Array.isArray(data?.items) ? data.items : [];
        items = merge(seed, apiItems);
      })
      .catch(() => {
        if (!cancelled) items = [...seed];
      });

    return () => {
      cancelled = true;
    };
  });
</script>

<ul class="quotes-list">
  {#each items as item (item.id)}
    <li>
      <blockquote>
        <p>“{item.quote}”</p>
        <footer>
          {#if item.image}
            <img
              class="quotes__photo"
              src={item.image}
              alt={item.imageAlt || ""}
              width="48"
              height="48"
              loading="lazy"
            />
          {/if}
          <span class="quotes__by">
            <cite>{item.name}</cite>
            {#if item.role}
              <span>{item.role}</span>
            {/if}
          </span>
        </footer>
      </blockquote>
    </li>
  {/each}
</ul>

<style>
  .quotes-list {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--border);
    display: grid;
    gap: 0;
  }

  li {
    border-bottom: 1px solid var(--border);
    padding: 0.75rem 0;
  }

  blockquote {
    margin: 0;
  }

  blockquote p {
    margin: 0 0 0.55rem;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.55rem 0.75rem;
    font-size: 0.8rem;
    color: var(--muted-foreground);
  }

  .quotes__photo {
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    object-fit: cover;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--muted);
  }

  .quotes__by {
    display: grid;
    gap: 0.1rem;
    min-width: 0;
  }

  cite {
    font-style: normal;
    font-weight: 600;
    color: var(--foreground);
  }

  @media (min-width: 800px) {
    .quotes-list {
      grid-template-columns: repeat(3, 1fr);
      gap: 0.85rem;
      border-top: 0;
    }

    li {
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.85rem;
      background: var(--card);
    }
  }
</style>
