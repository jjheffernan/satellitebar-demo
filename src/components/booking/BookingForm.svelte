<script>
  import LocationsMap from "../locations/LocationsMap.svelte";

  let {
    action = "",
    method = "get",
    /** "standard" = in-radius book · "outside" = beyond service radius */
    variant = "standard",
    packages = [],
    markets = [],
    eventTypes = [],
    region = null,
    selectedPackage = "",
    guests = "",
    market = "",
    eventType = "",
    hours = "",
    hint = "",
  } = $props();

  const outside = $derived(variant === "outside");

  let marketId = $state(market || markets[0]?.id || "");

  const selectedMarket = $derived(markets.find((m) => m.id === marketId));
</script>

<form class="book-form" {method} {action}>
  <input type="hidden" name="scope" value={outside ? "outside" : "standard"} />

  <section class="book-form__location" aria-labelledby="location-heading">
    <h2 id="location-heading">Location</h2>
    <p class="book-form__hint">
      {#if outside}
        We’re based in northern Delaware. Tell us where your venue is and we’ll see if we can travel.
      {:else}
        Tap a market on the map, then add the venue address.
        {#if selectedMarket}
          <span>Serving {selectedMarket.serviceArea}.</span>
        {/if}
      {/if}
    </p>

    <LocationsMap
      compact
      center={region?.center ?? [-75.64, 39.71]}
      zoom={region?.zoom ?? 10.2}
      {markets}
      radiusMiles={region?.serviceRadiusMiles ?? 15}
      selectedId={outside ? "" : marketId}
      onSelect={outside ? undefined : (m) => (marketId = m.id)}
    />

    {#if outside}
      <label>
        Region / city
        <input
          name="region"
          type="text"
          required
          placeholder="City, metro, or travel area"
          autocomplete="address-level2"
        />
      </label>
    {:else}
      <label>
        Market
        <select name="market" required bind:value={marketId}>
          {#each markets as m}
            <option value={m.id}>{m.name}</option>
          {/each}
        </select>
      </label>
    {/if}

    <label>
      Venue name
      <input name="venue" type="text" autocomplete="organization" placeholder="Home, loft, barn…" />
    </label>

    <label>
      Street address
      <input name="address" type="text" required autocomplete="street-address" />
    </label>

    <div class="row">
      <label>
        City
        <input name="city" type="text" required autocomplete="address-level2" />
      </label>
      <label>
        State
        <input
          name="state"
          type="text"
          required
          autocomplete="address-level1"
          maxlength="2"
          placeholder="DE"
        />
      </label>
      <label>
        ZIP
        <input name="zip" type="text" required autocomplete="postal-code" inputmode="numeric" />
      </label>
    </div>
  </section>

  <section class="book-form__event" aria-labelledby="event-heading">
    <h2 id="event-heading">Event</h2>

    <div class="row">
      <label>
        Name
        <input name="name" type="text" required autocomplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required autocomplete="email" />
      </label>
    </div>

    <div class="row">
      <label>
        Event date
        <input name="date" type="date" required />
      </label>
      <label>
        Guests
        <input name="guests" type="number" min="10" max="300" required value={guests} />
      </label>
    </div>

    {#if hours && !outside}
      <input type="hidden" name="hours" value={hours} />
    {/if}

    {#if !outside}
      <label>
        Event type
        <select name="eventType">
          <option value="">Select…</option>
          {#each eventTypes as type}
            <option value={type.id} selected={type.id === eventType}>{type.title}</option>
          {/each}
        </select>
      </label>

      <label>
        Package
        <select name="package" required>
          <option value="">Select…</option>
          {#each packages as pkg}
            <option value={pkg.id} selected={pkg.id === selectedPackage}>{pkg.name}</option>
          {/each}
        </select>
      </label>
    {/if}

    <label>
      Notes
      <textarea
        name="notes"
        rows="2"
        placeholder={outside
          ? "Distance, date flexibility, what you need from the bar…"
          : "Vibe, must-have drinks, timing…"}
      ></textarea>
    </label>
  </section>

  {#if hint}
    <p class="hint">{hint}</p>
  {/if}
  <button type="submit">{outside ? "Request travel quote" : "Check availability"}</button>
</form>

<style>
  .book-form {
    display: grid;
    gap: 1.25rem;
    max-width: 40rem;
    margin-top: 0.75rem;
  }

  .book-form__location,
  .book-form__event {
    display: grid;
    gap: 0.65rem;
  }

  .book-form h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .book-form__hint,
  .hint {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.85rem;
    line-height: 1.35;
  }

  .row {
    display: grid;
    gap: 0.65rem;
  }

  label {
    display: grid;
    gap: 0.25rem;
    font-size: 0.85rem;
  }

  input,
  select,
  textarea,
  button {
    font: inherit;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--foreground);
    padding: 0.45rem 0.65rem;
  }

  button[type="submit"] {
    background: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
    font-weight: 600;
    cursor: pointer;
    min-height: 2.4rem;
  }

  @media (min-width: 520px) {
    .row {
      grid-template-columns: 1fr 1fr;
    }

    .book-form__location .row {
      grid-template-columns: 1.4fr 0.6fr 0.8fr;
    }
  }
</style>
