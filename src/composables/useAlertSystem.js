import { ref } from 'vue'
import * as Cesium from 'cesium'

export function useAlertSystem(viewer, cameraList) {
  const alerts = ref([])
  const showVideo = ref(false)
  const currentCamera = ref(null)
  let alertTimer = null
  let alertIndex = 0
  const MAX_ALERTS = 10

  const workOrders = ref([])
  const showWorkOrder = ref(false)
  const currentWorkOrder = ref({
    id: '',
    location: '',
    eventType: '',
    cameraId: '',
    assignee: '网格员张三',
    remark: ''
  })
  let woIndex = 0
  const processingLabels = {}

  const getCameraColor = (cam) => {
    if (!cam) return Cesium.Color.DODGERBLUE
    return cam.status === 'alert' ? Cesium.Color.RED : Cesium.Color.LIME
  }

  const refreshCameraEntities = () => {
    if (!viewer) return
    const camData = cameraList.value || []
    viewer.entities.values.forEach(entity => {
      if (entity.properties?.cameraId) {
        const camId = entity.properties.cameraId.getValue()
        const cam = camData.find(c => c.id === camId)
        if (cam && entity.point) {
          entity.point.color = getCameraColor(cam)
        }
      }
    })
  }

  const setCameraColor = (cameraId, color) => {
    if (!viewer) return
    viewer.entities.values.forEach(entity => {
      if (entity.properties?.cameraId) {
        const camId = entity.properties.cameraId.getValue()
        if (camId === cameraId && entity.point) {
          entity.point.color = color
        }
      }
    })
  }

  const resetCameraColor = (cameraId) => {
    setCameraColor(cameraId, Cesium.Color.LIME)
  }

  const triggerAlert = async () => {
    if (!viewer) return
    const onlineCams = (cameraList.value || []).filter(c => c.status !== 'offline')
    if (onlineCams.length === 0) return

    const cam = onlineCams[Math.floor(Math.random() * onlineCams.length)]
    cam.status = 'alert'

    let alertTypes = []
    try {
      const res = await fetch('/data/alerts.json')
      alertTypes = await res.json()
    } catch (e) {
      alertTypes = [{ type: 'default', label: '异常事件' }]
    }
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]

    const newAlert = {
      id: `ALT-${String(++alertIndex).padStart(3, '0')}`,
      cameraId: cam.id,
      cameraName: cam.name,
      lng: cam.lng,
      lat: cam.lat,
      type: alertType.type,
      label: alertType.label,
      time: new Date().toLocaleTimeString(),
      status: 'new'
    }

    alerts.value = [newAlert, ...alerts.value].slice(0, MAX_ALERTS)
    refreshCameraEntities()
    currentCamera.value = cam
    showVideo.value = true

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(cam.lng, cam.lat, 200),
      duration: 1.5
    })
  }

  const onAlertClick = (alert) => {
    if (!viewer || !alert) return
    ;(cameraList.value || []).forEach(c => c.status = 'online')
    const targetCam = (cameraList.value || []).find(c => c.id === alert.cameraId)
    if (targetCam) {
      targetCam.status = 'alert'
      refreshCameraEntities()
    }

    showVideo.value = false
    openWorkOrder(alert)
  }

  const closeVideo = () => {
    showVideo.value = false
  }

  const openWorkOrder = (alert) => {
    currentWorkOrder.value = {
      id: `WO-${String(++woIndex).padStart(4, '0')}`,
      location: alert.cameraName || '未知位置',
      eventType: alert.label || '异常事件',
      cameraId: alert.cameraId || '未知',
      alertId: alert.id,
      assignee: '网格员张三',
      remark: ''
    }
    showWorkOrder.value = true
  }

  const closeWorkOrder = () => {
    showWorkOrder.value = false
  }

  const submitWorkOrder = () => {
    const wo = { ...currentWorkOrder.value, status: 'processing', submitTime: new Date().toLocaleTimeString() }

    const cam = (cameraList.value || []).find(c => c.id === wo.cameraId)
    wo.lng = cam ? cam.lng : 112.20
    wo.lat = cam ? cam.lat : 31.06

    workOrders.value.unshift(wo)
    showWorkOrder.value = false

    addProcessingLabel(wo)

    setTimeout(() => {
      completeWorkOrder(wo.id)
    }, 3000)
  }

  const addProcessingLabel = (wo) => {
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(wo.lng, wo.lat, 50),
      label: {
        text: '处理中',
        font: '14px sans-serif',
        fillColor: Cesium.Color.YELLOW,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -30),
        scale: 0.8
      }
    })
    processingLabels[wo.id] = entity
  }

  const completeWorkOrder = (woId) => {
    const wo = workOrders.value.find(w => w.id === woId)
    if (wo) {
      wo.status = 'closed'
      wo.completeTime = new Date().toLocaleTimeString()
    }

    // 删除"处理中"标签
    if (processingLabels[woId]) {
      viewer.entities.remove(processingLabels[woId])
      delete processingLabels[woId]
    }

    // 添加"已关闭"标签
    const closedEntity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(wo.lng, wo.lat, 50),
      label: {
        text: '已关闭',
        font: '14px sans-serif',
        fillColor: Cesium.Color.LIME,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -30),
        scale: 0.8
      }
    })

    setTimeout(() => {
      viewer.entities.remove(closedEntity)
    }, 2000)

    // 恢复摄像头颜色
    const cam = (cameraList.value || []).find(c => c.id === wo.cameraId)
    if (cam) {
      cam.status = 'online'
      refreshCameraEntities()
    }

    // 从告警列表中移除对应的告警条目
    if (wo.alertId) {
      alerts.value = alerts.value.filter(a => a.id !== wo.alertId)
    }
  }

  const startLoop = () => {
    if (alertTimer) clearInterval(alertTimer)
    alertTimer = setInterval(triggerAlert, 15000)
  }

  const destroy = () => {
    if (alertTimer) { clearInterval(alertTimer); alertTimer = null }
  }

  return {
    alerts, showVideo, currentCamera,
    triggerAlert, onAlertClick, closeVideo,
    workOrders, showWorkOrder, currentWorkOrder,
    openWorkOrder, closeWorkOrder, submitWorkOrder,
    startLoop, destroy
  }
}
