import { useMapStore } from '../store/useMapStore'

export function ViewportHud() {
  const { center, zoom } = useMapStore((s) => s.viewport)

  return (
    <div className="hud">
      <span>lng {center[0].toFixed(4)}</span>
      <span>lat {center[1].toFixed(4)}</span>
      <span>zoom {zoom.toFixed(2)}</span>
    </div>
  )
}
