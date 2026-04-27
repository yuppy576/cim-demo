<template>
  <div class="unit-grid-container">
    <div class="grid-header">
      <button class="back-btn" @click="$emit('back')">← 返回</button>
      <span class="building-name">{{ building.name }}</span>
      <span class="unit-count">共 {{ units.length }} 户</span>
    </div>
    <div class="unit-grid">
      <div
        v-for="unit in units"
        :key="unit.id"
        class="unit-item"
        :class="{ 'unit-occupied': unit.status === 'occupied' }"
        @click="selectUnit(unit)"
      >
        {{ unit.id }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ building: { type: Object, required: true } })
const emit = defineEmits(['back', 'select-unit'])

const units = computed(() => {
  const list = []
  const floors = props.building.levels || 6
  for (let f = 1; f <= floors; f++) {
    for (let u = 1; u <= 4; u++) {
      list.push({
        id: `${f}0${u}`,
        status: Math.random() > 0.6 ? 'occupied' : 'vacant'
      })
    }
  }
  return list
})

const selectUnit = (unit) => emit('select-unit', unit)
</script>

<style scoped>
.unit-grid-container { padding: 16px; }
.grid-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.back-btn { background: none; border: 1px solid rgba(0,229,255,0.3); color: var(--color-primary); padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; }
.building-name { font-size: 16px; font-weight: 600; color: #e0f0ff; }
.unit-count { margin-left: auto; font-size: 12px; color: var(--text-secondary); }
.unit-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.unit-item {
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(0,150,255,0.15);
  border-radius: 6px; font-size: 14px; font-weight: 500; color: #e0f0ff;
  cursor: pointer; transition: all 0.2s;
}
.unit-item:hover { background: rgba(0,229,255,0.1); border-color: var(--color-primary); color: var(--color-primary); transform: scale(1.05); }
.unit-occupied { background: rgba(0,229,255,0.15); border-color: var(--color-primary); }
</style>
