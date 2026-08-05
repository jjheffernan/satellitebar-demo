<script>
  let { locales = [], defaultLocale = "en" } = $props();

  let current = $state("en");

  $effect(() => {
    current = defaultLocale;
  });
</script>

{#if locales.length}
  <label class="locale">
    <span class="sr">Language</span>
    <select bind:value={current} aria-label="Language">
      {#each locales as locale}
        <option value={locale.id}>{locale.label}</option>
      {/each}
    </select>
  </label>
{/if}

<style>
  .locale {
    position: fixed;
    left: 1rem;
    bottom: 1rem;
    z-index: 50;
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  select {
    font: inherit;
    font-size: 0.8rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--foreground);
    padding: 0.35rem 0.55rem;
  }
</style>
