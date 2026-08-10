<script>
  let { events: seed = [] } = $props();

  let events = $state([...seed]);

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

  const today = () => new Date().toISOString().slice(0, 10);

  $effect(() => {
    let cancelled = false;
    events = [...seed];
    fetch("/api/calendar")
      .then((res) => (res.ok ? res.json() : { events: [] }))
      .then((data) => {
        if (cancelled) return;
        const apiItems = Array.isArray(data?.events) ? data.events : [];
        const merged = merge(seed, apiItems);
        const cutoff = today();
        events = merged
          .filter((event) => String(event.date) >= cutoff)
          .sort((a, b) => String(a.date).localeCompare(String(b.date)));
      })
      .catch(() => {
        if (!cancelled) events = [...seed];
      });
    return () => {
      cancelled = true;
    };
  });
</script>

{#if events.length}
  <ul class="cal">
    {#each events as event (event.id)}
      <li>
        <a href={event.href}>
          <span class="date">{event.date}</span>
          <span class="title">{event.title}</span>
          <span class="place">{event.place}</span>
        </a>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .cal {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--border);
  }

  li {
    border-bottom: 1px solid var(--border);
  }

  a {
    display: grid;
    gap: 0.1rem;
    padding: 0.65rem 0;
    text-decoration: none;
  }

  .date {
    color: var(--primary);
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .title {
    font-family: var(--font-heading);
    font-weight: 700;
  }

  .place {
    color: var(--muted-foreground);
    font-size: 0.82rem;
  }
</style>
