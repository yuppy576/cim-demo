<template>
  <div class="property-panel" :class="{ active: building }">
    <div class="panel-header">
      <span class="panel-title">建筑属性</span>
      <button class="panel-close" @click="$emit('close')">✕</button>
    </div>
    <div class="panel-body" v-if="building">
      <div class="prop-item">
        <span class="prop-label">名称</span>
        <span class="prop-value">{{ building.name }}</span>
      </div>
      <div class="prop-item">
        <span class="prop-label">楼层数</span>
        <span class="prop-value">{{ building.levels }} 层</span>
      </div>
      <div class="prop-item">
        <span class="prop-label">高度</span>
        <span class="prop-value">{{ building.height }} 米</span>
      </div>
      <div class="prop-item">
        <span class="prop-label">当前选中楼层</span>
        <span class="prop-value">{{ building.selectedFloor || '未选择' }}</span>
      </div>
      <div class="floor-list">
        <div class="floor-list-title">楼层列表</div>
        <div
          v-for="floor in building.levels"
          :key="floor"
          class="floor-item"
          :class="{ active: building.selectedFloor === floor }"
          @click="$emit('selectFloor', floor)"
        >
          第 {{ floor }} 层
        </div>
      </div>
    </div>
    <div class="panel-body panel-empty" v-else>
      <p>点击建筑查看详情</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  building: { type: Object, default: null }
})
defineEmits(['close', 'selectFloor'])
</script>

<style scoped>
.property-panel {
  position: fixed;
  top: 80px;
  right: -360px;
  width: 320px;
  max-height: calc(100vh - 160px);
  background: rgba(10, 20, 40, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 150, 255, 0.3);
  border-radius: 12px 0 0 12px;
  box-shadow: -4px 0 24px rgba(0, 120, 255, 0.15);
  transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  color: #e0f0ff;
  overflow-y: auto;
}
.property-panel.active { right: 0; }
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 150, 255, 0.25);
  background: rgba(0, 80, 180, 0.3);
}
.panel-title { font-size: 15px; font-weight: 600; color: #4db8ff; }
.panel-close {
  background: transparent;
  border: 1px solid rgba(0, 150, 255, 0.4);
  color: #7fb8e0;
  width: 28px; height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.panel-close:hover { background: rgba(0, 150, 255, 0.2); color: #fff; }
.panel-body { padding: 16px 20px; }
.prop-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 120, 200, 0.15);
}
.prop-item:last-child { border-bottom: none; }
.prop-label { font-size: 13px; color: #7fa8cc; }
.prop-value { font-size: 13px; color: #c8e6ff; text-align: right; max-width: 180px; word-break: break-all; }
.floor-list { margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(0, 120, 200, 0.2); }
.floor-list-title { font-size: 13px; color: #7fa8cc; margin-bottom: 8px; }
.floor-item {
  padding: 6px 10px; margin: 4px 0; border-radius: 6px;
  cursor: pointer; font-size: 12px; color: #a0c8e8;
  background: rgba(0, 80, 160, 0.2); transition: all 0.2s;
}
.floor-item:hover { background: rgba(0, 120, 255, 0.3); color: #fff; }
.floor-item.active { background: rgba(0, 150, 255, 0.5); color: #fff; font-weight: bold; }
.panel-empty { text-align: center; padding: 40px 20px; }
.panel-empty p { font-size: 13px; color: #5a7d9a; margin: 0; }
</style>
