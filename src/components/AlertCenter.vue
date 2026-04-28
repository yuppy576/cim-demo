<template>
  <div class="alert-center">
    <div class="alert-header">
      <h4>🚨 预警中心</h4>
      <div class="header-actions">
        <button class="btn-manual" @click="showManualForm = true">➕ 手动创建</button>
      </div>
    </div>

    <!-- 待确认预警 -->
    <div v-if="pendingAlerts.length > 0" class="alert-section">
      <div class="section-title">⏳ 待确认预警</div>
      <div v-for="alert in pendingAlerts" :key="alert.id" class="alert-item pending-item">
        <span class="alert-level" :style="{ color: getColor(alert.level) }">● {{ alert.level }}</span>
        <div class="alert-body" @click="handleAlertClick(alert)">
          <div class="alert-type">{{ alert.type }}</div>
          <div class="alert-source">📹 {{ alert.cameraName }}</div>
          <div class="alert-time">{{ alert.time }}</div>
          <div class="alert-note" v-if="alert.note">{{ alert.note }}</div>
        </div>
        <div class="alert-actions">
          <button class="btn-confirm" @click="confirmAlertAuto(alert)">一键确认</button>
          <button class="btn-dispatch-manual" @click="openManualDispatch(alert)">手动指定</button>
          <button class="btn-dismiss" @click="dismissAlert(alert.id)">忽略</button>
        </div>
      </div>
    </div>

    <!-- 活跃预警 -->
    <div class="alert-section">
      <div class="section-title">📋 活跃预警</div>
      <div v-if="activeAlerts.length === 0" class="empty-state">暂无活跃预警</div>
      <div v-for="alert in activeAlerts" :key="alert.id" class="alert-item">
        <span class="alert-level" :style="{ color: getColor(alert.level) }">● {{ alert.level }}</span>
        <div class="alert-body" @click="handleAlertClick(alert)">
          <div class="alert-type">{{ alert.type }}</div>
          <div class="alert-source">📹 {{ alert.cameraName }}</div>
          <div class="alert-time">{{ alert.time }}</div>
          <div class="alert-note" v-if="alert.note">{{ alert.note }}</div>
        </div>
        <div class="alert-actions">
          <button v-if="!alert.disposed" class="btn-dispatch" @click="openManualDispatch(alert)">派单</button>
          <span v-else class="disposed-tag">已处置</span>
        </div>
      </div>
    </div>

    <!-- 手动指定网格员弹窗 -->
    <div v-if="showDispatchModal" class="dispatch-modal">
      <div class="dispatch-content">
        <h4>指定网格员</h4>
        <div class="worker-list">
          <div v-for="w in GRID_WORKERS" :key="w" class="worker-item" @click="selectWorker(w)">{{ w }}</div>
        </div>
        <button class="btn-cancel" @click="showDispatchModal = false">取消</button>
      </div>
    </div>

    <!-- 手动创建预警弹窗 -->
    <div v-if="showManualForm" class="dispatch-modal">
      <div class="dispatch-content">
        <h4>手动创建预警</h4>
        <div class="form-row">
          <label>摄像头</label>
          <select v-model="manualCamera">
            <option v-for="c in cameraNames" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>类型</label>
          <select v-model="manualType">
            <option v-for="t in alertTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>级别</label>
          <select v-model="manualLevel">
            <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>备注</label>
          <textarea v-model="manualNote" placeholder="选填"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-submit" @click="createManualAlert">确认创建</button>
          <button class="btn-cancel" @click="showManualForm = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import eventBus from '../utils/eventBus.js'

const ALERT_ICONS = {
  '车辆违停': '🚗', '人群聚集': '👥', '占道经营': '🚧', '烟雾告警': '💨',
  '抛物检测': '⬇️', '区域入侵': '⚠️', '明火告警': '🔥', '交通拥堵': '🚦',
  '视频巡查': '📹'
}
const alertTypes = ['车辆违停', '人群聚集', '占道经营', '烟雾告警', '抛物检测', '区域入侵', '明火告警', '交通拥堵']
const cameraNames = [
  '东宝区主干道A', '东宝区主干道B', '象山大道入口', '长宁大道中段',
  '泉口路交叉口', '金龙泉大道北', '白云大道南段', '海慧路交叉口',
  '深圳大道西段', '培公大道东段', '关公大道转盘', '漳河大道入口'
]
const levels = ['蓝', '黄', '橙', '红']
const COLORS = { '蓝': '#4da6ff', '黄': '#ffcc00', '橙': '#ff8800', '红': '#ff3333' }
const GRID_WORKERS = ['张正-东宝01', '李敏-东宝02', '王强-东宝03', '赵丽-东宝04', '陈浩-东宝05']

const alerts = ref([])
const showDispatchModal = ref(false)
const showManualForm = ref(false)
const dispatchTarget = ref(null)
const manualCamera = ref(cameraNames[0])
const manualType = ref(alertTypes[0])
const manualLevel = ref('黄')
const manualNote = ref('')

const getColor = (lvl) => COLORS[lvl] || '#999'
const pendingAlerts = computed(() => alerts.value.filter(a => a.status === 'pending'))
const activeAlerts = computed(() => alerts.value.filter(a => a.status === 'active' || a.status === 'disposed'))

const confirmAlertAuto = (alert) => {
  alert.status = 'active'
  eventBus.emit('workorder:dispatch', alert)
  eventBus.emit('alert:update-camera-status', alert.cameraName, 'alarm')
}

const openManualDispatch = (alert) => {
  dispatchTarget.value = alert
  showDispatchModal.value = true
}

