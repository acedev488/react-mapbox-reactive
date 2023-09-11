import { useMapStore } from '../store/useMapStore'

export function Legend() {
  const { visible, color, radius } = useMapStore((s) => s.citiesLayer)

  if (!visible) return null

  return (
    <div className="legend">
      <span className="legend-swatch" style={{ backgroundColor: color, width: radius, height: radius }} />
      Cities (population)
    </div>
  )
}
