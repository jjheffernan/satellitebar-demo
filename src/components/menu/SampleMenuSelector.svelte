<script>
  let { ballpark = null } = $props();

  const levels = $derived(ballpark?.levels ?? []);
  const maxLevel = $derived(Math.max(levels.length - 1, 0));
  let levelValue = $state(0);
  const level = $derived(Number(levelValue));
  let includeNa = $state(true);
  let boardPulse = $state(0);

  const active = $derived(levels[level] ?? levels[0]);

  const tierPool = $derived(
    (ballpark?.sections ?? []).flatMap((section) =>
      section.items
        .filter((item) => item.unlock === level)
        .map((item) => ({ ...item, section: section.title })),
    ),
  );

  const naInTier = $derived(tierPool.filter((item) => item.na).length);

  const visibleSections = $derived(
    (ballpark?.sections ?? [])
      .map((section) => ({
        title: section.title,
        items: section.items
          .filter((item) => item.unlock === level)
          .filter((item) => includeNa || !item.na)
          .map((item) => ({
            ...item,
            key: `${level}:${section.title}:${item.name}:${boardPulse}`,
          })),
      }))
      .filter((section) => section.items.length > 0),
  );

  const drinkCount = $derived(
    visibleSections.reduce((n, section) => n + section.items.length, 0),
  );

  const sectionCount = $derived(visibleSections.length);

  const naShown = $derived(
    includeNa ? visibleSections.reduce((n, s) => n + s.items.filter((i) => i.na).length, 0) : 0,
  );

  const query = $derived(
    `menu=${active?.id ?? "simple"}${includeNa ? "&na=1" : "&na=0"}`,
  );

  function selectLevel(index) {
    if (Number(levelValue) === index) return;
    levelValue = index;
    boardPulse += 1;
  }

  function onSliderChange() {
    boardPulse += 1;
  }
</script>

