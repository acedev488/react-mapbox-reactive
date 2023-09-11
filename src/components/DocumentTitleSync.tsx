import { useEffect } from 'react'
import { useMapStore } from '../store/useMapStore'

const BASE_TITLE = 'react-mapbox-reactive'

export function DocumentTitleSync() {
  const markerCount = useMapStore((s) => s.markers.length)

  useEffect(() => {
    document.title = markerCount > 0 ? `(${markerCount}) ${BASE_TITLE}` : BASE_TITLE
    return () => {
      document.title = BASE_TITLE
    }
  }, [markerCount])

  return null
}
