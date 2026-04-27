import * as Cesium from 'cesium'

export function useWorkOrderLabel(viewer) {
  const labelMap = new Map() // orderId -> entity

  function addOrUpdateLabel(workOrder) {
    const position = Cesium.Cartesian3.fromDegrees(
      workOrder.location.lng,
      workOrder.location.lat,
      120 // 悬浮高度
    )

    // 如果已存在则更新
    if (labelMap.has(workOrder.id)) {
      const entity = labelMap.get(workOrder.id)
      entity.label.text = getLabelText(workOrder)
      entity.label.fillColor = getLabelColor(workOrder.status)
      return
    }

    // 新建Label实体
    const entity = viewer.entities.add({
      position,
      label: {
        text: getLabelText(workOrder),
        font: '14px "Microsoft YaHei", sans-serif',
        fillColor: getLabelColor(workOrder.status),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    })

    labelMap.set(workOrder.id, entity)
  }

  function removeLabel(orderId) {
    const entity = labelMap.get(orderId)
    if (entity) {
      viewer.entities.remove(entity)
      labelMap.delete(orderId)
    }
  }

  function getLabelText(wo) {
    if (wo.status === 'processing') return `🔧 处理中: ${wo.title.slice(0, 15)}...`
    return `✅ 已关闭: ${wo.title.slice(0, 15)}...`
  }

  function getLabelColor(status) {
    return status === 'processing'
      ? Cesium.Color.fromCssColorString('#FF8800')  // 橙色
      : Cesium.Color.fromCssColorString('#4CAF50')  // 绿色
  }

  function destroy() {
    labelMap.forEach((entity) => viewer.entities.remove(entity))
    labelMap.clear()
  }

  return { addOrUpdateLabel, removeLabel, destroy }
}
