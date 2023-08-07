import { MapProvider } from './map/MapContext'
import { ViewportHud } from './components/ViewportHud'
import { MarkerLayer } from './components/MarkerLayer'
import { ClickToAddMarker } from './components/ClickToAddMarker'
import { CitiesLayer } from './components/CitiesLayer'
import { CitiesHeatmapLayer } from './components/CitiesHeatmapLayer'
import { ControlPanel } from './components/ControlPanel'
import { Legend } from './components/Legend'
import { AnimatedMarker } from './components/AnimatedMarker'
import { MissingTokenNotice } from './components/MissingTokenNotice'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { MapLoadingOverlay } from './components/MapLoadingOverlay'
import { UrlViewportSync } from './components/UrlViewportSync'
import { useMapStore } from './store/useMapStore'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

function App() {
  const showAnimatedMarker = useMapStore((s) => s.showAnimatedMarker)

  if (!MAPBOX_TOKEN) {
    return <MissingTokenNotice />
  }

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <MapProvider accessToken={MAPBOX_TOKEN}>
        <MapLoadingOverlay />
        <UrlViewportSync />
        <CitiesLayer />
        <CitiesHeatmapLayer />
        <MarkerLayer />
        <ClickToAddMarker />
        <KeyboardShortcuts />
        {showAnimatedMarker && <AnimatedMarker />}
        <ViewportHud />
        <ControlPanel />
        <Legend />
      </MapProvider>
    </div>
  )
}

export default App
