<template>
  <div :class="['camera-list-wrapper', { 'inline-mode': inline }]">
    <div class="panel-header" v-if="showHeader">
      <span>📹 监控列表</span>
      <button @click="$emit('close')">✕</button>
    </div>
    <div class="panel-body">
      <div
        v-for="cam in cameras"
        :key="cam.id"
        class="camera-item"
        :class="{ 'camera-item-active': activeCamId === cam.id }"
        @click="selectCamera(cam)"
      >
        <span class="cam-status" :class="cam.status"></span>
        <span class="cam-name">{{ cam.name }}</span>
        <span class="cam-locate" @click.stop="$emit('locate', cam)">📍</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  cameras: { type: Array, default: () => [] },
  inline: { type: Boolean, default: false },
  showHeader: { type: Boolean, default: false },
  activeCamId: { type: String, default: null }   // 同步高亮
})

const emit = defineEmits(['close', 'select', 'locate'])

const selectCamera = (cam) => {
  emit('select', cam)
}
</script>

<style scoped>
.inline-mode {
  position: relative !important;
  left: auto !important;
  top: auto !important;
  width: 100% !important;
  max-height: none !important;
  background: none !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
}
.camera-list-wrapper {
  padding: 6px;
  color: var(--text-primary);
  font-size: 13px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(0,150,255,0.2);
}
.panel-header button {
  background: none;
  border: 1px solid rgba(0,150,255,0.4);
  color: #7fb8e0;
  border-radius: 4px;
  cursor: pointer;
}
.panel-body { padding: 6px; }
.camera-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}
.camera-item:hover { background: rgba(0,150,255,0.15); }
.camera-item-active { background: var(--border-active); border-left: 2px solid var(--color-primary); }
.cam-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cam-status.online { background: #4caf50; }
.cam-status.offline { background: #f44336; }
.cam-name { flex: 1; font-size: 12px; }
.cam-locate {
  font-size: 14px;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.cam-locate:hover { opacity: 1; }
</style>
