import { useMemo } from 'react'
import { Layer } from '../map/Layer'
import { CITIES } from '../data/cities'
import { useMapStore } from '../store/useMapStore'

/**
 * The only "smart" piece here is the useMemo below — it exists purely so
 * that <Layer/> receives a stable `paint` object reference when nothing
 * relevant changed, keeping its key-by-key diffing meaningful instead of
 * re-running on every store update.
 */
export function CitiesLayer() {
  const { visible, color, radius, opacity } = useMapStore((s) => s.citiesLayer)

  const paint = useMemo(
    () => ({
      'circle-color': color,
      'circle-radius': radius,
      'circle-opacity': opacity,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    }),
    [color, radius, opacity],
  )

  const layout = useMemo(
    () => ({ visibility: visible ? 'visible' : 'none' }) as const,
    [visible],
  )

  return <Layer id="cities" type="circle" data={CITIES} paint={paint} layout={layout} />
}
