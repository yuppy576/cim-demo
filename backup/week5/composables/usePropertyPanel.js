import { ref } from 'vue'

/**
 * 周2：属性面板状态管理
 * 解析：响应式存储当前选中建筑数据，提供打开/关闭面板的方法
 */
export function usePropertyPanel() {
  const selectedBuilding = ref(null)

  const selectBuilding = (mockData) => {
    selectedBuilding.value = mockData ? { ...mockData } : null
  }

  const closePanel = () => {
    selectedBuilding.value = null
  }

  const updateSelectedFloor = (floorNumber) => {
    if (selectedBuilding.value) {
      selectedBuilding.value = { ...selectedBuilding.value, selectedFloor: floorNumber }
    }
  }

  return { selectedBuilding, selectBuilding, closePanel, updateSelectedFloor }
}
