import { Marker } from '../map/Marker'
import { useMapStore } from '../store/useMapStore'

// One <Marker/> per store entry — React's own list reconciliation handles the rest.
export function MarkerLayer() {
  const markers = useMapStore((s) => s.markers)
  const updateMarker = useMapStore((s) => s.updateMarker)
  const selectedMarkerId = useMapStore((s) => s.selectedMarkerId)
  const selectMarker = useMapStore((s) => s.selectMarker)

  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          lngLat={marker.lngLat}
          color={marker.color}
          draggable={marker.draggable}
          popupText={marker.label}
          selected={marker.id === selectedMarkerId}
          onDragEnd={(lngLat) => updateMarker(marker.id, { lngLat })}
          onClick={() => selectMarker(marker.id)}
        />
      ))}
    </>
  )
}
