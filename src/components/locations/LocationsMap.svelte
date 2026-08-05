<script module>
  import * as maplibregl from "maplibre-gl";
  import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

  maplibregl.setWorkerUrl(maplibreWorkerUrl);

  /** Approx circle ring in miles around a lng/lat (closed). */
  function circleCoords(lng, lat, radiusMiles, steps = 64) {
    const latRad = (lat * Math.PI) / 180;
    const dLat = radiusMiles / 69.172;
    const dLng = radiusMiles / (69.172 * Math.cos(latRad));
    const ring = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      ring.push([lng + dLng * Math.sin(t), lat + dLat * Math.cos(t)]);
    }
    return ring;
  }

  /** Concentric disks — bright near the pin, fall off fast with distance. */
  function glowCollection(markets, radiusMiles) {
    // Small scales + rising opacity = dense core; outer rings stay faint
    const bands = [
      { scale: 1, opacity: 0.04 },
      { scale: 0.55, opacity: 0.07 },
      { scale: 0.32, opacity: 0.12 },
      { scale: 0.18, opacity: 0.2 },
      { scale: 0.1, opacity: 0.32 },
      { scale: 0.05, opacity: 0.45 },
    ];

    return {
      type: "FeatureCollection",
      features: markets.flatMap((market) => {
        const [lng, lat] = market.lngLat;
        return bands.map((band, i) => ({
          type: "Feature",
          properties: {
            id: `${market.id}-${i}`,
            opacity: band.opacity,
          },
          geometry: {
            type: "Polygon",
            coordinates: [circleCoords(lng, lat, radiusMiles * band.scale)],
          },
        }));
      }),
    };
  }
</script>

<script>
  import { MapLibre, Marker, Popup, GeoJSON, FillLayer } from "svelte-maplibre";

  let {
    center = [-75.64, 39.71],
    zoom = 9.8,
    markets = [],
    radiusMiles = 8,
    selectedId = "",
    onSelect = undefined,
    compact = false,
  } = $props();

  const glowGeo = $derived(glowCollection(markets, radiusMiles));
</script>

<div class="locations-map" class:locations-map--compact={compact}>
  <MapLibre
    class="locations-map__canvas"
    style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    {center}
    {zoom}
    cooperativeGestures
    standardControls
  >
    <GeoJSON id="service-glow" data={glowGeo}>
      <FillLayer
        id="service-glow-fill"
        beforeLayerType="symbol"
        paint={{
          "fill-color": "#c4a06a",
          "fill-opacity": ["get", "opacity"],
        }}
      />
    </GeoJSON>

    {#each markets as market}
      <Marker lngLat={market.lngLat} anchor="bottom">
        <button
          class="locations-map__pin"
          class:locations-map__pin--active={selectedId === market.id}
          type="button"
          aria-label={market.name}
          aria-pressed={selectedId === market.id}
          onclick={() => onSelect?.(market)}
        >
          <svg viewBox="0 0 24 32" width="28" height="36" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 0C6.5 0 2 4.5 2 10c0 7.2 8.4 18.4 9.2 19.4a1 1 0 0 0 1.6 0C13.6 28.4 22 17.2 22 10 22 4.5 17.5 0 12 0zm0 14.5A4.5 4.5 0 1 1 12 5.5a4.5 4.5 0 0 1 0 9z"
            />
          </svg>
        </button>
        {#if !onSelect}
          <Popup openOn="click" closeButton maxWidth="14rem">
            <strong>{market.name}</strong>
            <p>{market.serviceArea}</p>
            <a href={`/locations/${market.id}`}>View market</a>
          </Popup>
        {/if}
      </Marker>
    {/each}
  </MapLibre>
</div>

<style>
  .locations-map {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: color-mix(in oklch, var(--muted) 40%, transparent);
  }

  :global(.locations-map__canvas) {
    display: block;
    width: 100%;
    height: min(62vh, 28rem);
    min-height: 16rem;
  }

  .locations-map--compact :global(.locations-map__canvas) {
    height: min(42vh, 18rem);
    min-height: 14rem;
  }

  .locations-map__pin {
    appearance: none;
    border: 0;
    padding: 0;
    margin: 0;
    background: transparent;
    color: var(--primary);
    cursor: pointer;
    filter: drop-shadow(0 1px 2px color-mix(in oklch, var(--foreground) 35%, transparent));
    line-height: 0;
  }

  .locations-map__pin:hover,
  .locations-map__pin--active {
    color: var(--primary-hover);
  }

  .locations-map__pin--active {
    transform: scale(1.12);
  }

  :global(.maplibregl-popup-content) {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--foreground);
    padding: 0.75rem 0.85rem;
  }

  :global(.maplibregl-popup-content strong) {
    font-family: var(--font-heading);
  }

  :global(.maplibregl-popup-content p) {
    margin: 0.35rem 0 0.55rem;
    color: var(--muted-foreground);
  }

  :global(.maplibregl-popup-content a) {
    color: var(--primary);
    font-weight: 600;
    text-decoration: none;
  }
</style>
