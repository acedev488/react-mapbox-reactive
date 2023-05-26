import { useEffect, useRef } from 'react'
import type { MapMouseEvent } from 'mapbox-gl'
import { useMapContext } from '../map/MapContext'
import { useMapStore } from '../store/useMapStore'

const PALETTE = ['#3fb1ce', '#f43f5e', '#facc15', '#22c55e', '#8b5cf6']

let nextId = 1

/**
 * Renders nothing — just wires a native map interaction (click-to-place)
 * to a store action. Demonstrates that "reactive" doesn't only mean
 * store -> map; map events flow back into React state just as easily.
 */
export function ClickToAddMarker() {
  const { map } = useMapContext()
  const addMarker = useMapStore((s) => s.addMarker)
  const addMarkerRef = useRef(addMarker)
  addMarkerRef.current = addMarker

  useEffect(() => {
    if (!map) return

    const handleClick = (e: MapMouseEvent) => {
      addMarkerRef.current({
        id: `marker-${nextId++}`,
        lngLat: [e.lngLat.lng, e.lngLat.lat],
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        draggable: true,
      })
    }

    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [map])

  return null
}
