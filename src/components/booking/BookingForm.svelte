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
  let packageId = $state(selectedPackage || "");
  let eventTypeId = $state(eventType || "");
  let street = $state("");
  let city = $state("");
  let state = $state("");
  let zip = $state("");
  let venuePin = $state(null);
  let pinStatus = $state("");

  const selectedMarket = $derived(markets.find((m) => m.id === marketId));

  const addressQuery = $derived(
    [street, city, state, zip].map((p) => String(p || "").trim()).filter(Boolean).join(", "),
  );

  // ponytail: Photon geocode; swap for keyed provider if rate limits bite
  async function geocodeVenue(query, bias) {
    const url = new URL("https://photon.komoot.io/api/");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "1");
    if (bias?.lngLat) {
      url.searchParams.set("lon", String(bias.lngLat[0]));
      url.searchParams.set("lat", String(bias.lngLat[1]));
    }
    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0];
    const lngLat = feature?.geometry?.coordinates;
    if (!Array.isArray(lngLat) || lngLat.length < 2) return null;
    const props = feature.properties ?? {};
    const label = [props.name, props.street, props.city || props.county, props.state]
      .filter(Boolean)
      .join(", ");
    return { lngLat, label: label || query };
  }

  $effect(() => {
    const query = addressQuery;
    const bias = selectedMarket;
    if (!street.trim() || !city.trim() || !state.trim()) {
      venuePin = null;
      pinStatus = "";
      return;
    }

    pinStatus = "Finding address on the map…";
    const handle = setTimeout(async () => {
      try {
        const hit = await geocodeVenue(query, bias);
        if (addressQuery !== query) return;
        if (hit) {
          venuePin = hit;
          pinStatus = "Confirm this pin matches your venue.";
        } else {
          venuePin = null;
          pinStatus = "Couldn’t place that address — check street, city, and ZIP.";
        }
      } catch {
        if (addressQuery !== query) return;
        venuePin = null;
        pinStatus = "Map lookup unavailable — you can still submit the booking.";
      }
    }, 550);

    return () => clearTimeout(handle);
  });
</script>

<form class="book-form" {method} {action}>
  <input type="hidden" name="scope" value={outside ? "outside" : "standard"} />

  <section class="book-form__location" aria-labelledby="location-heading">
    <h2 id="location-heading">Location</h2>
    <p class="book-form__hint">
      {#if outside}
        We’re based in northern Delaware. Enter the venue address — the map pin updates so you can confirm the spot.
      {:else}
        Pick a market, then enter the venue address. One pin shows where we’ll pour so you can confirm it’s right.
        {#if selectedMarket}
          <span>Serving {selectedMarket.serviceArea}.</span>
        {/if}
      {/if}
    </p>

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
      <input name="address" type="text" required autocomplete="street-address" bind:value={street} />
    </label>

    <div class="row">
      <label>
        City
        <input name="city" type="text" required autocomplete="address-level2" bind:value={city} />
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
          bind:value={state}
        />
      </label>
      <label>
        ZIP
        <input
          name="zip"
          type="text"
          required
          autocomplete="postal-code"
          inputmode="numeric"
          bind:value={zip}
        />
      </label>
    </div>

    <LocationsMap
      compact
      center={venuePin?.lngLat ?? selectedMarket?.lngLat ?? region?.center ?? [-75.64, 39.71]}
      zoom={venuePin ? 14 : (region?.zoom ?? 10.2)}
      {markets}
      radiusMiles={region?.serviceRadiusMiles ?? 15}
      showMarkets={false}
      pin={venuePin}
    />
    {#if pinStatus}
      <p class="book-form__pin-status" aria-live="polite">{pinStatus}</p>
    {/if}
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
        <select name="eventType" bind:value={eventTypeId}>
          <option value="">Select…</option>
          {#each eventTypes as type}
            <option value={type.id}>{type.title}</option>
          {/each}
          <option value="other">Other</option>
        </select>
      </label>

      <label>
        Package
        <select name="package" required bind:value={packageId}>
          <option value="">Select…</option>
          {#each packages as pkg}
            <option value={pkg.id}>{pkg.label}</option>
          {/each}
          <option value="custom">Custom</option>
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
  .book-form__pin-status,
  .hint {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.85rem;
    line-height: 1.35;
  }

  .book-form__pin-status {
    margin-top: -0.25rem;
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
