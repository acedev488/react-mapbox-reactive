import { create } from 'zustand'
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

  selectedMarkerId: string | null
  selectMarker: (id: string | null) => void

  citiesLayer: CitiesLayerConfig
  updateCitiesLayer: (patch: Partial<CitiesLayerConfig>) => void

  heatmapVisible: boolean
  setHeatmapVisible: (visible: boolean) => void

  activeBaseStyle: BaseStyle
  setActiveBaseStyle: (style: BaseStyle) => void
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

  selectedMarkerId: null,
  selectMarker: (id) => set({ selectedMarkerId: id }),

  // Every knob a <Layer/> needs to redraw the cities circle layer lives here.
  // The layer component never manages this state itself — it only reads it.
  citiesLayer: DEFAULT_CITIES_LAYER_CONFIG,
  updateCitiesLayer: (patch) =>
    set((s) => ({ citiesLayer: { ...s.citiesLayer, ...patch } })),

  heatmapVisible: false,
  setHeatmapVisible: (heatmapVisible) => set({ heatmapVisible }),

  activeBaseStyle: 'streets',
  setActiveBaseStyle: (activeBaseStyle) => set({ activeBaseStyle }),
}))
