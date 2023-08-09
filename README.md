# react-mapbox-reactive

A small proof-of-concept for driving [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/) entirely from React state, using ordinary component lifecycle (mount / update / unmount) instead of a bespoke imperative API.

## The idea

Mapbox GL JS is an imperative, class-based API: you call `new mapboxgl.Marker()`, `map.addLayer()`, `marker.remove()`, and so on, yourself, whenever your data changes. That's a perfectly reasonable API on its own, but it doesn't compose well with React — you end up hand-writing the exact kind of "diff previous vs. next state and issue the right imperative calls" logic that React already does for the DOM.

This repo explores treating Mapbox entities (markers, layers, sources) as if they *were* DOM nodes, and letting React's reconciler do what it already does best:

- Render a `<Marker lngLat={...} />` → a `mapboxgl.Marker` is created and added to the map.
- Change its `lngLat` prop → the existing marker is moved, not recreated.
- Stop rendering it (conditionally, or by removing it from a list) → the marker is removed from the map.

The components themselves render `null`. They don't produce any DOM — their entire purpose is to be a reactive *handle* to an imperative Mapbox entity, kept in sync via `useEffect`.

State lives in [zustand](https://github.com/pmndrs/zustand), completely decoupled from Mapbox. UI controls (sliders, checkboxes, click handlers) only ever call store actions; they never import `mapbox-gl`. The `<Layer>`/`<Marker>` components are the only bridge between the store and the map.

```
 UI controls  ──update──▶  zustand store  ◀──update── map events (drag, click, move)
                                │
                                ▼
                     <Marker /> / <Layer /> props
                                │
                                ▼
                  useEffect(mount/update/unmount)
                                │
                                ▼
                        mapboxgl.Map instance
```

## Architecture

- **`MapProvider`** (`src/map/MapContext.tsx`) — the only place that calls `new mapboxgl.Map(...)`. Boots the map once, exposes it (plus an `isStyleLoaded` flag) through context, and keeps the store's `viewport` in sync with the map's camera.
- **`Marker`** (`src/map/Marker.tsx`) — renders `null`. One `useEffect` per reactive prop:
  - mount/unmount → `new mapboxgl.Marker().addTo(map)` / `marker.remove()`
  - `lngLat` change → `marker.setLngLat(...)`
  - `draggable` change → `marker.setDraggable(...)`
  - `color` change → patches the marker's own SVG fill (mapboxgl.Marker has no public `setColor`, this is the documented workaround)
  - `popupText` change → creates/updates a `mapboxgl.Popup` lazily
- **`Layer`** (`src/map/Layer.tsx`) — renders `null`. Owns one GeoJSON source + one style layer:
  - mount/unmount → `addSource` + `addLayer` / `removeLayer` + `removeSource`
  - `data` change → `source.setData(...)` (no recreation)
  - `paint` / `layout` change → diffed key-by-key, only the changed keys hit `setPaintProperty` / `setLayoutProperty`
- **`useMapStore`** (`src/store/useMapStore.ts`) — the single zustand store: camera viewport, the marker list, and layer paint config. Nothing in here knows Mapbox exists.
- Everything else (`MarkerLayer`, `CitiesLayer`, `ControlPanel`, `ClickToAddMarker`, `ViewportHud`) is glue: they read/write the store and render `<Marker>`/`<Layer>` — none of them touch `mapboxgl` directly.

## Usage

```tsx
import { MapProvider } from './map/MapContext'
import { Marker } from './map/Marker'
import { Layer } from './map/Layer'

function Example() {
  return (
    <MapProvider accessToken={import.meta.env.VITE_MAPBOX_TOKEN}>
      <Marker lngLat={[-122.4194, 37.7749]} color="#3fb1ce" popupText="Hello!" />

      <Layer
        id="cities"
        type="circle"
        data={citiesGeoJson}
        paint={{ 'circle-color': '#f43f5e', 'circle-radius': 8 }}
      />
    </MapProvider>
  )
}
```

Both components are ordinary JSX — conditionally render one, put it in a `.map()` over a list keyed by `id`, whatever. React handles the rest.

## Gotchas (and how this repo handles them)

- **`paint`/`layout` should be stable references.** `<Layer>` diffs these objects key-by-key against the previous render, but only reference-diffs each *value* — an inline object literal (`paint={{ ... }}`) is a new reference every render, so every render looks like "everything changed." Memoize with `useMemo` (see `CitiesLayer.tsx`) if the values themselves are usually unchanged.
- **`mapboxgl.Marker` has no public `setColor`.** `<Marker>` works around this by patching the marker's own SVG `fill` attribute directly — the same workaround recommended in [mapbox-gl-js#9820](https://github.com/mapbox/mapbox-gl-js/issues/9820).
- **`map.setStyle()` wipes any source/layer you added at runtime.** Switching base styles (`ControlPanel`'s style dropdown) flips `isStyleLoaded` to `false`, which every mounted `<Layer>` treats as "tear yourself down," then flips it back to `true` on the `style.load` event, which remounts them against the new style. See `MapContext.tsx`.
- **Don't fight the user's own gesture.** The store's `viewport` is synced in both directions (map → store on `moveend`, store → map via `easeTo`). The store → map effect only acts if the store's value doesn't already match the map's actual camera, so panning the map doesn't feel like it's being pulled back.

## Running it

1. Get a free access token at [account.mapbox.com](https://account.mapbox.com/access-tokens/).
2. `cp .env.example .env.local` and paste your token into `VITE_MAPBOX_TOKEN`.
3. `npm install`
4. `npm run dev`

Click anywhere on the map to drop a draggable marker; use the panel in the top-right to change the cities layer's color/radius/opacity live, switch base styles, or toggle the heatmap and the animated marker.

## Testing

`npm run test` runs the zustand store tests and the `diffKeys` unit tests (`vitest`). There's also a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs lint, test, and build on every push.
