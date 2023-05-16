export type LngLat = [lng: number, lat: number]

export interface Viewport {
  center: LngLat
  zoom: number
  bearing: number
  pitch: number
}

export const DEFAULT_VIEWPORT: Viewport = {
  center: [-122.4194, 37.7749],
  zoom: 11,
  bearing: 0,
  pitch: 0,
}
