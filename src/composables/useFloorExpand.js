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

    for (let i = 1; i <= building.levels; i++) {
      const floorEntity = viewer.entities.add({
        polygon: {
          hierarchy: entity.polygon.hierarchy.getValue(),
          extrudedHeight: i * 3,
          height: (i - 1) * 3,
          material: Cesium.Color.fromCssColorString('#00e5ff').withAlpha(0.08),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#00e5ff').withAlpha(0.2),
        }
      })
      floorEntities.push({ entity: floorEntity, floor: i })
    }
  }

  function selectFloor(entityId, floor) {
    if (!currentEntity || !currentBuilding) return

    floorEntities.forEach(({ entity: fe }) => {
      fe.polygon.material = Cesium.Color.fromCssColorString('#00e5ff').withAlpha(0.08)
      fe.polygon.outlineColor = Cesium.Color.fromCssColorString('#00e5ff').withAlpha(0.2)
    })

    const selected = floorEntities.find(fe => fe.floor === floor)
    if (selected) {
      selected.entity.polygon.material = Cesium.Color.fromCssColorString('#ffcc00').withAlpha(0.6)
      selected.entity.polygon.outlineColor = Cesium.Color.WHITE
      selected.entity.polygon.outlineWidth = 2
    }
  }

  function selectUnit(floor, unitNumber) {
    // 户级高亮：该楼层轮廓加亮绿色
    const selected = floorEntities.find(fe => fe.floor === floor)
    if (selected) {
      selected.entity.polygon.material = Cesium.Color.fromCssColorString('#00ff88').withAlpha(0.5)
      selected.entity.polygon.outlineColor = Cesium.Color.WHITE
      selected.entity.polygon.outlineWidth = 3
    }
  }

  function resetAllHighlights() {
    floorEntities.forEach(({ entity: fe }) => viewer.entities.remove(fe))
    floorEntities = []
    currentEntity = null
    currentBuilding = null
  }

  return { expandFloors, selectFloor, selectUnit, resetAllHighlights }
}
