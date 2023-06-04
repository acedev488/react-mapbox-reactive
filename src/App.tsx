import { MapProvider } from './map/MapContext'
import { ViewportHud } from './components/ViewportHud'
import { MarkerLayer } from './components/MarkerLayer'
import { ClickToAddMarker } from './components/ClickToAddMarker'
import { CitiesLayer } from './components/CitiesLayer'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <MapProvider accessToken={MAPBOX_TOKEN} mapStyle="mapbox://styles/mapbox/streets-v12">
        <CitiesLayer />
        <MarkerLayer />
        <ClickToAddMarker />
      </MapProvider>
      <ViewportHud />
    </div>
  )
}

export default App
