import * as Cesium from 'cesium'

const TDT_TOKEN = '你的天地图Token'

let viewer = null
let initCalled = false

export function useCesiumViewer(containerId) {
  function initViewer() {
    console.log('🔥 [initViewer] 被调用，containerId:', containerId)
    console.log('🔥 [initViewer] initCalled 当前值:', initCalled)
    
    if (initCalled) {
      console.warn('⚠️ [initViewer] 已初始化过，跳过')
      return viewer
    }
    initCalled = true

    const container = document.getElementById(containerId)
    console.log('🔥 [initViewer] 获取到容器:', container)
    console.log('🔥 [initViewer] 容器尺寸:', container?.offsetWidth, container?.offsetHeight)

    if (!container) {
      console.error('❌ [initViewer] 容器不存在！')
      return null
    }

    container.style.cssText = `
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      display: block !important;
    `

    try {
      console.log('🔥 [initViewer] 开始创建 Cesium.Viewer...')
      viewer = new Cesium.Viewer(container, {
        animation: false,
        timeline: false,
        baseLayerPicker: true,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        navigationHelpButton: false,
        shadows: false,
        imageryProvider: false,
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        useDefaultRenderLoop: true,
        targetFrameRate: 30
      })
      console.log('✅ [initViewer] Cesium.Viewer 创建成功')

      viewer.cesiumWidget.creditContainer.style.display = 'none'

      if (TDT_TOKEN && TDT_TOKEN !== '你的天地图Token') {
        viewer.imageryLayers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: `https://t{s}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${TDT_TOKEN}`,
            subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 18,
            customHeaders: {
              'Referer': 'https://www.tianditu.gov.cn/',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
        )
        viewer.imageryLayers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: `https://t{s}.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=${TDT_TOKEN}`,
            subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 18,
            customHeaders: {
              'Referer': 'https://www.tianditu.gov.cn/',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
        )
        console.log('✅ [initViewer] 天地图卫星影像+注记已加载')
      } else {
        viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#2c3e50')
        console.warn('⚠️ [initViewer] 未配置Token，使用纯色地球')
      }

      viewer.scene.globe.depthTestAgainstTerrain = false
      viewer.scene.skyBox = undefined
      viewer.scene.sun = undefined
      viewer.scene.moon = undefined
      viewer.scene.backgroundColor = Cesium.Color.BLACK

      const forceResize = () => {
        const w = container.offsetWidth
        const h = container.offsetHeight
        if (!w || !h) return
        const canvas = viewer.canvas
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w
          canvas.height = h
          canvas.style.width = w + 'px'
          canvas.style.height = h + 'px'
          viewer.resize()
        }
      }
      forceResize()
      setTimeout(forceResize, 0)
      setTimeout(forceResize, 50)
      setTimeout(forceResize, 200)
      window.addEventListener('resize', forceResize)

      console.log('✅ [initViewer] Cesium 初始化完成')
      window.__cesiumViewer = viewer
      return viewer
    } catch (e) {
      console.error('❌ [initViewer] 初始化失败:', e)
      initCalled = false
      return null
    }
  }

  function getViewer() { return viewer }
  return { init: initViewer, getViewer }
}
