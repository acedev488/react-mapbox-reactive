import type { Feature, FeatureCollection, Point } from 'geojson'

export interface CityProperties {
  name: string
  population: number
}

const RAW_CITIES: Array<{ name: string; population: number; coords: [number, number] }> = [
  { name: 'San Francisco', population: 873965, coords: [-122.4194, 37.7749] },
  { name: 'Oakland', population: 440646, coords: [-122.2712, 37.8044] },
  { name: 'San Jose', population: 1013240, coords: [-121.8863, 37.3382] },
  { name: 'Berkeley', population: 124321, coords: [-122.2727, 37.8715] },
  { name: 'Fremont', population: 230504, coords: [-121.9886, 37.5485] },
  { name: 'Palo Alto', population: 68572, coords: [-122.143, 37.4419] },
  { name: 'Richmond', population: 116448, coords: [-122.3477, 37.9358] },
  { name: 'Hayward', population: 162954, coords: [-122.0808, 37.6688] },
]

const features: Feature<Point, CityProperties>[] = RAW_CITIES.map((city) => ({
  type: 'Feature',
  properties: { name: city.name, population: city.population },
  geometry: { type: 'Point', coordinates: city.coords },
}))

export const CITIES: FeatureCollection<Point, CityProperties> = {
  type: 'FeatureCollection',
  features,
}
