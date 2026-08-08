<script>
  let { packages = [] } = $props();

  let guests = $state(60);
  let hours = $state(4);
  let style = $state("mixed");

  const styles = [
    {
      id: "beer-wine",
      label: "Beer & wine",
      factor: 0.7,
      vessel: "beer",
      vesselLabel: "Beer glass",
    },
    {
      id: "mixed",
      label: "Mixed cocktails",
      factor: 1,
      vessel: "wine",
      vesselLabel: "Wine glass",
    },
    {
      id: "premium",
      label: "Premium / full bar",
      factor: 1.25,
      vessel: "whiskey",
      vesselLabel: "Whiskey glass",
    },
  ];

  const guestCount = $derived(Number(guests) || 0);
  const hourCount = $derived(Number(hours) || 0);
  const activeStyle = $derived(styles.find((s) => s.id === style) ?? styles[1]);

  const drinks = $derived(
    Math.round(guestCount * hourCount * 1.3 * (activeStyle?.factor ?? 1)),
  );

  /** Gauge saturates around a large wedding-night pour. */
  const gaugeMax = 800;
  const fill = $derived(Math.min(1, Math.max(0, drinks / gaugeMax)));
  const fillPct = $derived(Math.round(fill * 100));
  const ring = $derived(2 * Math.PI * 54);
  const ringOffset = $derived(ring * (1 - fill));

  const suggested = $derived.by(() => {
    const sized = packages.filter((p) => p.kind !== "event");
    const pool = sized.length ? sized : packages;
    if (!pool.length) return null;
    if (guestCount <= 50) return pool.find((p) => (p.guestsMin ?? 25) <= 50) ?? pool[0];
    if (guestCount <= 100)
      return pool.find((p) => (p.guestsMin ?? 0) >= 50 && (p.guestsMax ?? 100) <= 100) ?? pool[1] ?? pool[0];
    return pool.find((p) => (p.guestsMin ?? 0) >= 100) ?? pool.at(-1);
  });

  const perHour = $derived(hourCount > 0 ? Math.round(drinks / hourCount) : 0);
</script>

