import * as Cesium from 'cesium'

/**
 * 周1：Cesium 场景初始化
 * 解析：创建纯净的地球场景，移除默认 UI，配置性能参数
 */
export function useCesiumViewer(containerId) {
  let viewer = null

  const init = (optContainerId) => {
    // 优先使用传入参数，否则使用闭包中的 containerId
    const targetId = optContainerId || containerId
    viewer = new Cesium.Viewer(targetId, {
      animation: false,
      timeline: false,
      baseLayerPicker: true,
      fullscreenButton: false,
      geocoder: false,
      homeButton: true,
      navigationHelpButton: false,
      sceneModePicker: true,
      infoBox: false,
      selectionIndicator: false
    })

    // 消除 InfoBox 沙箱警告
    if (viewer.infoBox && viewer.infoBox.frame) {
      viewer.infoBox.frame.setAttribute('sandbox', 'allow-scripts allow-same-origin')
    }

    // 性能与视觉微调
    viewer.scene.globe.maximumScreenSpaceError = 8
    viewer.scene.skyAtmosphere.show = false
    viewer.scene.fog.enabled = false
    viewer.scene.globe.enableLighting = false

    return viewer
  }

  const getViewer = () => viewer

  return { init, getViewer }
}
