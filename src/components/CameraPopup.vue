<template>
  <div v-if="camera" class="video-modal" :style="{ left: modalPos.x + 'px', top: modalPos.y + 'px' }">
    <div class="video-header drag-handle" @mousedown="startDrag">
      <span>{{ camera.name }}</span>
      <div class="header-actions">
        <button @click="togglePTZ" title="云台控制">🎮</button>
        <button @click="$emit('locate', camera)" title="定位摄像头">📍</button>
        <button @click="directAlert" title="一键创建预警">🚨</button>
        <button @click="close">✕</button>
      </div>
    </div>
    <canvas ref="videoCanvas" width="400" height="220" class="video-canvas"></canvas>
    
    <div class="ai-status" :class="{ 'ai-alert': aiDetected }">
      {{ aiDetected ? '⚠️ AI检测：' + aiAlertType + ' | ' + aiAdvice : '🔍 AI监测中...' }}
      <button v-if="aiDetected && !showAlertForm" class="btn-quick-dispatch" @click="quickDispatch">一键派单</button>
    </div>

    <div v-if="showPTZ" class="ptz-mini">
      <div class="ptz-grid">
        <button @click="panCamera(0, 15)">↑</button>
        <button @click="panCamera(-15, 0)">←</button>
        <button class="ptz-center" disabled>云台</button>
        <button @click="panCamera(15, 0)">→</button>
        <button @click="panCamera(0, -15)">↓</button>
      </div>
      <div class="zoom-mini">
        <span>🔍</span>
        <input type="range" min="1" max="3" step="0.1" v-model.number="cameraZoom" />
        <span class="zoom-val">{{ cameraZoom.toFixed(1) }}x</span>
      </div>
    </div>

    <div class="action-bar">
      <button @click="takeScreenshot">📸 截图</button>
      <button @click="manualAI">🤖 AI识别</button>
      <button @click="showAlertForm = !showAlertForm">📝 {{ showAlertForm ? '取消预警' : '详细预警' }}</button>
    </div>

    <div v-if="showAlertForm" class="alert-form">
      <div class="form-row">
        <label>预警类型</label>
        <select v-model="alertType">
          <option v-for="t in alertTypes" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div class="form-row">
        <label>严重级别</label>
        <select v-model="alertLevel">
          <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
        </select>
      </div>
      <div class="form-row">
        <label>备注</label>
        <textarea v-model="alertNote" placeholder="特殊情况注明（选填）"></textarea>
      </div>
      <div class="form-actions">
        <button class="btn-submit" @click="submitAlertManual">确认生成</button>
        <button class="btn-cancel" @click="showAlertForm = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, reactive, nextTick } from 'vue'
import eventBus from '../utils/eventBus.js'

const props = defineProps({ camera: { type: Object, default: null } })
const emit = defineEmits(['close', 'locate'])

const videoCanvas = ref(null)
const showPTZ = ref(false)
const showAlertForm = ref(false)
const alertType = ref('车辆违停')
const alertLevel = ref('黄')
const alertNote = ref('')
const aiDetected = ref(false)
const aiAlertType = ref('')
const aiAdvice = ref('')
const isUserInteracting = ref(false)
const cameraZoom = ref(1)

const alertTypes = ['车辆违停', '人群聚集', '占道经营', '烟雾告警', '抛物检测', '区域入侵', '明火告警', '交通拥堵']
const levels = ['蓝', '黄', '橙', '红']

let animFrame = null
let panX = 0, panY = 0
let redDotX = 200, redDotY = 110
let dotSpeedX = 0.3 + Math.random() * 0.5
let dotSpeedY = 0.2 + Math.random() * 0.4
let autoAITimer = null

const modalPos = reactive({ x: 100, y: 100 })
let isDragging = false, dragStart = { x: 0, y: 0 }

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

const close = () => { emit('close') }
const togglePTZ = () => { showPTZ.value = !showPTZ.value }

const panCamera = (dx, dy) => {
  panX = Math.max(-120, Math.min(120, panX + dx))
  panY = Math.max(-80, Math.min(80, panY + dy))
}

const takeScreenshot = () => {
  if (videoCanvas.value) {
    const link = document.createElement('a')
    link.download = 'screenshot_' + Date.now() + '.png'
    link.href = videoCanvas.value.toDataURL()
    link.click()
  }
}

