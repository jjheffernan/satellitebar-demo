<script>
  let { menus = [] } = $props();

  let activeId = $state(menus[0]?.id ?? "");

  const active = $derived(menus.find((m) => m.id === activeId) ?? menus[0]);
</script>

{#if menus.length}
  <div class="sample-menu">
    <div class="sample-menu__tabs" role="tablist" aria-label="Sample menu tier">
      {#each menus as menu}
        <button
          type="button"
          role="tab"
          id={`menu-tab-${menu.id}`}
          aria-selected={activeId === menu.id}
          aria-controls={`menu-panel-${menu.id}`}
          class:active={activeId === menu.id}
          onclick={() => (activeId = menu.id)}
        >
          {menu.label}
        </button>
      {/each}
    </div>

    {#if active}
      <div
        class="sample-menu__panel"
        role="tabpanel"
        id={`menu-panel-${active.id}`}
        aria-labelledby={`menu-tab-${active.id}`}
      >
        <header>
          <h2>{active.name}</h2>
          <p>{active.summary}</p>
        </header>

        {#each active.sections as section}
          <section class="sample-menu__section" aria-label={section.title}>
            <h3>{section.title}</h3>
            <ul>
              {#each section.items as item}
                <li>
                  <span class="name">{item.name}</span>
                  {#if item.note}
                    <span class="note">{item.note}</span>
                  {/if}
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .sample-menu__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-bottom: 1rem;
  }

  .sample-menu__tabs button {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted-foreground);
    border-radius: var(--radius-md);
    padding: 0.4rem 0.75rem;
    font: inherit;
    font-size: 0.88rem;
    cursor: pointer;
  }

  .sample-menu__tabs button.active,
  .sample-menu__tabs button:hover {
    color: var(--primary-foreground);
    background: var(--primary);
    border-color: var(--primary);
  }

  .sample-menu__panel header {
    margin-bottom: 1rem;
    max-width: 36rem;
  }

  .sample-menu__panel h2 {
    margin: 0 0 0.3rem;
    font-size: 1.25rem;
  }

  .sample-menu__panel header p {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .sample-menu__section {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
  }

  .sample-menu__section h3 {
    margin: 0 0 0.45rem;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--primary);
  }

  .sample-menu__section ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.45rem;
  }

  .sample-menu__section li {
    display: grid;
    gap: 0.1rem;
  }

  .name {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 0.98rem;
  }

  .note {
    color: var(--muted-foreground);
    font-size: 0.85rem;
  }

  @media (min-width: 720px) {
    .sample-menu__section ul {
      grid-template-columns: 1fr 1fr;
      gap: 0.55rem 1.25rem;
    }
  }
</style>
