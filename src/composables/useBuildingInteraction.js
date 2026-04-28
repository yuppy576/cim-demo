import * as Cesium from 'cesium'

export function useBuildingInteraction(viewer, mockDataMap) {
  let highlightedEntity = null
  let highlightedOriginalMaterial = null
  let onSelectCallback = null
  let handler = null

  const COLOR_SELECTED = Cesium.Color.fromCssColorString('#00e5ff').withAlpha(0.95)
  const COLOR_DEFAULT = Cesium.Color.fromCssColorString('#4da6ff').withAlpha(0.55)

  const resetHighlight = () => {
    if (highlightedEntity && highlightedOriginalMaterial) {
      highlightedEntity.polygon.material = highlightedOriginalMaterial
      highlightedEntity.polygon.outline = true
      highlightedEntity.polygon.outlineColor = Cesium.Color.WHITE
      highlightedEntity.polygon.outlineWidth = 1
    }
    highlightedEntity = null
    highlightedOriginalMaterial = null
  }

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
          entity.polygon.material = COLOR_SELECTED
          entity.polygon.outline = true
          entity.polygon.outlineColor = Cesium.Color.WHITE
          entity.polygon.outlineWidth = 2
        }
        const mockData = mockDataMap[entity.buildId]
        if (onSelectCallback) onSelectCallback(mockData, entity)
      } else {
        resetHighlight()
        if (onSelectCallback) onSelectCallback(null, null)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  const getHighlightedEntity = () => highlightedEntity
  const onSelect = (cb) => { onSelectCallback = cb }
  const destroy = () => { if (handler) handler.destroy() }

  return { init, resetHighlight, onSelect, destroy, getHighlightedEntity }
}
