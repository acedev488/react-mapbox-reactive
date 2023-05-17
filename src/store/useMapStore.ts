import { create } from 'zustand'
import { DEFAULT_VIEWPORT, Viewport } from '../map/types'

interface MapStoreState {
  viewport: Viewport
  setViewport: (viewport: Viewport) => void
}

export const useMapStore = create<MapStoreState>((set) => ({
  viewport: DEFAULT_VIEWPORT,
  // Called both by the map itself (after the user pans/zooms) and by UI
  // controls that want to *drive* the map (e.g. a "reset view" button).
  setViewport: (viewport) => set({ viewport }),
}))
