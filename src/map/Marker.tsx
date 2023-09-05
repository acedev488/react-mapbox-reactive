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

/**
 * Renders nothing. Its entire job is to translate its own React lifecycle
 * (mount / update / unmount) into imperative mapboxgl.Marker calls:
 *
 *   mount    -> new mapboxgl.Marker().addTo(map)
 *   update   -> marker.setLngLat(...)
 *   unmount  -> marker.remove()
 *
 * Parent components never touch mapboxgl directly — they just render/remove
 * <Marker /> elements and pass props, exactly like any other React component.
 */
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

  // Callbacks are read from refs so that changing their identity on every
  // render doesn't force the mount effect below to re-run.
  const onDragEndRef = useRef(onDragEnd)
  onDragEndRef.current = onDragEnd
  const onClickRef = useRef(onClick)
  onClickRef.current = onClick

  // Mount / unmount: the marker entity's lifetime is tied 1:1 to this
  // component instance's lifetime, not to any individual prop.
  useEffect(() => {
    if (!map || !isStyleLoaded) return

    const marker = new mapboxgl.Marker({ color }).setLngLat(lngLat).addTo(map)
    markerRef.current = marker

    const handleClick = () => onClickRef.current?.()
    marker.getElement().addEventListener('click', handleClick)

    return () => {
      marker.getElement().removeEventListener('click', handleClick)
      popupRef.current?.remove()
      marker.remove()
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isStyleLoaded])

  // Reactive prop: position. Updated imperatively instead of tearing the
  // marker down and recreating it.
  useEffect(() => {
    markerRef.current?.setLngLat(lngLat)
  }, [lngLat[0], lngLat[1]])

  // Reactive prop: color. mapboxgl.Marker has no public setColor() — the
  // constructor option is the only supported way to set it — so an update
  // here goes around the public API and repaints the marker's own SVG
  // directly, the same workaround Mapbox's own issue tracker recommends.
  //
  // The default marker's SVG (see mapbox-gl-js's `_createDefaultMarker`) is
  // a flat `<ellipse>` (drop shadow, fill is a gradient url) + `<path>`
  // (the colored teardrop shape, fill: this._color) + a second `<path>`
  // (border outline, no fill attribute) + `<circle fill="white">` (the
  // inner dot). Only the first `<path>`'s fill should track our color prop —
  // `svg path[fill]` happens to match exactly that one, since the border
  // path has no `fill` attribute and the circle isn't a `<path>` at all.
  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return
    const shape = marker.getElement().querySelector<SVGPathElement>('svg path[fill]')
    shape?.setAttribute('fill', color)
  }, [color])

  // Reactive prop: draggable — mapboxgl.Marker exposes a real setter for this.
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

  // Reactive prop: popup text. Created lazily on first use, then just its
  // text content is swapped on subsequent updates.
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

  // Reactive prop: selected. Mapbox positions markers with an inline
  // `transform` style, so a CSS class that also sets `transform` would be
  // silently overridden every time the marker moves. `addClassName` +
  // a `filter`-based style keeps the highlight independent of positioning.
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
