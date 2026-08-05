<script module>
  import * as maplibregl from "maplibre-gl";
  import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

  maplibregl.setWorkerUrl(maplibreWorkerUrl);

  const MILES_TO_METERS = 1609.344;
  /** Equatorial meters/px at zoom 0, adjusted by cos(lat) for DE. */
  const METERS_PER_PX_Z0 = 156543.03392;

  /** Pixel size of `meters` at a zoom — used only as interpolate stops (zoom must be top-level). */
  function pxAtZoom(meters, lat, zoom) {
    const metersPerPx = (METERS_PER_PX_Z0 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
    return meters / metersPerPx;
  }

  /** Soft radial falloff: opaque near center → transparent at radius edge. */
  function heatmapRadiusExpr(radiusMiles, lat = 39.71) {
    // Stretch drop-off past the service radius so the glow reads softer/wider.
    const meters = radiusMiles * MILES_TO_METERS * 1.35;
    return [
      "interpolate",
      ["exponential", 2],
      ["zoom"],
      8,
      pxAtZoom(meters, lat, 8),
      10,
      pxAtZoom(meters, lat, 10),
      12,
      pxAtZoom(meters, lat, 12),
      14,
      pxAtZoom(meters, lat, 14),
    ];
  }
</script>

<script>
  import { MapLibre, Marker, Popup, GeoJSON, HeatmapLayer } from "svelte-maplibre";

  let {
    center = [-75.64, 39.71],
    zoom = 10.2,
    markets = [],
    radiusMiles = 15,
    selectedId = "",
    onSelect = undefined,
    compact = false,
  } = $props();

  const glowGeo = $derived({
    type: "FeatureCollection",
    features: markets.map((market) => ({
      type: "Feature",
      properties: { id: market.id },
      geometry: {
        type: "Point",
        coordinates: market.lngLat,
      },
    })),
  });

  const glowPaint = $derived({
    "heatmap-radius": heatmapRadiusExpr(radiusMiles),
    "heatmap-weight": 1,
    "heatmap-intensity": 1.08,
    "heatmap-opacity": 1,
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(196, 160, 106, 0)",
      0.15,
      "rgba(196, 160, 106, 0.1)",
      0.35,
      "rgba(196, 160, 106, 0.26)",
      0.55,
      "rgba(196, 160, 106, 0.48)",
      0.8,
      "rgba(212, 176, 122, 0.74)",
      1,
      "rgba(212, 176, 122, 0.94)",
    ],
  });
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
      <HeatmapLayer id="service-glow-heat" beforeLayerType="symbol" paint={glowPaint} />
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
