import { ref } from 'vue'
import * as Cesium from 'cesium'

export function useAlertSystem(viewer, cameraList) {
  const alerts = ref([])
  const showVideo = ref(false)
  const currentCamera = ref(null)
  let alertTimer = null
  let alertIndex = 0
  const MAX_ALERTS = 10

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
    (cameraList.value || []).forEach(c => c.status = 'online')
    const targetCam = (cameraList.value || []).find(c => c.id === alert.cameraId)
    if (targetCam) {
      targetCam.status = 'alert'
      refreshCameraEntities()
      currentCamera.value = targetCam
      showVideo.value = true
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(alert.lng, alert.lat, 200),
        duration: 1.0
      })
    }
  }

  const closeVideo = () => { showVideo.value = false }

  const startLoop = () => {
    if (alertTimer) clearInterval(alertTimer)
    alertTimer = setInterval(triggerAlert, 15000)
  }

  const destroy = () => {
    if (alertTimer) { clearInterval(alertTimer); alertTimer = null }
  }

  return {
    alerts, showVideo, currentCamera,
    triggerAlert, onAlertClick, closeVideo, startLoop, destroy
  }
}
