import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_VIEWPORT, LngLat, Viewport } from '../map/types'

export interface MarkerData {
  id: string
  lngLat: LngLat
  color: string
  draggable: boolean
  label?: string
}

export type BaseStyle = 'streets' | 'dark' | 'satellite'

export const BASE_STYLE_URLS: Record<BaseStyle, string> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
}

export interface CitiesLayerConfig {
  visible: boolean
  color: string
  radius: number
  opacity: number
}

const DEFAULT_CITIES_LAYER_CONFIG: CitiesLayerConfig = {
  visible: true,
  color: '#f43f5e',
  radius: 8,
  opacity: 0.85,
}

interface MapStoreState {
  viewport: Viewport
  setViewport: (viewport: Viewport) => void

  markers: MarkerData[]
  addMarker: (marker: MarkerData) => void
  updateMarker: (id: string, patch: Partial<Omit<MarkerData, 'id'>>) => void
  removeMarker: (id: string) => void
  clearMarkers: () => void

  selectedMarkerId: string | null
  selectMarker: (id: string | null) => void

  citiesLayer: CitiesLayerConfig
  updateCitiesLayer: (patch: Partial<CitiesLayerConfig>) => void

  heatmapVisible: boolean
  setHeatmapVisible: (visible: boolean) => void

  activeBaseStyle: BaseStyle
  setActiveBaseStyle: (style: BaseStyle) => void

  showAnimatedMarker: boolean
  setShowAnimatedMarker: (show: boolean) => void
}

export const useMapStore = create<MapStoreState>()(
  persist(
    (set) => ({
      viewport: DEFAULT_VIEWPORT,
      setViewport: (viewport) => set({ viewport }),

      markers: [],
      addMarker: (marker) => set((s) => ({ markers: [...s.markers, marker] })),
      updateMarker: (id, patch) =>
        set((s) => ({
          markers: s.markers.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMarker: (id) =>
        set((s) => ({
          markers: s.markers.filter((m) => m.id !== id),
          selectedMarkerId: s.selectedMarkerId === id ? null : s.selectedMarkerId,
        })),
      clearMarkers: () => set({ markers: [], selectedMarkerId: null }),

      selectedMarkerId: null,
      selectMarker: (id) => set({ selectedMarkerId: id }),

      citiesLayer: DEFAULT_CITIES_LAYER_CONFIG,
      updateCitiesLayer: (patch) =>
        set((s) => ({ citiesLayer: { ...s.citiesLayer, ...patch } })),

      heatmapVisible: false,
      setHeatmapVisible: (heatmapVisible) => set({ heatmapVisible }),

      activeBaseStyle: 'streets',
      setActiveBaseStyle: (activeBaseStyle) => set({ activeBaseStyle }),

      // not persisted — see partialize below
      showAnimatedMarker: false,
      setShowAnimatedMarker: (showAnimatedMarker) => set({ showAnimatedMarker }),
    }),
    {
      name: 'react-mapbox-reactive',
      version: 1,
      partialize: (state) => ({
        viewport: state.viewport,
        markers: state.markers,
        citiesLayer: state.citiesLayer,
        heatmapVisible: state.heatmapVisible,
        activeBaseStyle: state.activeBaseStyle,
      }),
      // Guards against a corrupted/stale-schema blob in localStorage.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<MapStoreState>
        const hasValidViewport =
          p.viewport &&
          Array.isArray(p.viewport.center) &&
          p.viewport.center.length === 2 &&
          Number.isFinite(p.viewport.center[0]) &&
          Number.isFinite(p.viewport.center[1]) &&
          Number.isFinite(p.viewport.zoom)

        return {
          ...current,
          ...p,
          viewport: hasValidViewport ? p.viewport! : current.viewport,
          markers: Array.isArray(p.markers) ? p.markers : current.markers,
        }
      },
    },
  ),
)
