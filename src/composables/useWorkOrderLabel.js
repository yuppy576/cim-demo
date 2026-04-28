import * as Cesium from 'cesium'

const ALERT_ICONS = {
  '车辆违停': '🚗',
  '人群聚集': '👥',
  '占道经营': '🚧',
  '烟雾告警': '💨',
  '抛物检测': '⬇️',
  '区域入侵': '⚠️',
  '明火告警': '🔥',
  '交通拥堵': '🚦',
  '视频巡查': '📹',
  '未知': '📋'
}

export function useWorkOrderLabel(viewer) {
  let labelEntities = {}

  function addOrUpdateLabel(wo) {
    removeLabel(wo.id)

    const icon = ALERT_ICONS[wo.alertType] || '📋'
    const color = wo.status === 'processing' ? '#FF8800' : '#4CAF50'
    const statusText = wo.status === 'hung' ? '⚠️挂起' : wo.status === 'processing' ? '🔧处理中' : '✅已关闭'

    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(wo.location.lng, wo.location.lat, 50),
      label: {
        text: `${icon} ${wo.id} ${statusText}`,
        font: '12px Microsoft YaHei',
        fillColor: Cesium.Color.fromCssColorString(color),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -20),
        scaleByDistance: new Cesium.NearFarScalar(500, 1.0, 3000, 0.3)
      }
    })

    labelEntities[wo.id] = entity
  }

  function removeLabel(orderId) {
    if (labelEntities[orderId]) {
      viewer.entities.remove(labelEntities[orderId])
      delete labelEntities[orderId]
    }
  }

  function destroy() {
    Object.keys(labelEntities).forEach(id => {
      viewer.entities.remove(labelEntities[id])
    })
    labelEntities = {}
  }

  return { addOrUpdateLabel, removeLabel, destroy }
}
