import { useBuildingLayer } from './useBuildingLayer.js'
import { useBuildingInteraction } from './useBuildingInteraction.js'
import { usePropertyPanel } from './usePropertyPanel.js'
import { useFloorExpand } from './useFloorExpand.js'

export function useDataPlatform(viewer) {
  const buildingLayer = useBuildingLayer(viewer)
  const propertyPanel = usePropertyPanel()
  const floorExpand = useFloorExpand(viewer)

  let interaction = null
  let currentSelectedEntityId = null

  const init = async () => {
    await buildingLayer.load()
    const mockDataMap = buildingLayer.getMockDataMap()

    interaction = useBuildingInteraction(viewer, mockDataMap)
    interaction.init()
    interaction.onSelect((mockData, entity) => {
      if (mockData && entity) {
        // 关键修复：切换到新建筑时，彻底还原旧建筑
        if (currentSelectedEntityId && currentSelectedEntityId !== entity.id) {
          floorExpand.collapseBuilding(currentSelectedEntityId)
        }

        // 更新属性面板
        propertyPanel.selectBuilding(mockData)
        currentSelectedEntityId = entity.id

        // 展开楼层
        floorExpand.expandFloors(entity, mockData)
      } else {
        // 点击空白：彻底清理
        if (currentSelectedEntityId) {
          floorExpand.collapseBuilding(currentSelectedEntityId)
        }
        propertyPanel.closePanel()
        currentSelectedEntityId = null
      }
    })
  }

  const handleClosePanel = () => {
    interaction?.resetHighlight()
    if (currentSelectedEntityId) {
      floorExpand.collapseBuilding(currentSelectedEntityId)
    }
    propertyPanel.closePanel()
    currentSelectedEntityId = null
  }

  const handleSelectFloor = (floorNumber) => {
    propertyPanel.updateSelectedFloor(floorNumber)
    if (currentSelectedEntityId) {
      floorExpand.selectFloor(currentSelectedEntityId, floorNumber)
    }
  }

  return {
    init,
    selectedBuilding: propertyPanel.selectedBuilding,
    handleClosePanel,
    handleSelectFloor
  }
}
