import mapboxgl from 'mapbox-gl'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_VIEWPORT } from './types'
import { useMapStore } from '../store/useMapStore'

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
  mapStyle: string
  children?: ReactNode
}

/**
 * Boots a single mapboxgl.Map instance and hands it down through context.
 * This is the only place in the tree that touches `new mapboxgl.Map(...)` —
 * every other map-related component (Marker, Layer, ...) is a *consumer*
 * that reacts to this instance rather than owning one itself.
 */
export function MapProvider({ accessToken, mapStyle, children }: MapProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [value, setValue] = useState<MapContextValue>({ map: null, isStyleLoaded: false })
  const setViewport = useMapStore((s) => s.setViewport)

  useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = accessToken
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: DEFAULT_VIEWPORT.center,
      zoom: DEFAULT_VIEWPORT.zoom,
    })
    mapRef.current = map

    const handleReady = () => setValue({ map, isStyleLoaded: true })
    map.on('load', handleReady)

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
      map.off('load', handleReady)
      map.off('moveend', handleMoveEnd)
      map.remove()
      mapRef.current = null
      setValue({ map: null, isStyleLoaded: false })
    }
  }, [accessToken, mapStyle, setViewport])

  return (
    <MapContext.Provider value={value}>
      <div ref={containerRef} className="map-container" />
      {value.map ? children : null}
    </MapContext.Provider>
  )
}
