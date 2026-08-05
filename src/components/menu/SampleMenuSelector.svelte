<script>
  let { menus = [] } = $props();

  const maxTier = $derived(Math.max(menus.length - 1, 0));
  let tierValue = $state(0);
  const tier = $derived(Number(tierValue));

  const leftIndex = $derived(Math.min(Math.floor(tier), maxTier));
  const rightIndex = $derived(Math.min(Math.ceil(tier), maxTier));
  const blend = $derived(tier - leftIndex);
  const onPreset = $derived(blend < 0.02 || rightIndex === leftIndex);
  const left = $derived(menus[leftIndex]);
  const right = $derived(menus[rightIndex]);
  const nearestIndex = $derived(Math.min(Math.max(Math.round(tier), 0), maxTier));
  const nearest = $derived(menus[nearestIndex] ?? menus[0]);

  function selectPreset(index) {
    tierValue = index;
  }

  function panelId(menu, side) {
    return `menu-panel-${menu?.id ?? "x"}-${side}`;
  }
</script>

{#if menus.length}
  <div class="sample-menu">
    <div class="sample-menu__controls">
      <div class="sample-menu__tabs" role="tablist" aria-label="Sample menu tier">
        {#each menus as menu, index}
          <button
            type="button"
            role="tab"
            id={`menu-tab-${menu.id}`}
            aria-selected={nearestIndex === index}
            aria-controls={panelId(nearest, "main")}
            class:active={nearestIndex === index}
            onclick={() => selectPreset(index)}
          >
            {menu.label}
          </button>
        {/each}
      </div>

      <label class="sample-menu__slider">
        <span class="sample-menu__slider-head">
          <span>Menu range</span>
          <strong>
            {#if onPreset}
              {left?.label}
            {:else}
              {left?.label} → {right?.label}
            {/if}
          </strong>
        </span>
        <input
          type="range"
          min="0"
          max={maxTier}
          step="0.01"
          bind:value={tierValue}
          aria-valuetext={onPreset
            ? left?.name
            : `Between ${left?.name} and ${right?.name}`}
        />
        <span class="sample-menu__slider-scale">
          <span>{menus[0]?.label ?? ""}</span>
          <span>{menus.at(-1)?.label ?? ""}</span>
        </span>
      </label>
    </div>

    <div
      class="sample-menu__stage"
      class:sample-menu__stage--blend={!onPreset}
      aria-live="polite"
    >
      {#if left}
        <div
          class="sample-menu__panel"
          class:sample-menu__panel--under={!onPreset}
          role="tabpanel"
          id={panelId(left, "left")}
          aria-labelledby={`menu-tab-${left.id}`}
          style={`opacity: ${onPreset ? 1 : 1 - blend};`}
          aria-hidden={!onPreset && blend > 0.85}
        >
          <header>
            <h2>{left.name}</h2>
            <p>{left.summary}</p>
          </header>
          {#each left.sections as section}
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

      {#if !onPreset && right && rightIndex !== leftIndex}
        <div
          class="sample-menu__panel sample-menu__panel--over"
          role="tabpanel"
          id={panelId(right, "right")}
          aria-labelledby={`menu-tab-${right.id}`}
          style={`opacity: ${blend};`}
          aria-hidden={blend < 0.15}
        >
          <header>
            <h2>{right.name}</h2>
            <p>{right.summary}</p>
          </header>
          {#each right.sections as section}
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
  </div>
{/if}

<style>
  .sample-menu__controls {
    display: grid;
    gap: 0.85rem;
    margin-bottom: 1.15rem;
  }

  .sample-menu__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
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

  .sample-menu__slider {
    display: grid;
    gap: 0.35rem;
    max-width: 28rem;
  }

  .sample-menu__slider-head {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.88rem;
  }

  .sample-menu__slider-head strong {
    color: var(--primary);
    font-weight: 700;
    text-align: right;
  }

  .sample-menu__slider input[type="range"] {
    width: 100%;
    accent-color: var(--primary);
    cursor: pointer;
  }

  .sample-menu__slider-scale {
    display: flex;
    justify-content: space-between;
    color: var(--muted-foreground);
    font-size: 0.72rem;
  }

  .sample-menu__stage {
    position: relative;
  }

  .sample-menu__stage--blend {
    min-height: 28rem;
  }

  .sample-menu__panel--under,
  .sample-menu__panel--over {
    transition: opacity 80ms linear;
  }

  .sample-menu__panel--over {
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    pointer-events: none;
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
    .sample-menu__controls {
      grid-template-columns: auto minmax(12rem, 1fr);
      align-items: end;
      gap: 1rem 1.5rem;
    }

    .sample-menu__slider {
      max-width: none;
    }

    .sample-menu__section ul {
      grid-template-columns: 1fr 1fr;
      gap: 0.55rem 1.25rem;
    }

    .sample-menu__stage--blend {
      min-height: 22rem;
    }
  }
</style>
