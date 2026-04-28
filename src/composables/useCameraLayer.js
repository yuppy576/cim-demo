import * as Cesium from 'cesium'
import eventBus from '../utils/eventBus.js'

export function useCameraLayer(viewer) {
  let cameraEntities = []
  let removePostRenderListener = null

  const HEIGHT_HIGH = 2000
  const HEIGHT_LOW = 500

  const STATUS_COLORS = {
    online: '#00ff88',
    offline: '#888888',
    alarm: '#ff3333'
  }

  const createCameraIcon = (status) => {
    const canvas = document.createElement('canvas')
    canvas.width = 48
    canvas.height = 48
    const ctx = canvas.getContext('2d')

    const baseColor = STATUS_COLORS[status] || '#00aaff'
    ctx.fillStyle = baseColor
    ctx.beginPath()
    ctx.arc(24, 24, 20, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#ffffff55'
    ctx.lineWidth = 2.5
    ctx.stroke()

    ctx.fillStyle = '#ffffffcc'
    ctx.fillRect(14, 20, 20, 12)
    ctx.fillRect(19, 17, 10, 4)

    ctx.fillStyle = status === 'alarm' ? '#ff0000' : '#ff4444'
    ctx.beginPath()
    ctx.arc(24, 26, 3, 0, Math.PI * 2)
    ctx.fill()

    return canvas.toDataURL()
  }

  const load = async () => {
    const response = await fetch(import.meta.env.BASE_URL + 'data/cameras.json')
    const cameras = await response.json()

    cameras.forEach((cam, index) => {
      const displayStatus = (index === 2 || index === 7) ? 'alarm' : (cam.status || 'online')

      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(cam.lng, cam.lat, 0),
        billboard: {
          image: createCameraIcon(displayStatus),
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
        properties: {
          cameraData: cam,
          displayStatus: displayStatus
        }
      })
      cameraEntities.push(entity)
    })

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    handler.setInputAction((click) => {
      const picked = viewer.scene.pick(click.position)
      if (Cesium.defined(picked) && picked.id && picked.id.properties?.cameraData) {
        const camData = picked.id.properties.cameraData.getValue()
        eventBus.emit('camera:map-click', camData)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    removePostRenderListener = viewer.scene.postRender.addEventListener(() => {
      const cameraHeight = viewer.camera.positionCartographic.height
      const baseWidth = 48
      const baseHeight = 48

      cameraEntities.forEach(entity => {
        if (entity.billboard) {
          if (cameraHeight > HEIGHT_HIGH) {
            entity.billboard.width = 8
            entity.billboard.height = 8
          } else if (cameraHeight > HEIGHT_LOW) {
            const ratio = 1 - (cameraHeight - HEIGHT_LOW) / (HEIGHT_HIGH - HEIGHT_LOW)
            const size = 8 + ratio * 40
            entity.billboard.width = size
            entity.billboard.height = size
          } else {
            entity.billboard.width = baseWidth
            entity.billboard.height = baseHeight
          }
          if (entity.label) {
            entity.label.show = cameraHeight < HEIGHT_LOW + 200
          }
        }
      })
    })
  }

  const destroy = () => {
    if (removePostRenderListener) removePostRenderListener()
    cameraEntities.forEach(e => viewer.entities.remove(e))
    cameraEntities = []
  }

  return { load, destroy }
}
