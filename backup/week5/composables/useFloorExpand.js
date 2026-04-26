import * as Cesium from 'cesium'

export function useFloorExpand(viewer) {
  const expandedBuildings = new Set()
  const floorEntitiesMap = new Map()

  const getPolygonCenter = (entity) => {
    try {
      const hierarchy = entity.polygon?.hierarchy?.getValue()
      if (hierarchy && hierarchy.positions && hierarchy.positions.length > 0) {
        const positions = hierarchy.positions
        let sumX = 0, sumY = 0, sumZ = 0
        positions.forEach(pos => { sumX += pos.x; sumY += pos.y; sumZ += pos.z })
        const len = positions.length
        return new Cesium.Cartesian3(sumX / len, sumY / len, sumZ / len)
      }
    } catch (e) {}
    return null
  }

  const resetAllHighlights = () => {
    floorEntitiesMap.forEach((floorList) => {
      floorList.forEach(({ entity }) => {
        if (entity && entity.polygon) {
          entity.polygon.material = Cesium.Color.fromCssColorString('#00BFFF').withAlpha(0.3)
        }
      })
    })
  }

  const expandFloors = (entity, mockData) => {
    // 防御：entity 无效则退出
    if (!entity || !entity.id) return

    if (expandedBuildings.has(entity.id)) return

    const totalFloors = mockData.levels
    const totalHeight = mockData.height
    const floorHeight = totalHeight / totalFloors

    let center = entity.position?.getValue()
    if (!center) center = getPolygonCenter(entity)
    if (!center) {
      console.warn('建筑实体缺少位置信息，无法展开楼层')
      return
    }

    const cartographic = Cesium.Cartographic.fromCartesian(center)
    const lon = Cesium.Math.toDegrees(cartographic.longitude)
    const lat = Cesium.Math.toDegrees(cartographic.latitude)

    const hierarchy = entity.polygon?.hierarchy?.getValue()
    if (!hierarchy) {
      console.warn('无法获取建筑轮廓')
      return
    }

    const floorEntities = []
    for (let i = 0; i < totalFloors; i++) {
      const floorBottom = i * floorHeight
      const floorTop = floorBottom + floorHeight
      const floorEntity = viewer.entities.add({
        polygon: {
          hierarchy: hierarchy,
          height: floorBottom,
          extrudedHeight: floorTop,
          material: Cesium.Color.fromCssColorString('#00BFFF').withAlpha(0.3),
          outline: true,
          outlineColor: Cesium.Color.WHITE.withAlpha(0.6),
          outlineWidth: 1,
        },
        properties: { floorNumber: i + 1, originalEntityId: entity.id }
      })
      floorEntities.push({ entity: floorEntity, floorNumber: i + 1 })
    }

    floorEntitiesMap.set(entity.id, floorEntities)
    expandedBuildings.add(entity.id)
    entity.show = false
  }

  const selectFloor = (entityId, floorNumber) => {
    const floorList = floorEntitiesMap.get(entityId)
    if (!floorList) return
    floorList.forEach(({ entity, floorNumber: fn }) => {
      if (fn === floorNumber) {
        entity.polygon.material = Cesium.Color.fromCssColorString('#FF0000').withAlpha(0.6)
      } else {
        entity.polygon.material = Cesium.Color.fromCssColorString('#00BFFF').withAlpha(0.3)
      }
    })
  }

  return { expandFloors, selectFloor, resetAllHighlights, floorEntitiesMap }
}
