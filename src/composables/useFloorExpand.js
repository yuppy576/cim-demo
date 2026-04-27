import * as Cesium from 'cesium'

export function useFloorExpand(viewer) {
  let currentEntity = null
  let currentBuilding = null
  let floorEntities = []

  function expandFloors(entity, building) {
    resetAllHighlights()
    currentEntity = entity
    currentBuilding = building
    if (!entity?.polygon || !building?.levels) return

    // 为每一层创建半透明覆盖层
    for (let i = 1; i <= building.levels; i++) {
      const floorEntity = viewer.entities.add({
        polygon: {
          hierarchy: entity.polygon.hierarchy.getValue(),
          extrudedHeight: i * 3,
          height: (i - 1) * 3,
          material: Cesium.Color.fromCssColorString('#00e5ff').withAlpha(0.15),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#00e5ff').withAlpha(0.5),
        }
      })
      floorEntities.push(floorEntity)
    }
  }

  function selectFloor(entityId, floor) {
    if (!currentEntity || !currentBuilding) return
    // 高亮选中楼层（第 floor 层更深色）
    floorEntities.forEach((fe, i) => {
      if (i + 1 === floor) {
        fe.polygon.material = Cesium.Color.fromCssColorString('#00e5ff').withAlpha(0.4)
      } else {
        fe.polygon.material = Cesium.Color.fromCssColorString('#00e5ff').withAlpha(0.15)
      }
    })
  }

  function resetAllHighlights() {
    floorEntities.forEach(fe => viewer.entities.remove(fe))
    floorEntities = []
    currentEntity = null
    currentBuilding = null
  }

  return { expandFloors, selectFloor, resetAllHighlights }
}
