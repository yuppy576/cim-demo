<template>
  <div class="camera-panel" v-if="visible">
    <div class="panel-header">
      <span>📹 视频监控</span>
      <button @click="$emit('close')">✕</button>
    </div>
    <div class="panel-body">
      <div v-for="cam in cameras" :key="cam.id" class="camera-item" @click="$emit('select', cam)">
        <span class="cam-status" :class="cam.status"></span>
        <span class="cam-name">{{ cam.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  cameras: { type: Array, default: () => [] }
})
defineEmits(['close', 'select'])
</script>

<style scoped>
.camera-panel {
  position: fixed; left: 10px; top: 80px;
  width: 240px; max-height: 60vh; overflow-y: auto;
  background: rgba(10,20,40,0.92); border: 1px solid rgba(0,150,255,0.3);
  border-radius: 8px; z-index: 900; color: #e0f0ff;
}
.panel-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; border-bottom: 1px solid rgba(0,150,255,0.25);
  font-size: 14px; font-weight: 600; color: #4db8ff;
}
.panel-header button {
  background: transparent; border: 1px solid rgba(0,150,255,0.4);
  color: #7fb8e0; width: 24px; height: 24px; border-radius: 4px; cursor: pointer;
}
.panel-body { padding: 8px; }
.camera-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px; border-radius: 6px; cursor: pointer;
  transition: background 0.2s;
}
.camera-item:hover { background: rgba(0,120,255,0.2); }
.cam-status {
  width: 8px; height: 8px; border-radius: 50%;
  background: #4caf50;
}
.cam-status.offline { background: #f44336; }
.cam-name { font-size: 12px; }
</style>