const manualAI = () => {
  isUserInteracting.value = true
  aiDetected.value = true
  aiAlertType.value = alertTypes[Math.floor(Math.random() * alertTypes.length)]
  aiAdvice.value = '建议派员前往' + (props.camera?.name || '现场') + '处置'
  setTimeout(() => { isUserInteracting.value = false }, 3000)
}

const quickDispatch = () => {
  if (aiDetected.value) {
    const alert = buildAlert(aiAlertType.value, '黄', 'AI自动识别')
    submitAlert(alert)
  }
}

const directAlert = () => {
  const alert = buildAlert('视频巡查', '黄', '地图一键创建')
  submitAlert(alert)
}

const submitAlertManual = () => {
  const alert = buildAlert(alertType.value, alertLevel.value, alertNote.value || '人工添加')
  submitAlert(alert)
  showAlertForm.value = false
}

const buildAlert = (type, level, note) => ({
  id: Date.now(),
  type,
  level,
  cameraName: props.camera?.name || '未知',
  time: new Date().toLocaleTimeString('zh-CN'),
  note,
  aiDetected: aiDetected.value,
  screenshot: videoCanvas.value?.toDataURL() || null,
  status: (level === '红' || level === '橙') ? 'pending' : 'active'
})

const submitAlert = (alert) => {
  eventBus.emit('alert:new', alert)
  if (alert.status === 'active') {
    eventBus.emit('workorder:dispatch', alert)
  }
  aiDetected.value = false
}

// 🔥 核心修复：停止旧动画循环
const stopVideo = () => {
  if (animFrame) {
    cancelAnimationFrame(animFrame)
    animFrame = null
  }
  if (autoAITimer) {
    clearTimeout(autoAITimer)
    autoAITimer = null
  }
}

const renderVideo = () => {
  if (!videoCanvas.value) return
  const ctx = videoCanvas.value.getContext('2d')
  const w = 400, h = 220
  
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, w, h)
  
  ctx.save()
  ctx.translate(w/2, h/2)
  ctx.scale(cameraZoom.value, cameraZoom.value)
  ctx.translate(-w/2, -h/2)
  
  const ox = (panX + Date.now() * 0.02) % 40
  const oy = (panY + Date.now() * 0.02) % 40
  ctx.strokeStyle = '#00330044'
  ctx.lineWidth = 0.5
  for (let i = ox % 40; i < w + 40; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke() }
  for (let j = oy % 40; j < h + 40; j += 40) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(w, j); ctx.stroke() }

  redDotX += dotSpeedX
  redDotY += dotSpeedY
  if (redDotX > w - 20 || redDotX < 20) dotSpeedX *= -1
  if (redDotY > h - 20 || redDotY < 20) dotSpeedY *= -1
  
  const drawX = redDotX + panX
  const drawY = redDotY + panY
  
  ctx.fillStyle = '#ff4444'
  ctx.beginPath()
  ctx.arc(drawX, drawY, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ff888844'
  ctx.beginPath()
  ctx.arc(drawX, drawY, 14, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
  
  ctx.fillStyle = '#ffffff'
  ctx.font = '12px monospace'
  ctx.fillText(new Date().toLocaleTimeString('zh-CN'), 10, 20)
  ctx.fillText('实时监控', w - 70, h - 8)

  animFrame = requestAnimationFrame(renderVideo)
}

const startAICycle = () => {
  const autoAI = () => {
    if (!props.camera) return
    if (!isUserInteracting.value && !showAlertForm.value && !aiDetected.value) {
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)]
      const level = levels[Math.floor(Math.random() * levels.length)]
      aiAlertType.value = type
      aiAdvice.value = '系统主动推送：建议派员前往' + (props.camera?.name || '现场') + '处置'
      aiDetected.value = true
      
      const alert = buildAlert(type, level, 'AI主动推送')
      eventBus.emit('alert:new', alert)
      if (level === '蓝' || level === '黄') {
        eventBus.emit('workorder:dispatch', alert)
      }
    }
    if (props.camera && !isUserInteracting.value && !showAlertForm.value) {
      autoAITimer = setTimeout(autoAI, 10000 + Math.random() * 10000)
    }
  }
  autoAITimer = setTimeout(autoAI, 8000 + Math.random() * 7000)
}

