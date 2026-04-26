import { ref } from 'vue'
import * as Cesium from 'cesium'
import { useCameraLayer } from './useCameraLayer.js'
import { useAlertSystem } from './useAlertSystem.js'

export function useVideoSurveillance(viewer) {
  const cameraList = ref([])
  const showCameraPanel = ref(false)
  const alertSystem = ref(null)
  let cameraLayer = null

  const init = async () => {
    cameraLayer = useCameraLayer(viewer)
    await cameraLayer.load()
    const resp = await fetch('/data/cameras.json')
    cameraList.value = await resp.json()
  }

  const startAlert = () => {
    if (!alertSystem.value) {
      alertSystem.value = useAlertSystem(viewer, cameraList)
      alertSystem.value.startLoop()
    }
  }

  const stopAlert = () => {
    alertSystem.value?.destroy()
    alertSystem.value = null
  }

  const toggleCameraPanel = () => {
    showCameraPanel.value = !showCameraPanel.value
    if (showCameraPanel.value) {
      startAlert()
    } else {
      stopAlert()
    }
  }

  const handleCameraSelect = (cam) => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(cam.lng, cam.lat, 300),
      duration: 1
    })
  }

  return {
    cameraList,
    showCameraPanel,
    alertSystem,
    init,
    toggleCameraPanel,
    handleCameraSelect,
    stopAlert
  }
}
