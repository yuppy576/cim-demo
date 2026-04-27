import { ref } from 'vue'

export function usePropertyPanel() {
  const selectedBuilding = ref(null)

  const selectBuilding = (mockData) => {
    if (!mockData) {
      selectedBuilding.value = null
      return
    }
    selectedBuilding.value = {
      name: mockData.name || '未知建筑',
      levels: mockData.levels || 1,
      height: mockData.height || 0,
      selectedFloor: null,
      selectedUnit: null,
      units: mockData.units || []
    }
  }

  const closePanel = () => { selectedBuilding.value = null }

  const updateSelectedFloor = (floorNumber) => {
    if (selectedBuilding.value) {
      selectedBuilding.value.selectedFloor = floorNumber
      selectedBuilding.value.selectedUnit = null
    }
  }

  const updateSelectedUnit = (unitNumber) => {
    if (selectedBuilding.value) {
      selectedBuilding.value.selectedUnit = unitNumber
    }
  }

  return { selectedBuilding, selectBuilding, closePanel, updateSelectedFloor, updateSelectedUnit }
}
