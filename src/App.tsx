import { MapProvider } from './map/MapContext'
import { ViewportHud } from './components/ViewportHud'
import { MarkerLayer } from './components/MarkerLayer'
import { ClickToAddMarker } from './components/ClickToAddMarker'
import { CitiesLayer } from './components/CitiesLayer'
import { CitiesHeatmapLayer } from './components/CitiesHeatmapLayer'
import { ControlPanel } from './components/ControlPanel'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <MapProvider accessToken={MAPBOX_TOKEN}>
        <CitiesLayer />
        <CitiesHeatmapLayer />
        <MarkerLayer />
        <ClickToAddMarker />
      </MapProvider>
      <ViewportHud />
      <ControlPanel />
    </div>
  )
}

export default App