<div class="calc">
  <div class="calc__controls">
    <label>
      Guests
      <input type="number" min="10" max="300" bind:value={guests} />
    </label>
    <label>
      Hours
      <input type="number" min="2" max="8" bind:value={hours} />
    </label>
    <fieldset class="styles">
      <legend>Drink style</legend>
      {#each styles as s}
        <label class="styles__option" class:active={style === s.id}>
          <input type="radio" name="drink-style" value={s.id} bind:group={style} />
          <span class="styles__icon" aria-hidden="true">
            {#if s.vessel === "beer"}
              <!-- Lucide beer · ISC https://lucide.dev/icons/beer -->
              <svg viewBox="0 0 24 24"
                ><path d="M17 11h1a3 3 0 0 1 0 6h-1" /><path d="M9 12v6" /><path d="M13 12v6" /><path
                  d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"
                /><path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" /></svg
              >
            {:else if s.vessel === "wine"}
              <!-- Lucide wine · ISC https://lucide.dev/icons/wine -->
              <svg viewBox="0 0 24 24"
                ><path d="M8 22h8" /><path d="M7 10h10" /><path d="M12 15v7" /><path
                  d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"
                /></svg
              >
            {:else}
              <!-- Rocks / whiskey tumbler (Lucide-style stroke) -->
              <svg viewBox="0 0 24 24"
                ><path d="M6 5h12l-1.2 14.2A2 2 0 0 1 14.8 21H9.2a2 2 0 0 1-2-1.8L6 5Z" /><path
                  d="M7.2 11h9.6"
                /><path d="M10 8.5h1.2v2.2H10z" /><path d="M12.8 7.8h1.4v2.8h-1.4z" /></svg
              >
            {/if}
          </span>
          <span class="styles__name">{s.label}</span>
        </label>
      {/each}
    </fieldset>

    {#if suggested}
      <p class="suggest">
        Suggested band: <strong>{suggested.name}</strong>
        <span>({suggested.guests})</span>
      </p>
      <div class="actions">
        <a href="/packages">See packages</a>
        <a class="primary" href={`/book?package=${suggested.id}&guests=${guestCount}`}>
          Check availability
        </a>
      </div>
    {/if}
  </div>

  <div class="gauge" aria-live="polite">
    <div class="gauge__ring" style={`--fill: ${fill};`}>
      <svg class="gauge__track" viewBox="0 0 120 120" aria-hidden="true">
        <circle class="gauge__bg" cx="60" cy="60" r="54" />
        <circle
          class="gauge__arc"
          cx="60"
          cy="60"
          r="54"
          stroke-dasharray={ring}
          stroke-dashoffset={ringOffset}
          transform="rotate(-90 60 60)"
        />
      </svg>

      <div class="gauge__vessel" data-vessel={activeStyle.vessel}>
        <div class="gauge__liquid" style={`--level: ${fill};`}></div>

        {#if activeStyle.vessel === "beer"}
          <!-- Lucide beer · ISC https://lucide.dev/icons/beer -->
          <svg class="gauge__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 11h1a3 3 0 0 1 0 6h-1" />
            <path d="M9 12v6" />
            <path d="M13 12v6" />
            <path
              d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"
            />
            <path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
          </svg>
        {:else if activeStyle.vessel === "wine"}
          <!-- Lucide wine · ISC https://lucide.dev/icons/wine -->
          <svg class="gauge__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 22h8" />
            <path d="M7 10h10" />
            <path d="M12 15v7" />
            <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
          </svg>
        {:else}
          <!-- Rocks / whiskey tumbler -->
          <svg class="gauge__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 5h12l-1.2 14.2A2 2 0 0 1 14.8 21H9.2a2 2 0 0 1-2-1.8L6 5Z" />
            <path d="M7.2 11h9.6" />
            <path d="M10 8.5h1.2v2.2H10z" />
            <path d="M12.8 7.8h1.4v2.8h-1.4z" />
          </svg>
        {/if}
      </div>
    </div>

    <div class="gauge__readout">
      <p class="gauge__count">
        <strong>{drinks}</strong>
        <span>drinks</span>
      </p>
      <p class="gauge__meta">
        ~{perHour}/hour · {activeStyle.vesselLabel}
        <span class="gauge__pct">{fillPct}% of a full-night peak</span>
      </p>
    </div>
  </div>
</div>

<style>
  .calc {
    display: grid;
    gap: 1.75rem;
  }

  @media (min-width: 820px) {
    .calc {
      grid-template-columns: minmax(15rem, 20rem) minmax(0, 1fr);
      align-items: start;
      gap: 2.5rem;
    }
  }

  .calc__controls {
    display: grid;
    gap: 0.85rem;
  }

  label:not(.styles__option) {
    display: grid;
    gap: 0.25rem;
    font-size: 0.85rem;
  }

  input[type="number"] {
    font: inherit;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--foreground);
    padding: 0.45rem 0.65rem;
  }

  .styles {
    margin: 0;
    padding: 0;
    border: 0;
    display: grid;
    gap: 0.4rem;
  }

  .styles legend {
    padding: 0;
    margin-bottom: 0.35rem;
    font-size: 0.85rem;
  }

  .styles__option {
    display: grid;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    column-gap: 0.55rem;
    padding: 0.55rem 0.7rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--card);
    cursor: pointer;
  }

  .styles__option.active {
    border-color: color-mix(in oklch, var(--primary) 55%, var(--border));
    background: color-mix(in oklch, var(--primary) 8%, var(--card));
  }

  .styles__option input {
    accent-color: var(--primary);
  }

  .styles__icon {
    display: grid;
    place-items: center;
    width: 2.1rem;
    height: 2.1rem;
    color: var(--primary);
  }

  .styles__icon svg {
    width: 1.35rem;
    height: 1.35rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .styles__name {
    font-size: 0.9rem;
    font-weight: 600;
    min-width: 0;
  }

  .suggest {
    margin: 0.25rem 0 0;
    color: var(--muted-foreground);
    font-size: 0.9rem;
    line-height: 1.35;
  }

  .suggest span {
    display: inline;
    opacity: 0.85;
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
    padding: 0.45rem 0.8rem;
    font-size: 0.85rem;
    color: var(--foreground);
  }

  .actions a.primary {
    background: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
    font-weight: 700;
  }

  .gauge {
    display: grid;
    justify-items: center;
    gap: 1rem;
    padding: 1.25rem 1rem 1.5rem;
    border: 1px solid var(--border);
    border-radius: calc(var(--radius-md) + 0.15rem);
    background:
      radial-gradient(ellipse 70% 55% at 50% 35%, color-mix(in oklch, var(--primary) 14%, transparent), transparent 70%),
      var(--card);
  }

  .gauge__ring {
    position: relative;
    width: min(100%, 17rem);
    aspect-ratio: 1;
  }

  .gauge__track {
    width: 100%;
    height: 100%;
  }

  .gauge__bg,
  .gauge__arc {
    fill: none;
    stroke-width: 6;
  }

  .gauge__bg {
    stroke: color-mix(in oklch, var(--border) 80%, transparent);
  }

  .gauge__arc {
    stroke: var(--primary);
    stroke-linecap: round;
    transition: stroke-dashoffset 280ms ease;
  }

  .gauge__vessel {
    position: absolute;
    inset: 18%;
    display: grid;
    place-items: center;
    border-radius: 50%;
    overflow: hidden;
  }

  .gauge__liquid {
    position: absolute;
    left: 12%;
    right: 12%;
    bottom: 10%;
    height: calc(70% * var(--level, 0));
    border-radius: 40% 40% 12% 12%;
    background: linear-gradient(
      180deg,
      color-mix(in oklch, var(--primary) 75%, white),
      var(--primary)
    );
    opacity: 0.55;
    transition: height 280ms ease;
    pointer-events: none;
  }

  .gauge__vessel[data-vessel="beer"] .gauge__liquid {
    left: 30%;
    right: 26%;
    bottom: 14%;
    height: calc(48% * var(--level, 0));
    border-radius: 4px 4px 10px 10px;
  }

  .gauge__vessel[data-vessel="wine"] .gauge__liquid {
    left: 34%;
    right: 34%;
    bottom: 42%;
    height: calc(22% * var(--level, 0));
    border-radius: 50% 50% 40% 40%;
  }

  .gauge__vessel[data-vessel="whiskey"] .gauge__liquid {
    left: 28%;
    right: 28%;
    bottom: 18%;
    height: calc(42% * var(--level, 0));
    border-radius: 2px 2px 8px 8px;
  }

  .gauge__icon {
    position: relative;
    z-index: 1;
    width: 46%;
    height: auto;
    overflow: visible;
    fill: none;
    stroke: color-mix(in oklch, var(--foreground) 88%, var(--primary));
    stroke-width: 1.75;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .gauge__readout {
    text-align: center;
  }

  .gauge__count {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
  }

  .gauge__count strong {
    font-family: var(--font-heading);
    font-size: clamp(2.4rem, 6vw, 3.4rem);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--primary);
  }

  .gauge__count span {
    color: var(--muted-foreground);
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .gauge__meta {
    margin: 0.45rem 0 0;
    color: var(--muted-foreground);
    font-size: 0.88rem;
    line-height: 1.4;
  }

  .gauge__pct {
    display: block;
    margin-top: 0.15rem;
    font-size: 0.78rem;
    opacity: 0.85;
  }
</style>
