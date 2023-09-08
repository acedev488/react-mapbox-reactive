import mapboxgl from 'mapbox-gl'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
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

// Only place that constructs a mapboxgl.Map — everything else consumes it via context.
export function MapProvider({ accessToken, children }: MapProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [value, setValue] = useState<MapContextValue>({ map: null, isStyleLoaded: false })
  const setViewport = useMapStore((s) => s.setViewport)
  const viewport = useMapStore((s) => s.viewport)
  const activeBaseStyle = useMapStore((s) => s.activeBaseStyle)
  const isFirstStyleRef = useRef(true)

  useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = accessToken
    // Read directly (not via the hook) — this is only the *initial* camera.
    const { viewport } = useMapStore.getState()
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: BASE_STYLE_URLS[activeBaseStyle],
      center: viewport.center,
      zoom: viewport.zoom,
      bearing: viewport.bearing,
      pitch: viewport.pitch,
    })
    mapRef.current = map
    setValue({ map, isStyleLoaded: false })

    // Fires on initial load and again after every setStyle() below.
    const handleStyleReady = () => setValue({ map, isStyleLoaded: true })
    map.on('load', handleStyleReady)
    map.on('style.load', handleStyleReady)

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
    // activeBaseStyle intentionally excluded — handled by setStyle() below instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, setViewport])

  // setStyle() wipes any source/layer added outside the style JSON, so
  // isStyleLoaded flips false first (every <Layer/> tears down) and back to
  // true on style.load (they remount against the new style).
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

  // store -> map, the other direction from handleMoveEnd. Guarded by a
  // distance check instead of a flag, so it doesn't fight the user's own gesture.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const current = map.getCenter()
    const centerDelta = Math.abs(current.lng - viewport.center[0]) + Math.abs(current.lat - viewport.center[1])
    const zoomDelta = Math.abs(map.getZoom() - viewport.zoom)
    const bearingDelta = Math.abs(map.getBearing() - viewport.bearing)
    const pitchDelta = Math.abs(map.getPitch() - viewport.pitch)
    const isAlreadyThere =
      centerDelta < 1e-5 && zoomDelta < 1e-3 && bearingDelta < 1e-2 && pitchDelta < 1e-2
    if (isAlreadyThere) return
    map.easeTo({
      center: viewport.center,
      zoom: viewport.zoom,
      bearing: viewport.bearing,
      pitch: viewport.pitch,
      duration: 500,
    })
  }, [viewport])

  return (
    <MapContext.Provider value={value}>
      <div ref={containerRef} className="map-container" />
      {value.map ? children : null}
    </MapContext.Provider>
  )
}
