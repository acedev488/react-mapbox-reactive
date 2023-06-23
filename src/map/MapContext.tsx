import mapboxgl from 'mapbox-gl'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_VIEWPORT } from './types'
import { BASE_STYLE_URLS, useMapStore } from '../store/useMapStore'

export interface MapContextValue {
  map: mapboxgl.Map | null
  isStyleLoaded: boolean
}

const MapContext = createContext<MapContextValue | null>(null)

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext)
  if (!ctx) {
    throw new Error('useMapContext must be used within a <MapProvider>')
  }
  return ctx
}

export interface MapProviderProps {
  accessToken: string
  children?: ReactNode
}

/**
 * Boots a single mapboxgl.Map instance and hands it down through context.
 * This is the only place in the tree that touches `new mapboxgl.Map(...)` —
 * every other map-related component (Marker, Layer, ...) is a *consumer*
 * that reacts to this instance rather than owning one itself.
 */
export function MapProvider({ accessToken, children }: MapProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [value, setValue] = useState<MapContextValue>({ map: null, isStyleLoaded: false })
  const setViewport = useMapStore((s) => s.setViewport)
  const activeBaseStyle = useMapStore((s) => s.activeBaseStyle)
  const isFirstStyleRef = useRef(true)

  useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = accessToken
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: BASE_STYLE_URLS[activeBaseStyle],
      center: DEFAULT_VIEWPORT.center,
      zoom: DEFAULT_VIEWPORT.zoom,
    })
    mapRef.current = map

    // Fires once for the initial style, and again after every setStyle()
    // call below — both cases mean "the style is ready, sources/layers can
    // be (re)added now".
    const handleStyleReady = () => setValue({ map, isStyleLoaded: true })
    map.on('load', handleStyleReady)
    map.on('style.load', handleStyleReady)

    // One-way sync, map -> store: once the user stops panning/zooming, push
    // the resulting camera position into zustand so the rest of the app
    // (a HUD, a "share this view" link, ...) can read it reactively.
    const handleMoveEnd = () => {
      setViewport({
        center: map.getCenter().toArray() as [number, number],
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      })
    }
    map.on('moveend', handleMoveEnd)

    return () => {
      map.off('load', handleStyleReady)
      map.off('style.load', handleStyleReady)
      map.off('moveend', handleMoveEnd)
      map.remove()
      mapRef.current = null
      setValue({ map: null, isStyleLoaded: false })
    }
    // Deliberately excludes `activeBaseStyle` — the *initial* style is set
    // once here; subsequent changes are handled by the effect below via
    // `setStyle`, which is a much cheaper operation than tearing the whole
    // map down and recreating it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, setViewport])

  // Reactive prop (via the store): base style. Swapping styles at runtime
  // wipes any sources/layers added outside the style JSON, so we flip
  // `isStyleLoaded` to false first — every mounted <Layer/> tears itself
  // down in response — then let `style.load` flip it back to true, which
  // remounts them against the new style.
  useEffect(() => {
    if (isFirstStyleRef.current) {
      isFirstStyleRef.current = false
      return
    }
    const map = mapRef.current
    if (!map) return
    setValue((v) => ({ ...v, isStyleLoaded: false }))
    map.setStyle(BASE_STYLE_URLS[activeBaseStyle])
  }, [activeBaseStyle])

  return (
    <MapContext.Provider value={value}>
      <div ref={containerRef} className="map-container" />
      {value.map ? children : null}
    </MapContext.Provider>
  )
}
