import { create } from 'zustand'
import { DEFAULT_VIEWPORT, Viewport } from '../map/types'

interface MapStoreState {
  viewport: Viewport
  setViewport: (viewport: Viewport) => void
}

export const useMapStore = create<MapStoreState>((set) => ({
  viewport: DEFAULT_VIEWPORT,
  setViewport: (viewport) => set({ viewport }),
}))
