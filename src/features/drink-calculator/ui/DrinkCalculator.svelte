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
      vessel: "bottle",
      vesselLabel: "Beer bottle",
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
      label: "Premium / full menu",
      factor: 1.25,
      vessel: "fancy",
      vesselLabel: "Coupe glass",
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
          <span class="styles__name">{s.label}</span>
          <span class="styles__vessel">{s.vesselLabel}</span>
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

        {#if activeStyle.vessel === "bottle"}
          <svg class="gauge__icon" viewBox="0 0 64 120" aria-hidden="true">
            <path
              class="gauge__outline"
              d="M26 8h12l2 18c6 4 10 12 10 22v54a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10V48c0-10 4-18 10-22L26 8z"
            />
            <rect class="gauge__neck" x="28" y="4" width="8" height="10" rx="2" />
          </svg>
        {:else if activeStyle.vessel === "wine"}
          <svg class="gauge__icon" viewBox="0 0 64 120" aria-hidden="true">
            <path
              class="gauge__outline"
              d="M14 12h36c0 18-8 30-18 36v36h10v8H22v-8h10V48C22 42 14 30 14 12z"
            />
            <ellipse class="gauge__rim" cx="32" cy="12" rx="18" ry="3" />
          </svg>
        {:else}
          <svg class="gauge__icon" viewBox="0 0 64 120" aria-hidden="true">
            <path
              class="gauge__outline"
              d="M10 28c0-2 2-6 8-10 6-4 14-6 14-6s8 2 14 6c6 4 8 8 8 10 0 18-10 28-22 34v26h8v8H24v-8h8V62C20 56 10 46 10 28z"
            />
            <path class="gauge__rim" d="M12 28c4-8 12-14 20-14s16 6 20 14" />
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
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    column-gap: 0.55rem;
    row-gap: 0.05rem;
    align-items: center;
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
    grid-row: 1 / span 2;
    accent-color: var(--primary);
  }

  .styles__name {
    font-size: 0.9rem;
    font-weight: 600;
  }

  .styles__vessel {
    grid-column: 2;
    color: var(--muted-foreground);
    font-size: 0.75rem;
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

  .gauge__vessel[data-vessel="bottle"] .gauge__liquid {
    left: 28%;
    right: 28%;
    bottom: 12%;
    height: calc(58% * var(--level, 0));
    border-radius: 8px 8px 14px 14px;
  }

  .gauge__vessel[data-vessel="wine"] .gauge__liquid {
    left: 24%;
    right: 24%;
    bottom: 38%;
    height: calc(28% * var(--level, 0));
    border-radius: 50% 50% 40% 40%;
  }

  .gauge__vessel[data-vessel="fancy"] .gauge__liquid {
    left: 22%;
    right: 22%;
    bottom: 42%;
    height: calc(26% * var(--level, 0));
    border-radius: 45% 45% 35% 35%;
  }

  .gauge__icon {
    position: relative;
    z-index: 1;
    width: 42%;
    height: auto;
    overflow: visible;
  }

  .gauge__outline,
  .gauge__neck,
  .gauge__rim {
    fill: none;
    stroke: color-mix(in oklch, var(--foreground) 88%, var(--primary));
    stroke-width: 2.5;
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
