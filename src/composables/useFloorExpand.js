import * as Cesium from 'cesium'

export function useFloorExpand(viewer) {
  const expandedBuildings = new Set()
  const floorEntitiesMap = new Map()

  const resetAllHighlights = () => {
    floorEntitiesMap.forEach((floorList) => {
      floorList.forEach(({ entity }) => {
        if (entity && entity.polygon) {
          entity.polygon.material = Cesium.Color.fromCssColorString('#00BFFF').withAlpha(0.3)
        }
      })
    })
  }

  // 彻底清除指定建筑的所有楼层，并将原始建筑恢复为初始蓝色
  const collapseBuilding = (entityId) => {
    // 移除所有楼层实体
    const floorList = floorEntitiesMap.get(entityId)
    if (floorList) {
      floorList.forEach(({ entity }) => {
        if (entity) viewer.entities.remove(entity)
      })
      floorEntitiesMap.delete(entityId)
    }

    // 强制恢复原始建筑为初始蓝色
    const originalEntity = viewer.entities.getById(entityId)
    if (originalEntity && originalEntity.polygon) {
      originalEntity.polygon.material = Cesium.Color.fromCssColorString('#2196F3').withAlpha(0.5)
      originalEntity.show = true
    }

    expandedBuildings.delete(entityId)
  }

  const expandFloors = (entity, mockData) => {
    if (!entity || !entity.id) return
    if (expandedBuildings.has(entity.id)) return

    const totalFloors = mockData.levels
    const totalHeight = mockData.height
    const floorHeight = totalHeight / totalFloors

    const hierarchy = entity.polygon?.hierarchy?.getValue()
    if (!hierarchy) return

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
          outlineWidth: 1
        },
        properties: {
          floorNumber: i + 1,
          originalEntityId: entity.id,
          parentBuildId: entity.buildId
        }
      })
      floorEntities.push({ entity: floorEntity, floorNumber: i + 1 })
    }

    floorEntitiesMap.set(entity.id, floorEntities)
    expandedBuildings.add(entity.id)

    // 原始建筑变半透明
    entity.polygon.material = Cesium.Color.fromCssColorString('#2196F3').withAlpha(0.15)
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

  return {
    expandFloors,
    selectFloor,
    resetAllHighlights,
    collapseBuilding,
    floorEntitiesMap
  }
}
