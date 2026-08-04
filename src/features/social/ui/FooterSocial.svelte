<script>
  let { networks = [] } = $props();
</script>

{#if networks.length}
  <nav class="feature-social" aria-label="Social">
    {#each networks as n}
      <a href={n.href} rel="noopener noreferrer" target="_blank">{n.label}</a>
    {/each}
  </nav>
{/if}

<style>
  .feature-social {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 0.45rem;
    font-size: 0.82rem;
  }

  .feature-social a {
    color: var(--muted-foreground);
    text-decoration: none;
    border-bottom: 1px solid var(--border);
  }
</style>
