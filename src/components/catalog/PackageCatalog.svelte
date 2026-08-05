<script>
  let { items = [], quote = null, eventTypes = [], sampleMenus = [] } = $props();

  const menuTiers = $derived(quote?.menuTiers ?? []);
  const glassware = $derived(quote?.glassware ?? []);
  const naProgram = $derived(quote?.naProgram ?? []);
  const setupFee = $derived(quote?.setupFee ?? 0);

  const sizePackages = $derived(items.filter((p) => p.kind !== "event"));
  const eventPackages = $derived(items.filter((p) => p.kind === "event"));

  let guests = $state(60);
  let hours = $state(4);
  let menuIndex = $state(1);
  let glassIndex = $state(1);
  let naIndex = $state(0);
  let selectedId = $state("");

  const menu = $derived(menuTiers[Number(menuIndex)] ?? menuTiers[0]);
  const glass = $derived(glassware[Number(glassIndex)] ?? glassware[0]);
  const na = $derived(naProgram[Number(naIndex)] ?? naProgram[0]);
  const guestCount = $derived(Number(guests));
  const hourCount = $derived(Number(hours));

  const estimated = $derived.by(() => {
    if (!menu) return 0;
    const service = guestCount * hourCount * menu.perGuestHour;
    const extras = guestCount * ((glass?.perGuest ?? 0) + (na?.perGuest ?? 0));
    return Math.round(setupFee + service + extras);
  });

  const suggested = $derived.by(() => {
    if (selectedId) {
      const picked = items.find((p) => p.id === selectedId);
      if (picked) return picked;
    }
    const match = sizePackages.find(
      (p) => guestCount >= (p.guestsMin ?? 0) && guestCount <= (p.guestsMax ?? 999),
    );
    if (match) return match;
    if (guestCount < (sizePackages[0]?.guestsMin ?? 25)) return sizePackages[0];
    return sizePackages.at(-1) ?? items[0];
  });

  function formatUsd(n) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  }

  function eventLabel(id) {
    return eventTypes.find((t) => t.id === id)?.title ?? id;
  }

  function sampleMenu(id) {
    return sampleMenus.find((m) => m.id === id) ?? null;
  }

  function applyPackage(pkg) {
    selectedId = pkg.id;
    const preset = pkg.preset;
    if (!preset) return;
    guests = preset.guests;
    hours = preset.hours;
    menuIndex = preset.menuIndex;
    glassIndex = preset.glassIndex;
    naIndex = preset.naIndex;
  }

  const bookHref = $derived(
    `/book?package=${suggested?.id ?? ""}&guests=${guestCount}&hours=${hourCount}${
      suggested?.eventType ? `&eventType=${suggested.eventType}` : ""
    }`,
  );
</script>

