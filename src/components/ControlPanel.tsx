import { useMapStore } from '../store/useMapStore'

/**
 * Ordinary React UI — the point being made here is what it *doesn't* do:
 * it never imports mapboxgl and never touches the map. It only calls store
 * actions; <CitiesLayer/> is what turns those store changes into map calls.
 */
export function ControlPanel() {
  const { visible, color, radius, opacity } = useMapStore((s) => s.citiesLayer)
  const updateCitiesLayer = useMapStore((s) => s.updateCitiesLayer)
  const markerCount = useMapStore((s) => s.markers.length)
  const selectedMarkerId = useMapStore((s) => s.selectedMarkerId)
  const removeMarker = useMapStore((s) => s.removeMarker)
  const selectMarker = useMapStore((s) => s.selectMarker)
  const heatmapVisible = useMapStore((s) => s.heatmapVisible)
  const setHeatmapVisible = useMapStore((s) => s.setHeatmapVisible)
  const activeBaseStyle = useMapStore((s) => s.activeBaseStyle)
  const setActiveBaseStyle = useMapStore((s) => s.setActiveBaseStyle)

  const handleRemoveSelected = () => {
    if (!selectedMarkerId) return
    removeMarker(selectedMarkerId)
    selectMarker(null)
  }

  return (
    <div className="control-panel">
      <h1>react-mapbox-reactive</h1>
      <p className="hint">Click the map to drop a draggable marker.</p>

      <label className="row">
        Base style
        <select
          value={activeBaseStyle}
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
            value={color}
            onChange={(e) => updateCitiesLayer({ color: e.target.value })}
          />
        </label>

        <label className="row">
          Radius ({radius}px)
          <input
            type="range"
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

      {selectedMarkerId && (
        <button className="remove-marker" onClick={handleRemoveSelected}>
          Remove selected marker
        </button>
      )}

      <footer>{markerCount} marker{markerCount === 1 ? '' : 's'} on the map</footer>
    </div>
  )
}
