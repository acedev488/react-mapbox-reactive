import { useMapContext } from '../map/MapContext'

export function MapLoadingOverlay() {
  const { isStyleLoaded } = useMapContext()

  if (isStyleLoaded) return null

  return (
    <div className="map-loading">
      <div className="spinner" />
    </div>
  )
}
