import { MapProvider } from './map/MapContext'
import { ViewportHud } from './components/ViewportHud'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <MapProvider accessToken={MAPBOX_TOKEN} mapStyle="mapbox://styles/mapbox/streets-v12" />
      <ViewportHud />
    </div>
  )
}

export default App