const selectWorker = (workerName) => {
  if (dispatchTarget.value) {
    const alert = dispatchTarget.value
    alert.status = 'active'
    eventBus.emit('workorder:dispatch-manual', alert, workerName)
    eventBus.emit('alert:update-camera-status', alert.cameraName, 'alarm')
    dispatchTarget.value = null
  }
  showDispatchModal.value = false
}

const dismissAlert = (alertId) => {
  alerts.value = alerts.value.filter(a => a.id !== alertId)
}

const handleAlertClick = (alert) => {
  eventBus.emit('alert:locate-camera', alert)
}

const createManualAlert = () => {
  const alert = {
    id: Date.now(),
    type: manualType.value,
    level: manualLevel.value,
    cameraName: manualCamera.value,
    time: new Date().toLocaleTimeString('zh-CN'),
    note: manualNote.value,
    status: (manualLevel.value === '红' || manualLevel.value === '橙') ? 'pending' : 'active'
  }
  alerts.value.unshift(alert)
  eventBus.emit('alert:new', alert)
  if (alert.status === 'active') {
    eventBus.emit('workorder:dispatch', alert)
    eventBus.emit('alert:update-camera-status', alert.cameraName, 'alarm')
  }
  showManualForm.value = false
  manualNote.value = ''
}

eventBus.on('alert:new', (alert) => {
  if (!alerts.value.find(a => a.id === alert.id)) {
    alerts.value.unshift(alert)
    if (alert.status === 'active') {
      eventBus.emit('alert:update-camera-status', alert.cameraName, 'alarm')
    }
  }
})

eventBus.on('alert:disposed', (alertId) => {
  const alert = alerts.value.find(a => a.id === alertId)
  if (alert) {
    alert.disposed = true
    eventBus.emit('alert:update-camera-status', alert.cameraName, 'online')
  }
})

eventBus.on('workorder:closed', (wo) => {
  const alert = alerts.value.find(a => a.id === wo.alertId)
  if (alert) {
    alert.disposed = true
    eventBus.emit('alert:update-camera-status', wo.cameraName, 'online')
  }
})

onMounted(() => {
  console.log('预警中心已启动，三源合一+深度联动模式')
})
</script>

<style scoped>
.alert-center { font-size: 12px; color: var(--text-primary); }
.alert-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-subtle); margin-bottom: 8px; }
.alert-header h4 { margin: 0; font-size: 14px; color: var(--color-primary); }
.btn-manual { background: rgba(0,150,255,0.15); border: 1px solid rgba(0,150,255,0.3); color: var(--color-primary); padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; }

.alert-section { margin-bottom: 12px; }
.section-title { font-size: 12px; font-weight: 600; color: var(--text-secondary); padding: 4px 0; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.04); }
.empty-state { text-align: center; color: var(--text-dim); padding: 12px; }

.alert-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px; margin: 4px 0; border-radius: 4px; border-left: 3px solid; background: rgba(255,255,255,0.02); }
.pending-item { background: rgba(255,136,0,0.08); border-left-color: #ff8800; cursor: pointer; }
.alert-level { font-weight: 700; min-width: 24px; }
.alert-body { flex: 1; min-width: 0; }
.alert-body:hover { color: var(--color-primary); }
.alert-type { font-weight: 600; }
.alert-source { color: var(--text-dim); }
.alert-time { font-size: 10px; color: var(--text-dim); }
.alert-note { font-size: 10px; color: #ff8800; font-style: italic; margin-top: 2px; }
.alert-actions { display: flex; flex-direction: column; gap: 3px; align-items: flex-end; }
.btn-confirm { background: rgba(0,200,0,0.2); border: 1px solid rgba(0,200,0,0.4); color: #00ff88; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 10px; }
.btn-dispatch-manual { background: rgba(255,136,0,0.15); border: 1px solid rgba(255,136,0,0.3); color: #ffaa00; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 10px; }
.btn-dismiss { background: none; border: 1px solid rgba(255,255,255,0.15); color: #999; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 10px; }
.btn-dispatch { background: rgba(255,136,0,0.2); border: 1px solid rgba(255,136,0,0.4); color: #ff8800; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; }
.disposed-tag { font-size: 10px; color: #00ff88; }

.dispatch-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 3000; }
.dispatch-content { background: var(--bg-panel); border: 1px solid var(--border-active); border-radius: 12px; padding: 20px; width: 300px; }
.dispatch-content h4 { margin: 0 0 12px; color: var(--color-primary); }
.worker-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.worker-item { padding: 8px; background: rgba(0,150,255,0.08); border: 1px solid rgba(0,150,255,0.2); border-radius: 6px; cursor: pointer; text-align: center; }
.worker-item:hover { background: rgba(0,150,255,0.2); border-color: var(--color-primary); }
.form-row { margin-bottom: 8px; }
.form-row label { display: block; font-size: 10px; color: #aaa; margin-bottom: 2px; }
.form-row select, .form-row textarea { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,150,255,0.3); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
.form-row textarea { height: 50px; resize: vertical; }
.form-actions { display: flex; gap: 6px; justify-content: flex-end; margin-top: 12px; }
.btn-submit { background: rgba(255,136,0,0.3); border: 1px solid rgba(255,136,0,0.5); color: #fff; padding: 5px 12px; border-radius: 4px; cursor: pointer; }
.btn-cancel { background: none; border: 1px solid rgba(255,255,255,0.2); color: #aaa; padding: 5px 12px; border-radius: 4px; cursor: pointer; }
</style>
