<template>
  <main class="map-area">
    <div id="cesiumContainer"></div>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">186</div><div class="stat-label">建筑总数</div></div>
      <div class="stat-card"><div class="stat-value">4,200</div><div class="stat-label">登记户数</div></div>
      <div class="stat-card"><div class="stat-value">12</div><div class="stat-label">摄像头点位</div></div>
      <div class="stat-card"><div class="stat-value">{{ activeWorkOrderCount }}</div><div class="stat-label">处理中工单</div></div>
    </div>
    <PropertyPanel :building="selectedBuilding" @close="$emit('close-panel')" @selectFloor="f => $emit('select-floor', f)" @selectUnit="u => $emit('select-unit', u)" />
  </main>
</template>

<script setup>
import PropertyPanel from '../components/PropertyPanel.vue'
defineProps({ selectedBuilding: Object, activeWorkOrderCount: Number })
defineEmits(['close-panel','select-floor','select-unit'])
</script>

<style scoped>
.map-area{width:100%;height:100%;position:absolute;top:0;left:0}
#cesiumContainer{width:100vw;height:100vh;position:absolute;top:0;left:0}
.stats-row{position:fixed;top:48px;right:10px;display:flex;gap:8px;z-index:200;pointer-events:none}
.stat-card{background:var(--bg-panel);backdrop-filter:blur(6px);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:8px 12px;text-align:center;min-width:60px}
.stat-value{font-size:18px;font-weight:700;color:var(--color-primary);text-shadow:var(--glow-primary)}
.stat-label{font-size:var(--font-size-sm);color:var(--text-secondary)}
</style>
