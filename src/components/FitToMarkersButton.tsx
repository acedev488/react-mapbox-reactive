import mapboxgl from 'mapbox-gl'
import { useMapContext } from '../map/MapContext'
import { useMapStore } from '../store/useMapStore'

export function FitToMarkersButton() {
  const { map } = useMapContext()
  const markers = useMapStore((s) => s.markers)

  const handleClick = () => {
    if (!map || markers.length === 0) return

    const bounds = markers.reduce(
      (acc, marker) => acc.extend(marker.lngLat),
      new mapboxgl.LngLatBounds(markers[0].lngLat, markers[0].lngLat),
    )
    map.fitBounds(bounds, { padding: 64, duration: 600 })
  }

  return (
    <button className="fit-markers" onClick={handleClick} disabled={markers.length === 0}>
      Fit view to markers
    </button>
  )
}
