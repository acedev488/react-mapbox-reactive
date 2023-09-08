import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'
import type { LngLat } from './types'
import { useMapContext } from './MapContext'

export interface MarkerProps {
  lngLat: LngLat
  color?: string
  draggable?: boolean
  onDragEnd?: (lngLat: LngLat) => void
  popupText?: string
  selected?: boolean
  onClick?: () => void
}

// Renders nothing — translates its own mount/update/unmount into mapboxgl.Marker calls.
export function Marker({
  lngLat,
  color = '#3fb1ce',
  draggable = false,
  onDragEnd,
  popupText,
  selected = false,
  onClick,
}: MarkerProps) {
  const { map, isStyleLoaded } = useMapContext()
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)

  // Read from refs so a new callback identity doesn't retrigger the mount effect.
  const onDragEndRef = useRef(onDragEnd)
  onDragEndRef.current = onDragEnd
  const onClickRef = useRef(onClick)
  onClickRef.current = onClick

  useEffect(() => {
    if (!map || !isStyleLoaded) return

    const marker = new mapboxgl.Marker({ color }).setLngLat(lngLat).addTo(map)
    markerRef.current = marker

    // Marker elements are siblings of the map canvas, so clicks bubble into
    // the map's own click handlers (e.g. ClickToAddMarker) unless stopped.
    const handleClick = (e: MouseEvent) => {
      e.stopPropagation()
      onClickRef.current?.()
    }
    marker.getElement().addEventListener('click', handleClick)

    return () => {
      marker.getElement().removeEventListener('click', handleClick)
      popupRef.current?.remove()
      marker.remove()
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isStyleLoaded])

  useEffect(() => {
    markerRef.current?.setLngLat(lngLat)
  }, [lngLat[0], lngLat[1]])

  // mapboxgl.Marker has no public setColor(), so this patches the marker's own
  // SVG directly. `svg path[fill]` only matches the colored teardrop shape —
  // the border path has no fill attribute and the inner dot is a <circle>, not a <path>.
  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return
    const shape = marker.getElement().querySelector<SVGPathElement>('svg path[fill]')
    shape?.setAttribute('fill', color)
  }, [color])

  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return
    marker.setDraggable(draggable)

    if (!draggable) return
    const handleDragEnd = () => {
      const { lng, lat } = marker.getLngLat()
      onDragEndRef.current?.([lng, lat])
    }
    marker.on('dragend', handleDragEnd)
    return () => {
      marker.off('dragend', handleDragEnd)
    }
  }, [draggable])

  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return

    if (!popupText) {
      popupRef.current?.remove()
      popupRef.current = null
      return
    }

    if (!popupRef.current) {
      popupRef.current = new mapboxgl.Popup({ offset: 24, closeButton: false })
    }
    popupRef.current.setText(popupText)
    marker.setPopup(popupRef.current)
  }, [popupText])

  // addClassName (not a plain className prop) since Mapbox already manages
  // the element's inline transform for positioning.
  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return
    if (selected) {
      marker.addClassName('marker-selected')
    } else {
      marker.removeClassName('marker-selected')
    }
  }, [selected])

  return null
}
