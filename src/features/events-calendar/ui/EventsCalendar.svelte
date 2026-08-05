<script>
  let { events = [] } = $props();
</script>

{#if events.length}
  <ul class="cal">
    {#each events as event}
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
