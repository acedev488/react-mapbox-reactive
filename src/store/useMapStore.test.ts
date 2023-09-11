import { beforeEach, describe, expect, it } from 'vitest'
import { useMapStore } from './useMapStore'

// stores are module-level singletons — reset between tests to avoid leaking state
const initialState = useMapStore.getState()

beforeEach(() => {
  useMapStore.setState(initialState, true)
})

describe('markers slice', () => {
  it('adds a marker', () => {
    useMapStore.getState().addMarker({ id: 'a', lngLat: [0, 0], color: '#fff', draggable: false })
    expect(useMapStore.getState().markers).toHaveLength(1)
  })

  it('updates a marker by id without touching others', () => {
    const { addMarker, updateMarker } = useMapStore.getState()
    addMarker({ id: 'a', lngLat: [0, 0], color: '#fff', draggable: false })
    addMarker({ id: 'b', lngLat: [1, 1], color: '#000', draggable: false })

    updateMarker('a', { lngLat: [5, 5] })

    const markers = useMapStore.getState().markers
    expect(markers.find((m) => m.id === 'a')?.lngLat).toEqual([5, 5])
    expect(markers.find((m) => m.id === 'b')?.lngLat).toEqual([1, 1])
  })

  it('removes a marker by id', () => {
    const { addMarker, removeMarker } = useMapStore.getState()
    addMarker({ id: 'a', lngLat: [0, 0], color: '#fff', draggable: false })

    removeMarker('a')

    expect(useMapStore.getState().markers).toHaveLength(0)
  })

  it('clears all markers and any selection', () => {
    const { addMarker, selectMarker, clearMarkers } = useMapStore.getState()
    addMarker({ id: 'a', lngLat: [0, 0], color: '#fff', draggable: false })
    addMarker({ id: 'b', lngLat: [1, 1], color: '#000', draggable: false })
    selectMarker('a')

    clearMarkers()

    expect(useMapStore.getState().markers).toHaveLength(0)
    expect(useMapStore.getState().selectedMarkerId).toBeNull()
  })
})

describe('citiesLayer slice', () => {
  it('merges partial updates without clobbering other fields', () => {
    useMapStore.getState().updateCitiesLayer({ radius: 20 })

    const layer = useMapStore.getState().citiesLayer
    expect(layer.radius).toBe(20)
    expect(layer.color).toBe(initialState.citiesLayer.color)
  })
})

describe('selection', () => {
  it('clears the selection when the selected marker is removed', () => {
    const { addMarker, removeMarker, selectMarker } = useMapStore.getState()
    addMarker({ id: 'a', lngLat: [0, 0], color: '#fff', draggable: false })
    selectMarker('a')

    removeMarker('a')

    expect(useMapStore.getState().selectedMarkerId).toBeNull()
  })
})
