import { useEffect, useRef, useState } from 'react'
import { Marker } from '../map/Marker'
import type { LngLat } from '../map/types'

const CENTER: LngLat = [-122.42, 37.78]
const RADIUS_DEG = 0.06

// Drives Marker's lngLat from a rAF loop instead of the store, to stress-test updates.
export function AnimatedMarker() {
  const [lngLat, setLngLat] = useState<LngLat>(CENTER)
  const frameRef = useRef<number>()

  useEffect(() => {
    const start = performance.now()

    const tick = (now: number) => {
      const t = (now - start) / 1000
      setLngLat([CENTER[0] + RADIUS_DEG * Math.cos(t), CENTER[1] + RADIUS_DEG * Math.sin(t)])
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return <Marker lngLat={lngLat} color="#8b5cf6" popupText="Orbiting marker" />
}
