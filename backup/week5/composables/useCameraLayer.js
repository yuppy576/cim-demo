import * as Cesium from 'cesium'

/**
 * 周4：摄像头点位与视频弹窗（优化版）
 * 解析：
 *   - 根据相机高度动态调整图标大小和文字显示
 *   - 高空（>2000m）：小点，无文字
 *   - 中空（500-2000m）：中等图标，淡入文字
 *   - 低空（<500m）：完整图标 + 清晰文字
 */
export function useCameraLayer(viewer) {
  let cameraEntities = []
  let videoPopupDiv = null
  let activeCameraId = null
  let removePostRenderListener = null

  // ==================== 动态缩放参数 ====================
  const HEIGHT_HIGH = 2000    // 高于此高度只显示小点
  const HEIGHT_LOW = 500      // 低于此高度显示完整图标和文字

  // ==================== 视频弹窗 DOM ====================
  const createPopupDiv = () => {
    if (videoPopupDiv) return
    videoPopupDiv = document.createElement('div')
    videoPopupDiv.id = 'camera-video-popup'
    videoPopupDiv.style.cssText = `
      position: absolute; display: none; z-index: 999;
      background: rgba(10,20,40,0.95); border: 1px solid rgba(0,150,255,0.5);
      border-radius: 8px; padding: 8px; width: 320px;
      box-shadow: 0 0 16px rgba(0,120,255,0.3);
    `
    videoPopupDiv.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span id="popup-title" style="color:#4db8ff;font-size:13px;font-weight:600;">摄像头画面</span>
        <button id="popup-close" style="background:transparent;border:1px solid rgba(0,150,255,0.4);color:#7fb8e0;width:24px;height:24px;border-radius:4px;cursor:pointer;">✕</button>
      </div>
      <video id="popup-video" style="width:100%;border-radius:4px;" muted loop></video>
      <div style="color:#a0c8e8;font-size:11px;margin-top:4px;" id="popup-info"></div>
    `
    document.body.appendChild(videoPopupDiv)
    document.getElementById('popup-close').addEventListener('click', () => closePopup())
  }

  const closePopup = () => {
    if (videoPopupDiv) {
      videoPopupDiv.style.display = 'none'
      const video = document.getElementById('popup-video')
      if (video) video.pause()
      activeCameraId = null
    }
  }

  const openPopup = (cameraData, screenX, screenY) => {
    if (!videoPopupDiv) createPopupDiv()
    document.getElementById('popup-title').textContent = cameraData.name
    document.getElementById('popup-info').textContent = 
      `编号: ${cameraData.id} | 类型: ${cameraData.type} | 状态: ${cameraData.status === 'online' ? '在线🟢' : '离线🔴'}`
    const video = document.getElementById('popup-video')
    video.src = '/videos/cam1.mp4'
    video.play().catch(() => {})
    videoPopupDiv.style.display = 'block'
    videoPopupDiv.style.left = (screenX + 20) + 'px'
    videoPopupDiv.style.top = (screenY - 120) + 'px'
    activeCameraId = cameraData.id
  }

  // ==================== 图标生成 ====================
  const createCameraIcon = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 48
    canvas.height = 48
    const ctx = canvas.getContext('2d')

    // 深蓝底色圆形
    ctx.fillStyle = '#003d80'
    ctx.beginPath()
    ctx.arc(24, 24, 20, 0, Math.PI * 2)
    ctx.fill()

    // 亮蓝边框
    ctx.strokeStyle = '#00aaff'
    ctx.lineWidth = 2.5
    ctx.stroke()

    // 白色摄像头图形
    ctx.fillStyle = '#ffffff'
    // 机身
    ctx.fillRect(14, 20, 20, 12)
    // 镜头
    ctx.fillRect(19, 17, 10, 4)
    // 红点（录制指示）
    ctx.fillStyle = '#ff3333'
    ctx.beginPath()
    ctx.arc(24, 26, 3, 0, Math.PI * 2)
    ctx.fill()

    return canvas.toDataURL()
  }

  // ==================== 加载摄像头点位 ====================
  const load = async () => {
    createPopupDiv()

    const response = await fetch('/data/cameras.json')
    const cameras = await response.json()

    cameras.forEach(cam => {
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(cam.lng, cam.lat, 0),
        billboard: {
          image: createCameraIcon(),
          width: 48,
          height: 48,
          scaleByDistance: new Cesium.NearFarScalar(300, 1.0, 2000, 0.25),
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER
        },
        label: {
          text: cam.name,
          font: '13px Microsoft YaHei',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString('#001a33'),
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          pixelOffset: new Cesium.Cartesian2(0, -28),
          scaleByDistance: new Cesium.NearFarScalar(300, 1.0, 1500, 0.0),
          translucencyByDistance: new Cesium.NearFarScalar(300, 1.0, 1000, 0.0)
        },
        properties: { cameraData: cam }
      })
      cameraEntities.push(entity)
    })

    // ==================== 点击事件 ====================
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    handler.setInputAction((click) => {
      const picked = viewer.scene.pick(click.position)
      if (Cesium.defined(picked) && picked.id && picked.id.properties?.cameraData) {
        const camData = picked.id.properties.cameraData.getValue()
        const position = picked.id.position.getValue()
        const screenPos = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, position)
        if (screenPos) openPopup(camData, screenPos.x, screenPos.y)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // ==================== 弹窗跟随 + 动态缩放 ====================
    removePostRenderListener = viewer.scene.postRender.addEventListener(() => {
      // 获取当前相机高度
      const cameraHeight = viewer.camera.positionCartographic.height

      // 动态更新所有摄像头实体的显示
      cameraEntities.forEach(entity => {
        if (entity.billboard) {
          const baseWidth = 48
          const baseHeight = 48

          if (cameraHeight > HEIGHT_HIGH) {
            // 高空：极小点
            entity.billboard.width = 8
            entity.billboard.height = 8
          } else if (cameraHeight > HEIGHT_LOW) {
            // 中空：按比例缩放
            const ratio = 1 - (cameraHeight - HEIGHT_LOW) / (HEIGHT_HIGH - HEIGHT_LOW)
            const size = 8 + ratio * 40
            entity.billboard.width = size
            entity.billboard.height = size
          } else {
            // 低空：完整大小
            entity.billboard.width = baseWidth
            entity.billboard.height = baseHeight
          }

          // 低空时显示文字（opacity 设为1）
          if (entity.label) {
            entity.label.show = cameraHeight < HEIGHT_LOW + 200
          }
        }
      })

      // 视频弹窗跟随
      if (!activeCameraId || !videoPopupDiv || videoPopupDiv.style.display !== 'block') return
      const entity = cameraEntities.find(e => {
        const data = e.properties?.cameraData?.getValue()
        return data && data.id === activeCameraId
      })
      if (entity && entity.position) {
        const screenPos = Cesium.SceneTransforms.worldToWindowCoordinates(
          viewer.scene,
          entity.position.getValue()
        )
        if (screenPos) {
          videoPopupDiv.style.left = (screenPos.x + 20) + 'px'
          videoPopupDiv.style.top = (screenPos.y - 120) + 'px'
        }
      }
    })
  }

  // ==================== 清理 ====================
  const destroy = () => {
    if (removePostRenderListener) removePostRenderListener()
    cameraEntities.forEach(e => viewer.entities.remove(e))
    cameraEntities = []
    if (videoPopupDiv) { videoPopupDiv.remove(); videoPopupDiv = null }
  }

  return { load, closePopup, destroy }
}
