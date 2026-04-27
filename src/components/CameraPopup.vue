<template>
  <div
    v-if="camera"
    class="video-modal"
    :style="{ left: modalPos.x + 'px', top: modalPos.y + 'px' }"
  >
    <div class="video-header drag-handle" @mousedown="startDrag">
      <span>{{ camera.name }}</span>
      <div class="header-actions">
        <button @click="$emit('locate', camera)" title="定位摄像头">📍</button>
        <button @click="close">✕</button>
      </div>
    </div>
    <canvas ref="videoCanvas" width="400" height="220" class="video-canvas"></canvas>
    <div class="osd-bar">{{ camera.osd }}</div>
    <div class="video-controls">
      <button @click="zoomIn">+</button>
      <button @click="zoomOut">-</button>
      <span class="timestamp">{{ currentTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, reactive } from 'vue'

const props = defineProps({
  camera: { type: Object, default: null }
})

const emit = defineEmits(['close', 'locate'])

const videoCanvas = ref(null)
const currentTime = ref('')
let animFrame = null
let zoom = 1

const modalPos = reactive({ x: 100, y: 100 })
let isDragging = false
let dragStart = { x: 0, y: 0 }

const startDrag = (e) => {
  isDragging = true
  dragStart.x = e.clientX - modalPos.x
  dragStart.y = e.clientY - modalPos.y
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}
const onDrag = (e) => {
  if (!isDragging) return
  modalPos.x = e.clientX - dragStart.x
  modalPos.y = e.clientY - dragStart.y
}
const stopDrag = () => {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const close = () => {
  emit('close')
}

const startSimulatedVideo = () => {
  const update = () => {
    const now = new Date()
    currentTime.value = now.toLocaleString('zh-CN')
    if (videoCanvas.value) {
      const ctx = videoCanvas.value.getContext('2d')
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, 400, 220)
      ctx.strokeStyle = '#00ff0044'; ctx.lineWidth = 0.5
      for (let i = 0; i < 400; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 220); ctx.stroke() }
      for (let j = 0; j < 220; j += 40) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(400, j); ctx.stroke() }
      ctx.fillStyle = '#ffffff'; ctx.font = '14px monospace'
      ctx.fillText(currentTime.value, 180, 30)
      const x = (Date.now() % 8000) / 20
      ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.arc(x, 100, 6, 0, Math.PI*2); ctx.fill()
    }
    animFrame = requestAnimationFrame(update)
  }
  update()
}

const stopVideo = () => {
  cancelAnimationFrame(animFrame)
}

watch(() => props.camera, (newVal) => {
  if (newVal) {
    startSimulatedVideo()
  } else {
    stopVideo()
  }
}, { immediate: true })

onUnmounted(() => stopVideo())

const zoomIn = () => { zoom = Math.min(zoom + 0.2, 2.5) }
const zoomOut = () => { zoom = Math.max(zoom - 0.2, 0.6) }
</script>

<style scoped>
.video-modal {
  position: fixed;
  z-index: 2000;
  background: rgba(10,20,40,0.95);
  border: 1px solid rgba(0,150,255,0.4);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  transform: scale(v-bind('zoom'));
  transform-origin: top left;
}
.drag-handle {
  cursor: move;
  user-select: none;
}
.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  color: var(--color-primary);
  font-weight: 600;
  background: rgba(0,150,255,0.1);
}
.header-actions { display: flex; gap: 6px; }
.header-actions button {
  background: none;
  border: 1px solid rgba(0,150,255,0.4);
  color: #7fb8e0;
  cursor: pointer;
  border-radius: 4px;
  width: 26px;
  height: 26px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-actions button:hover { background: var(--border-active); color: #fff; }
.video-canvas { display: block; }
.osd-bar {
  padding: 4px 12px;
  font-size: 11px;
  color: #aaa;
  background: rgba(0,0,0,0.4);
}
.video-controls {
  display: flex;
  gap: 8px;
  padding: 6px 12px;
  align-items: center;
}
.video-controls button {
  background: rgba(0,150,255,0.3);
  border: none;
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.timestamp { margin-left: auto; font-size: 11px; color: #aaa; }
</style>