<section class="quote-block" aria-labelledby="quote-heading">
  <h2 id="quote-heading">Quote calculator</h2>
  <p class="packs__lede">Slide guests, hours, and menu style for a starting estimate.</p>

  <div class="quote">
    <div class="quote__sliders">
      <label class="slider">
        <span class="slider__head">
          <span>Guests</span>
          <strong>{guestCount}</strong>
        </span>
        <input type="range" min="20" max="180" step="5" bind:value={guests} />
        <span class="slider__scale"><span>20</span><span>180</span></span>
      </label>

      <label class="slider">
        <span class="slider__head">
          <span>Service hours</span>
          <strong>{hourCount} hr</strong>
        </span>
        <input type="range" min="2" max="6" step="1" bind:value={hours} />
        <span class="slider__scale"><span>2</span><span>6</span></span>
      </label>

      <label class="slider">
        <span class="slider__head">
          <span>Menu</span>
          <strong>{menu?.label ?? "—"}</strong>
        </span>
        <input
          type="range"
          min="0"
          max={Math.max(menuTiers.length - 1, 0)}
          step="1"
          bind:value={menuIndex}
        />
        <span class="slider__scale">
          <span>{menuTiers[0]?.label ?? ""}</span>
          <span>{menuTiers.at(-1)?.label ?? ""}</span>
        </span>
      </label>

      <label class="slider">
        <span class="slider__head">
          <span>Serviceware</span>
          <strong>{glass?.label ?? "—"}</strong>
        </span>
        <input
          type="range"
          min="0"
          max={Math.max(glassware.length - 1, 0)}
          step="1"
          bind:value={glassIndex}
        />
        <span class="slider__scale">
          <span>{glassware[0]?.label ?? ""}</span>
          <span>{glassware.at(-1)?.label ?? ""}</span>
        </span>
      </label>

      <label class="slider">
        <span class="slider__head">
          <span>Nonalcoholic program</span>
          <strong>{na?.label ?? "—"}</strong>
        </span>
        <input
          type="range"
          min="0"
          max={Math.max(naProgram.length - 1, 0)}
          step="1"
          bind:value={naIndex}
        />
        <span class="slider__scale">
          <span>{naProgram[0]?.label ?? ""}</span>
          <span>{naProgram.at(-1)?.label ?? ""}</span>
        </span>
      </label>
    </div>

    <aside class="quote__result" aria-live="polite">
      <p class="quote__eyebrow">Estimated quote</p>
      <p class="quote__total">{formatUsd(estimated)}</p>
      <p class="quote__band">
        Suggested package: <strong>{suggested?.name ?? "Custom"}</strong>
        {#if suggested}
          <span>
            {suggested.guests} guests · {suggested.duration}
            {#if suggested.eventType}
              · {eventLabel(suggested.eventType)}
            {/if}
          </span>
        {/if}
      </p>
      <ul class="quote__breakdown">
        <li>Setup <span>{formatUsd(setupFee)}</span></li>
        <li>
          {menu?.label ?? "Menu"} · {guestCount} × {hourCount} hr
          <span>{formatUsd(guestCount * hourCount * (menu?.perGuestHour ?? 0))}</span>
        </li>
        {#if (glass?.perGuest ?? 0) > 0}
          <li>
            {glass.label}
            <span>{formatUsd(guestCount * glass.perGuest)}</span>
          </li>
        {/if}
        {#if (na?.perGuest ?? 0) > 0}
          <li>
            {na.label}
            <span>{formatUsd(guestCount * na.perGuest)}</span>
          </li>
        {/if}
      </ul>
      <p class="quote__note">Starting estimate — final quote confirms after date and venue details.</p>
      <a class="quote__cta" href={bookHref}>Request this quote</a>
    </aside>
  </div>
</section>

{#if sizePackages.length}
  <section class="packs" aria-labelledby="branded-packs-heading">
    <h2 id="branded-packs-heading">Branded packages</h2>
    <p class="packs__lede">
      Orbit, Signal, and Deep Space match our
      <a class="packs__inline" href="/menu">sample menu</a>
      tiers — load one to seed the quote sliders.
    </p>
    <ul class="packs__grid packs__grid--size">
      {#each sizePackages as pkg (pkg.id)}
        {@const sample = sampleMenu(pkg.menuId)}
        <li id={pkg.id} class:active={suggested?.id === pkg.id || selectedId === pkg.id}>
          {#if sample}
            <p class="eyebrow">{sample.label} · {sample.name}</p>
          {/if}
          <h3>{pkg.name}</h3>
          <p>{sample?.summary ?? pkg.summary}</p>
          <p class="meta">{pkg.guests} guests · {pkg.duration} · {pkg.bestFor}</p>
          {#if sample}
            <ul class="includes">
              {#each sample.sections as section}
                <li>
                  <strong>{section.title}:</strong>
                  {section.items.map((i) => i.name).join(", ")}
                </li>
              {/each}
            </ul>
          {:else}
            <ul class="includes">
              {#each pkg.includes as line}
                <li>{line}</li>
              {/each}
            </ul>
          {/if}
          <div class="packs__actions">
            <button type="button" onclick={() => applyPackage(pkg)}>Load into quote</button>
            {#if sample}
              <a href="/menu">View sample menu</a>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  </section>
{/if}

{#if eventPackages.length}
  <section class="packs" aria-labelledby="event-packs-heading">
    <h2 id="event-packs-heading">Event packages</h2>
    <p class="packs__lede">Premade builds for the events we serve most.</p>
    <ul class="packs__grid packs__grid--event">
      {#each eventPackages as pkg (pkg.id)}
        <li id={pkg.id} class:active={selectedId === pkg.id}>
          <p class="eyebrow">{eventLabel(pkg.eventType)}</p>
          <h3>{pkg.name}</h3>
          <p>{pkg.summary}</p>
          <p class="meta">{pkg.guests} guests · {pkg.duration}</p>
          <ul class="includes">
            {#each pkg.includes as line}
              <li>{line}</li>
            {/each}
          </ul>
          <div class="packs__actions">
            <button type="button" onclick={() => applyPackage(pkg)}>Load into quote</button>
            <a href={`/events/${pkg.eventType}`}>Event details</a>
          </div>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .quote-block,
  .packs {
    margin-bottom: 2rem;
  }

  .packs:last-child {
    margin-bottom: 0;
  }

  .quote-block h2,
  .packs h2 {
    margin: 0 0 0.25rem;
    font-size: 1.05rem;
  }

  .packs__lede {
    margin: 0 0 0.75rem;
    color: var(--muted-foreground);
    font-size: 0.88rem;
  }

  .packs__inline {
    color: var(--primary);
    font-weight: 600;
    text-decoration: none;
  }

  .packs__inline:hover {
    border-bottom: 1px solid var(--primary);
  }

  .includes strong {
    color: var(--foreground);
    font-weight: 600;
  }

  .packs__grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.65rem;
  }

  @media (min-width: 800px) {
    .packs__grid--event {
      grid-template-columns: repeat(2, 1fr);
    }

    .packs__grid--size {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .packs__grid > li {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 0.85rem 0.95rem;
    background: var(--card);
  }

  .packs__grid > li.active {
    border-color: color-mix(in oklch, var(--primary) 55%, var(--border));
    background: color-mix(in oklch, var(--primary) 8%, var(--card));
  }

  .eyebrow {
    margin: 0 0 0.2rem;
    color: var(--primary);
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .packs h3 {
    margin: 0 0 0.3rem;
    font-size: 1.05rem;
  }

  .packs p {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.85rem;
    line-height: 1.35;
  }

  .meta {
    margin-top: 0.4rem !important;
    font-size: 0.78rem !important;
  }

  .includes {
    margin: 0.55rem 0 0.75rem;
    padding-left: 1rem;
    color: var(--muted-foreground);
    font-size: 0.82rem;
  }

  .packs__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
  }

  .packs button {
    border: 1px solid var(--primary);
    background: transparent;
    color: var(--primary);
    border-radius: var(--radius-md);
    padding: 0.35rem 0.7rem;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
  }

  .packs button:hover {
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .packs__actions a {
    color: var(--muted-foreground);
    font-size: 0.82rem;
    text-decoration: none;
  }

  .packs__actions a:hover {
    color: var(--primary);
  }

  .quote {
    display: grid;
    gap: 1.25rem;
  }

  @media (min-width: 860px) {
    .quote {
      grid-template-columns: 1.2fr 0.8fr;
      align-items: start;
      gap: 1.5rem;
    }
  }

  .quote__sliders {
    display: grid;
    gap: 1.1rem;
  }

  .slider {
    display: grid;
    gap: 0.35rem;
  }

  .slider__head {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.9rem;
  }

  .slider__head strong {
    color: var(--primary);
    font-weight: 700;
    text-align: right;
  }

  .slider input[type="range"] {
    width: 100%;
    accent-color: var(--primary);
    cursor: pointer;
  }

  .slider__scale {
    display: flex;
    justify-content: space-between;
    color: var(--muted-foreground);
    font-size: 0.72rem;
  }

  .quote__result {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 1rem 1.05rem;
    background: var(--card);
  }

  .quote__eyebrow {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .quote__total {
    margin: 0.25rem 0 0.45rem;
    font-family: var(--font-heading);
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--primary);
  }

  .quote__band {
    margin: 0 0 0.85rem;
    color: var(--muted-foreground);
    font-size: 0.9rem;
    line-height: 1.35;
  }

  .quote__band strong {
    color: var(--foreground);
  }

  .quote__band span {
    display: block;
    margin-top: 0.15rem;
    font-size: 0.82rem;
  }

  .quote__breakdown {
    list-style: none;
    margin: 0 0 0.85rem;
    padding: 0;
    border-top: 1px solid var(--border);
  }

  .quote__breakdown li {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.45rem 0;
    border-bottom: 1px solid var(--border);
    color: var(--muted-foreground);
    font-size: 0.85rem;
  }

  .quote__breakdown span {
    color: var(--foreground);
    white-space: nowrap;
  }

  .quote__note {
    margin: 0 0 0.85rem;
    color: var(--muted-foreground);
    font-size: 0.78rem;
    line-height: 1.35;
  }

  .quote__cta {
    display: inline-flex;
    text-decoration: none;
    background: var(--primary);
    color: var(--primary-foreground);
    padding: 0.55rem 0.95rem;
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 0.9rem;
  }
</style>
