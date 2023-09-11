import { useMemo } from 'react'
import { Layer } from '../map/Layer'
import { CITIES } from '../data/cities'
import { useMapStore } from '../store/useMapStore'

// useMemo keeps paint/layout references stable so Layer's diffing stays meaningful.
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
