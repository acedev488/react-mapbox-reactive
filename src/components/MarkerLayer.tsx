import { Marker } from '../map/Marker'
import { useMapStore } from '../store/useMapStore'

/**
 * Bridges store state to Mapbox entities: for every marker in zustand there
 * is exactly one <Marker/> element. Add one to the store -> a new
 * mapboxgl.Marker mounts. Remove one -> React unmounts its <Marker/> and the
 * cleanup effect tears down the mapboxgl.Marker. No manual bookkeeping.
 */
export function MarkerLayer() {
  const markers = useMapStore((s) => s.markers)
  const updateMarker = useMapStore((s) => s.updateMarker)

  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          lngLat={marker.lngLat}
          color={marker.color}
          draggable={marker.draggable}
          onDragEnd={(lngLat) => updateMarker(marker.id, { lngLat })}
        />
      ))}
    </>
  )
}
