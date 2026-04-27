<template>
  <div class="property-content">
    <!-- 选中楼栋时显示户数网格 -->
    <UnitGrid
      v-if="selectedBuilding"
      :building="selectedBuilding"
      @back="selectedBuilding = null"
      @select-unit="handleUnitSelect"
    />
    
    <!-- 默认显示楼栋卡片阵列 -->
    <div v-else>
      <div class="search-card">
        <div class="search-box">
          <input v-model="keyword" type="text" placeholder="搜索建筑名称..." />
          <button>🔍</button>
        </div>
      </div>
      <div class="building-grid">
        <div
          v-for="b in filteredBuildings"
          :key="b.id"
          class="building-card"
          @click="selectBuilding(b)"
        >
          <div class="card-title">{{ b.name }}</div>
          <div class="card-info">{{ b.levels }}层 · {{ b.height }}m</div>
          <div class="card-tag">{{ b.usage || '住宅' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UnitGrid from './UnitGrid.vue'

const props = defineProps({ buildings: { type: Array, default: () => [] } })
const emit = defineEmits(['select-building'])

const keyword = ref('')
const selectedBuilding = ref(null)

const filteredBuildings = computed(() => {
  if (!keyword.value.trim()) return props.buildings
  return props.buildings.filter(b => b.name.includes(keyword.value.trim()))
})

const selectBuilding = (b) => {
  selectedBuilding.value = b
  emit('select-building', b)
}

const handleUnitSelect = (unit) => {
  console.log('选中户数:', unit.id)
}
</script>

<style scoped>
.property-content { padding: 4px; }
.search-card { padding: 8px; }
.search-box { display: flex; gap: 6px; margin-bottom: 16px; }
.search-box input {
  flex: 1; padding: 8px 12px; border-radius: 6px;
  border: 1px solid rgba(0,150,255,0.25); background: rgba(0,0,0,0.3);
  color: #fff; font-size: 13px;
}
.search-box button { background: rgba(0,150,255,0.4); border: none; border-radius: 6px; color: #fff; padding: 6px 12px; cursor: pointer; }
.building-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 4px; }
.building-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px; padding: 14px; cursor: pointer; transition: all 0.2s;
}
.building-card:hover { background: rgba(0,150,255,0.1); border-color: rgba(0,150,255,0.3); transform: translateY(-1px); }
.card-title { font-weight: 600; color: #e0f0ff; margin-bottom: 6px; font-size: 14px; }
.card-info { font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; }
.card-tag { font-size: 10px; background: rgba(0,229,255,0.15); color: var(--color-primary); display: inline-block; padding: 2px 8px; border-radius: 4px; }
</style>
