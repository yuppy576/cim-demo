<template>
  <div class="floating-panel">
    <div class="panel-header">
      <h3>不动产查询</h3>
      <button class="panel-close-btn" @click="$emit('close')">✕</button>
    </div>
    <div class="panel-body">
      <PropertySearchContent
        v-if="buildings.length"
        :buildings="buildings"
        @select-building="handleSelect"
      />
      <div v-else class="loading">加载建筑数据中...</div>
    </div>
  </div>
</template>

<script setup>
import PropertySearchContent from '../components/PropertySearchContent.vue'

const props = defineProps({
  buildings: { type: Array, default: () => [] }
})
const emit = defineEmits(['select-building', 'close'])

function handleSelect(building) {
  emit('select-building', building)
  emit('close') // 选择后关闭面板，切换到城市总览
}
</script>

<style scoped>
.floating-panel{position:fixed;top:50px;right:12px;width:var(--panel-width);max-height:75vh;background:var(--bg-panel);backdrop-filter:blur(14px);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);z-index:300;display:flex;flex-direction:column;box-shadow:var(--glow-primary)}
.panel-header{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border-active)}
.panel-header h3{margin:0;font-size:var(--font-size-md);color:var(--color-primary);font-weight:600}
.panel-close-btn{background:none;border:1px solid var(--border-active);color:var(--text-secondary);width:26px;height:26px;border-radius:var(--radius-sm);cursor:pointer;font-size:var(--font-size-md);display:flex;align-items:center;justify-content:center}
.panel-body{flex:1;overflow-y:auto;padding:12px}
.loading{text-align:center;color:var(--text-dim);padding:40px}
</style>
