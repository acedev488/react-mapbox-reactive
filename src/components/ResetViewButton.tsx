import { DEFAULT_VIEWPORT } from '../map/types'
import { useMapStore } from '../store/useMapStore'

// Just writes to the store — MapContext's reactive effect calls map.easeTo().
export function ResetViewButton() {
  const setViewport = useMapStore((s) => s.setViewport)

  return (
    <button className="fit-markers" onClick={() => setViewport(DEFAULT_VIEWPORT)}>
      Reset view
    </button>
  )
}
