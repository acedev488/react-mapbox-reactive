import { MapProvider } from './map/MapContext'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <MapProvider accessToken={MAPBOX_TOKEN} mapStyle="mapbox://styles/mapbox/streets-v12" />
    </div>
  )
}

export default App
