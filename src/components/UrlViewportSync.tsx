import { useEffect, useRef } from 'react'
import { useMapStore } from '../store/useMapStore'

function parseHash(hash: string) {
  const match = hash.replace(/^#/, '').match(/^([\d.-]+)\/([\d.-]+)\/([\d.-]+)$/)
  if (!match) return null
  const [, lng, lat, zoom] = match.map(Number)
  if (![lng, lat, zoom].every(Number.isFinite)) return null
  return { lng, lat, zoom }
}

/**
 * Renders nothing. Two independent effects, each a one-way sync:
 *  - on mount, URL hash -> store (once, so a shared link opens at that view)
 *  - on every viewport change, store -> URL hash (so the current view is
 *    always shareable), debounced so a pan/zoom gesture doesn't spam
 *    `history.replaceState` on every frame.
 *
 * Note this component only mounts once MapProvider's map instance exists
 * (it's rendered as one of its children), which is *after* the map has
 * already booted with its initial camera. A shared link still ends up at
 * the right place — the store -> map sync in MapContext picks up the
 * `setViewport` call below and eases the camera there — it just isn't the
 * very first frame the user sees. Good enough for a "shareable view" demo;
 * a production version would thread the initial hash into MapProvider's
 * constructor options directly to avoid the extra hop.
 */
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
    // Runs once — this only ever seeds the initial view from a shared link.
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