// 🔥 修复：停止旧画布 + 重置状态 + 启动新画布
watch(() => props.camera, (val) => {
  stopVideo()
  if (val) {
    // 重置所有状态
    panX = 0; panY = 0
    redDotX = 200; redDotY = 110
    dotSpeedX = 0.3 + Math.random() * 0.5
    dotSpeedY = 0.2 + Math.random() * 0.4
    aiDetected.value = false
    showAlertForm.value = false
    showPTZ.value = false
    cameraZoom.value = 1
    
    nextTick(() => {
      renderVideo()
      startAICycle()
    })
  }
}, { immediate: false })

onUnmounted(() => {
  stopVideo()
})
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
  width: 400px;
}
.drag-handle { cursor: move; user-select: none; }
.video-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; color: var(--color-primary); font-weight: 600;
  background: rgba(0,150,255,0.1);
}
.header-actions { display: flex; gap: 6px; }
.header-actions button {
  background: none; border: 1px solid rgba(0,150,255,0.4); color: #7fb8e0;
  cursor: pointer; border-radius: 4px; width: 26px; height: 26px;
  font-size: 14px; display: flex; align-items: center; justify-content: center;
}
.video-canvas { display: block; }

.ai-status {
  padding: 4px 12px; font-size: 11px;
  background: rgba(0,255,136,0.08); color: #00ff88;
  display: flex; justify-content: space-between; align-items: center;
}
.ai-status.ai-alert { background: rgba(255,136,0,0.15); color: #ff8800; font-weight: 600; }
.btn-quick-dispatch {
  background: rgba(255,136,0,0.4); border: 1px solid rgba(255,136,0,0.6);
  color: #fff; font-size: 10px; padding: 2px 8px; border-radius: 3px; cursor: pointer;
}
.ptz-mini {
  padding: 6px 12px; background: rgba(0,0,0,0.4);
  display: flex; gap: 12px; align-items: center;
}
.ptz-grid {
  display: grid; grid-template-columns: 24px 24px 24px; grid-template-rows: 24px 24px 24px;
  gap: 2px;
}
.ptz-grid button:nth-child(1) { grid-column: 2; grid-row: 1; }
.ptz-grid button:nth-child(2) { grid-column: 1; grid-row: 2; }
.ptz-grid button:nth-child(3) { grid-column: 2; grid-row: 2; font-size: 8px; background: rgba(0,150,255,0.3); color: #aaa; border: 1px solid rgba(0,150,255,0.2); border-radius: 3px; }
.ptz-grid button:nth-child(4) { grid-column: 3; grid-row: 2; }
.ptz-grid button:nth-child(5) { grid-column: 2; grid-row: 3; }
.ptz-grid button {
  background: rgba(0,150,255,0.15); border: 1px solid rgba(0,150,255,0.25);
  color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;
}
.zoom-mini { display: flex; align-items: center; gap: 4px; color: #aaa; font-size: 10px; }
.zoom-mini input { width: 60px; }
.zoom-val { color: #fff; font-weight: 600; min-width: 30px; }

.action-bar { display: flex; gap: 6px; padding: 6px 12px; }
.action-bar button {
  background: rgba(0,150,255,0.15); border: 1px solid rgba(0,150,255,0.25);
  color: #fff; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;
}
.alert-form { padding: 10px 12px; background: rgba(0,0,0,0.5); border-top: 1px solid rgba(255,136,0,0.3); }
.form-row { margin-bottom: 8px; }
.form-row label { display: block; font-size: 10px; color: #aaa; margin-bottom: 2px; }
.form-row select, .form-row textarea {
  width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(0,150,255,0.3);
  color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px;
}
.form-row textarea { height: 40px; resize: vertical; }
.form-actions { display: flex; gap: 6px; justify-content: flex-end; }
.btn-submit { background: rgba(255,136,0,0.3); border: 1px solid rgba(255,136,0,0.5); color: #fff; padding: 5px 12px; border-radius: 4px; cursor: pointer; }
.btn-cancel { background: none; border: 1px solid rgba(255,255,255,0.2); color: #aaa; padding: 5px 12px; border-radius: 4px; cursor: pointer; }
</style>
