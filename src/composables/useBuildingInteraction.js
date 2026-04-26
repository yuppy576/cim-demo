import * as Cesium from 'cesium'

/**
 * 周2：建筑点击检测与高亮
 * 解析：鼠标左键点击拾取建筑，橙色高亮选中建筑，点击空白取消选中
 */
export function useBuildingInteraction(viewer, mockDataMap) {
  let highlightedEntity = null
  let highlightedOriginalMaterial = null
  let onSelectCallback = null

  const init = () => {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    handler.setInputAction((click) => {
      const picked = viewer.scene.pick(click.position)

      if (Cesium.defined(picked) && picked.id && picked.id.buildId !== undefined) {
        const entity = picked.id
        const buildId = entity.buildId

        // 取消上一个高亮
        if (highlightedEntity && highlightedEntity !== entity) {
          highlightedEntity.polygon.material = highlightedOriginalMaterial
        }

        // 高亮当前建筑
        if (highlightedEntity !== entity) {
          highlightedOriginalMaterial = entity.polygon.material
          entity.polygon.material = Cesium.Color.fromCssColorString('#FF6600').withAlpha(0.8)
          highlightedEntity = entity
        }

        const mockData = mockDataMap[buildId]
        if (mockData && onSelectCallback) {
          onSelectCallback(mockData, entity)
        }
      } else {
        // 点击空白取消
        resetHighlight()
        if (onSelectCallback) onSelectCallback(null, null)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  const resetHighlight = () => {
    if (highlightedEntity && highlightedOriginalMaterial) {
      highlightedEntity.polygon.material = highlightedOriginalMaterial
      highlightedEntity = null
      highlightedOriginalMaterial = null
    }
  }

  const onSelect = (callback) => {
    onSelectCallback = callback
  }

  return { init, resetHighlight, onSelect }
}
