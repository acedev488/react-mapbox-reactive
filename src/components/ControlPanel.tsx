import { useMapStore } from '../store/useMapStore'
import { FitToMarkersButton } from './FitToMarkersButton'
import { ResetViewButton } from './ResetViewButton'

// Ordinary UI — never imports mapboxgl, only calls store actions.
export function ControlPanel() {
  const { visible, color, radius, opacity } = useMapStore((s) => s.citiesLayer)
  const updateCitiesLayer = useMapStore((s) => s.updateCitiesLayer)
  const markerCount = useMapStore((s) => s.markers.length)
  const selectedMarkerId = useMapStore((s) => s.selectedMarkerId)
  const removeMarker = useMapStore((s) => s.removeMarker)
  const clearMarkers = useMapStore((s) => s.clearMarkers)
  const heatmapVisible = useMapStore((s) => s.heatmapVisible)
  const setHeatmapVisible = useMapStore((s) => s.setHeatmapVisible)
  const activeBaseStyle = useMapStore((s) => s.activeBaseStyle)
  const setActiveBaseStyle = useMapStore((s) => s.setActiveBaseStyle)
  const showAnimatedMarker = useMapStore((s) => s.showAnimatedMarker)
  const setShowAnimatedMarker = useMapStore((s) => s.setShowAnimatedMarker)

  const handleRemoveSelected = () => {
    if (!selectedMarkerId) return
    removeMarker(selectedMarkerId)
  }

  return (
    <div className="control-panel">
      <h1>react-mapbox-reactive</h1>
      <p className="hint">Click the map to drop a draggable marker.</p>

      <label className="row" htmlFor="base-style-select">
        Base style
        <select
          id="base-style-select"
          value={activeBaseStyle}
          aria-label="Base map style"
          onChange={(e) => setActiveBaseStyle(e.target.value as typeof activeBaseStyle)}
        >
          <option value="streets">Streets</option>
          <option value="dark">Dark</option>
          <option value="satellite">Satellite</option>
        </select>
      </label>

      <section>
        <header>
          <label>
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => updateCitiesLayer({ visible: e.target.checked })}
            />
            Cities layer
          </label>
        </header>

        <label className="row">
          Color
          <input
            type="color"
            aria-label="Cities layer color"
            value={color}
            onChange={(e) => updateCitiesLayer({ color: e.target.value })}
          />
        </label>

        <label className="row">
          Radius ({radius}px)
          <input
            type="range"
            aria-label="Cities layer radius"
            min={2}
            max={24}
            value={radius}
            onChange={(e) => updateCitiesLayer({ radius: Number(e.target.value) })}
          />
        </label>

        <label className="row">
          Opacity ({opacity.toFixed(2)})
          <input
            type="range"
            aria-label="Cities layer opacity"
            min={0}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => updateCitiesLayer({ opacity: Number(e.target.value) })}
          />
        </label>
      </section>

      <label className="row">
        <input
          type="checkbox"
          checked={heatmapVisible}
          onChange={(e) => setHeatmapVisible(e.target.checked)}
        />
        Population heatmap
      </label>

      <label className="row">
        <input
          type="checkbox"
          checked={showAnimatedMarker}
          onChange={(e) => setShowAnimatedMarker(e.target.checked)}
        />
        Animated marker (~60fps)
      </label>

      <FitToMarkersButton />
      <ResetViewButton />

      {selectedMarkerId && (
        <button className="remove-marker" onClick={handleRemoveSelected}>
          Remove selected marker
        </button>
      )}

      {markerCount > 0 && (
        <button className="remove-marker" onClick={clearMarkers}>
          Clear all markers
        </button>
      )}

      <footer>{markerCount} marker{markerCount === 1 ? '' : 's'} on the map</footer>
    </div>
  )
}
