import { useEffect, useRef } from 'react'
import { useMapStore } from '../store/useMapStore'

function parseHash(hash: string) {
  const match = hash.replace(/^#/, '').match(/^([\d.-]+)\/([\d.-]+)\/([\d.-]+)$/)
  if (!match) return null
  const [, lng, lat, zoom] = match.map(Number)
  if (![lng, lat, zoom].every(Number.isFinite)) return null
  return { lng, lat, zoom }
}

// Two one-way syncs: URL hash -> store on mount, store -> URL hash (debounced) after.
// Mounts after the map already has its initial camera, so a shared link eases into
// place a moment later rather than loading there directly — good enough for a demo.
export function UrlViewportSync() {
  const setViewport = useMapStore((s) => s.setViewport)
  const viewport = useMapStore((s) => s.viewport)
  const hasAppliedHashRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const parsed = parseHash(window.location.hash)
    if (parsed) {
      setViewport({ center: [parsed.lng, parsed.lat], zoom: parsed.zoom, bearing: 0, pitch: 0 })
    }
    hasAppliedHashRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hasAppliedHashRef.current) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const { center, zoom } = viewport
      const hash = `#${center[0].toFixed(5)}/${center[1].toFixed(5)}/${zoom.toFixed(2)}`
      window.history.replaceState(null, '', hash)
    }, 400)

    return () => clearTimeout(timeoutRef.current)
  }, [viewport])

  return null
}
