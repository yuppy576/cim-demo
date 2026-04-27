import * as Cesium from 'cesium'

export function useBuildingInteraction(viewer, mockDataMap) {
  let highlightedEntity = null
  let highlightedOriginalMaterial = null
  let onSelectCallback = null
  let handler = null

  const COLOR_DEFAULT = '#4da6ff'   // 蓝：未选中
  const COLOR_SELECTED = '#ffcc00'  // 黄：选中

  const HIGHLIGHT_COLOR = Cesium.Color.fromCssColorString(COLOR_SELECTED).withAlpha(0.9)
  const DEFAULT_COLOR = Cesium.Color.fromCssColorString(COLOR_DEFAULT).withAlpha(0.55)

  const init = () => {
    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    handler.setInputAction((click) => {
      const picked = viewer.scene.pick(click.position)
      if (Cesium.defined(picked) && picked.id?.buildId !== undefined) {
        const entity = picked.id
        if (highlightedEntity !== entity) {
          resetHighlight()
          highlightedEntity = entity
          highlightedOriginalMaterial = entity.polygon.material
          entity.polygon.material = HIGHLIGHT_COLOR
        }
        const mockData = mockDataMap[entity.buildId]
        if (onSelectCallback) onSelectCallback(mockData, entity)
      } else {
        resetHighlight()
        if (onSelectCallback) onSelectCallback(null, null)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  const resetHighlight = () => {
    if (highlightedEntity && highlightedOriginalMaterial) {
      highlightedEntity.polygon.material = highlightedOriginalMaterial
    }
    highlightedEntity = null
    highlightedOriginalMaterial = null
  }

  const onSelect = (cb) => { onSelectCallback = cb }
  const destroy = () => { if (handler) handler.destroy() }

  return { init, resetHighlight, onSelect, destroy }
}