{#if levels.length}
  <div class="picker">
    <div class="picker__controls">
      <div
        class="picker__tabs"
        role="tablist"
        aria-label="Menu level"
        style={`grid-template-columns: repeat(${levels.length}, minmax(0, 1fr))`}
      >
        {#each levels as tier, index}
          <button
            type="button"
            role="tab"
            id={`menu-tab-${tier.id}`}
            aria-selected={level === index}
            aria-controls="menu-board"
            class:active={level === index}
            onclick={() => selectLevel(index)}
          >
            <span class="picker__tab-label">{tier.label}</span>
            <span class="picker__tab-idx">{index + 1}/{levels.length}</span>
          </button>
        {/each}
      </div>

      <label class="picker__slider">
        <input
          type="range"
          min="0"
          max={maxLevel}
          step="1"
          bind:value={levelValue}
          list="menu-level-ticks"
          aria-label="Menu depth"
          aria-valuetext={active?.name}
          oninput={onSliderChange}
        />
        <datalist id="menu-level-ticks">
          {#each levels as _, index}
            <option value={index}></option>
          {/each}
        </datalist>
        <span
          class="picker__ticks"
          style={`grid-template-columns: repeat(${levels.length}, 1fr)`}
          aria-hidden="true"
        >
          {#each levels as tier}
            <span>{tier.label}</span>
          {/each}
        </span>
      </label>

      <div class="picker__meta" aria-live="polite">
        <div class="stat">
          <span class="stat__k">Tier</span>
          <span class="stat__v">{active?.label}</span>
        </div>
        <div class="stat">
          <span class="stat__k">Pours</span>
          <span class="stat__v quote-num">{drinkCount}</span>
        </div>
        <div class="stat">
          <span class="stat__k">Sections</span>
          <span class="stat__v quote-num">{sectionCount}</span>
        </div>
        <div class="stat">
          <span class="stat__k">NA</span>
          <span class="stat__v">
            {#if !naInTier}
              —
            {:else if includeNa}
              <span class="quote-num">{naShown}</span> on
            {:else}
              <span class="quote-num">{naInTier}</span> off
            {/if}
          </span>
        </div>
        {#if naInTier > 0}
          <label class="picker__na">
            <input type="checkbox" bind:checked={includeNa} />
            <span>Include NA</span>
          </label>
        {/if}
      </div>
    </div>

    <div
      class="picker__board"
      id="menu-board"
      role="tabpanel"
      aria-labelledby={`menu-tab-${active?.id}`}
    >
      <header class="picker__header">
        <h2>{active?.name}</h2>
        <p>{active?.summary}</p>
      </header>

      {#each visibleSections as section (section.title + boardPulse)}
        <section class="picker__section" aria-label={section.title}>
          <h3>
            {section.title}
            <span class="quote-num">{section.items.length}</span>
          </h3>
          <ul>
            {#each section.items as item (item.key)}
              <li class="fresh" class:na={item.na}>
                {#if item.na}
                  <span class="pill pill--na">NA</span>
                {/if}
                <span class="name">{item.name}</span>
                {#if item.note}
                  <span class="note">{item.note}</span>
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/each}

      <p class="picker__next">
        <a href={`/packages?${query}`}>Packages for {active?.label}</a>
        ·
        <a href={`/book?${query}`}>Check availability</a>
      </p>
    </div>
  </div>
{/if}

<style>
  .picker {
    width: 100%;
    max-width: 40rem;
    min-width: 0;
  }

  .picker__controls {
    display: grid;
    gap: 0.65rem;
    margin-bottom: 1.15rem;
  }

  .picker__tabs {
    display: grid;
    gap: 0.4rem;
  }

  .picker__tabs button {
    display: grid;
    gap: 0.1rem;
    min-height: 2.75rem;
    padding: 0.45rem 0.55rem;
    border: 1px solid var(--border);
    background: color-mix(in oklch, var(--muted) 30%, transparent);
    color: var(--muted-foreground);
    border-radius: var(--radius-md);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .picker__tab-label {
    font-size: 0.88rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .picker__tab-idx {
    font-size: 0.68rem;
    opacity: 0.75;
  }

  .picker__tabs button.active,
  .picker__tabs button:hover {
    color: var(--primary-foreground);
    background: var(--primary);
    border-color: var(--primary);
  }

  .picker__slider {
    display: grid;
    gap: 0.2rem;
  }

  .picker__slider input[type="range"] {
    width: 100%;
    height: 2rem;
    accent-color: var(--primary);
    cursor: pointer;
  }

  .picker__ticks {
    display: grid;
    color: var(--muted-foreground);
    font-size: 0.68rem;
  }

  .picker__ticks span:not(:first-child):not(:last-child) {
    text-align: center;
  }

  .picker__ticks span:last-child:not(:only-child) {
    text-align: right;
  }

  .picker__meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
    align-items: stretch;
  }

  .stat {
    display: grid;
    gap: 0.05rem;
    padding: 0.45rem 0.55rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--muted) 28%, transparent);
    min-width: 0;
  }

  .stat__k {
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }

  .stat__v {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--foreground);
    line-height: 1.2;
  }

  .quote-num {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1;
  }

  .picker__na {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0;
    padding: 0.45rem 0.55rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--muted) 28%, transparent);
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 600;
    grid-column: 1 / -1;
  }

  .picker__na input {
    width: 1.1rem;
    height: 1.1rem;
    accent-color: var(--primary);
    flex-shrink: 0;
  }

  .picker__header {
    margin-bottom: 0.85rem;
  }

  .picker__header h2 {
    margin: 0 0 0.25rem;
    font-size: 1.25rem;
  }

  .picker__header p {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.88rem;
    line-height: 1.4;
  }

  .picker__section {
    margin-top: 0.85rem;
    padding-top: 0.65rem;
    border-top: 1px solid var(--border);
  }

  .picker__section h3 {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    margin: 0 0 0.5rem;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--primary);
  }

  .picker__section h3 .quote-num {
    color: var(--muted-foreground);
    letter-spacing: 0;
    text-transform: none;
    font-size: 0.8rem;
  }

  .picker__section ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.45rem;
  }

  .picker__section li {
    position: relative;
    display: grid;
    gap: 0.1rem;
    padding: 0.5rem 0.6rem;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
  }

  .picker__section li.fresh {
    border-color: color-mix(in oklch, var(--primary) 40%, var(--border));
    background: color-mix(in oklch, var(--primary) 10%, transparent);
    animation: pop-in 300ms ease-out;
  }

  .picker__section li.na {
    border-color: color-mix(in oklch, var(--border) 85%, transparent);
  }

  .pill {
    position: absolute;
    top: 0.35rem;
    right: 0.4rem;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }

  .name {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 0.95rem;
    padding-right: 2.2rem;
  }

  .note {
    color: var(--muted-foreground);
    font-size: 0.82rem;
  }

  .picker__next {
    margin: 1.2rem 0 0;
    color: var(--muted-foreground);
    font-size: 0.88rem;
  }

  .picker__next a {
    color: var(--primary);
    font-weight: 600;
    text-decoration: none;
  }

  .picker__next a:hover {
    color: var(--foreground);
  }

  @keyframes pop-in {
    from {
      opacity: 0;
      transform: translateY(0.4rem) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .picker__section li.fresh {
      animation: none;
    }
  }

  @media (min-width: 560px) {
    .picker__meta {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .picker__na {
      grid-column: 1 / -1;
      justify-self: start;
    }
  }

  @media (min-width: 720px) {
    .picker__section ul {
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem 0.9rem;
    }

    .picker__slider input[type="range"] {
      height: 1.6rem;
    }
  }
</style>
