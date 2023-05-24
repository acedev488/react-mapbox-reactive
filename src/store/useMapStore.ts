import { create } from 'zustand'
import { DEFAULT_VIEWPORT, LngLat, Viewport } from '../map/types'

export interface MarkerData {
  id: string
  lngLat: LngLat
  color: string
  draggable: boolean
  label?: string
}

interface MapStoreState {
  viewport: Viewport
  setViewport: (viewport: Viewport) => void

  markers: MarkerData[]
  addMarker: (marker: MarkerData) => void
  updateMarker: (id: string, patch: Partial<Omit<MarkerData, 'id'>>) => void
  removeMarker: (id: string) => void
}

export const useMapStore = create<MapStoreState>((set) => ({
  viewport: DEFAULT_VIEWPORT,
  // Called both by the map itself (after the user pans/zooms) and by UI
  // controls that want to *drive* the map (e.g. a "reset view" button).
  setViewport: (viewport) => set({ viewport }),

  markers: [],
  addMarker: (marker) => set((s) => ({ markers: [...s.markers, marker] })),
  updateMarker: (id, patch) =>
    set((s) => ({
      markers: s.markers.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  removeMarker: (id) =>
    set((s) => ({ markers: s.markers.filter((m) => m.id !== id) })),
}))
