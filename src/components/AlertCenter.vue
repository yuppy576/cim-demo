<template>
  <div class="alert-center">
    <!-- 顶部数据看板 -->
    <div class="alert-stats">
      <div class="stat-item">
        <span class="stat-value text-red">{{ alerts.length }}</span>
        <span class="stat-label">事故险数量</span>
      </div>
      <div class="stat-item">
        <span class="stat-value text-orange">{{ urgentCount }}</span>
        <span class="stat-label">紧急待处理</span>
      </div>
      <div class="stat-item">
        <span class="stat-value text-green">{{ disposed.length }}</span>
        <span class="stat-label">已处置</span>
      </div>
    </div>

    <!-- 活跃告警列表 -->
    <div class="alert-header">🚨 实时预警</div>
    <div class="alert-list">
      <div v-if="alerts.length === 0" class="empty-state">暂无活跃告警</div>
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-card"
        :style="{ borderLeftColor: getColor(alert.level) }"
      >
        <div class="alert-top">
          <span class="alert-level" :style="{ background: getColor(alert.level) }">{{ alert.level }}</span>
          <span class="alert-type">{{ alert.type }}</span>
          <span class="alert-time">{{ alert.time }}</span>
        </div>
        <div class="alert-bottom">
          <span class="alert-source" @click="$emit('locate-camera', alert)" title="点击定位摄像头">📹 {{ alert.cameraName }}</span>
          <div class="alert-actions">
            <button class="btn-detail" @click="$emit('locate-camera', alert)">可视预警</button>
            <button class="btn-dispatch" @click="handleDispose(alert)">接警</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 已处置列表 -->
    <div class="disposed-section" v-if="disposed.length > 0">
      <div class="section-title">✅ 已处置 ({{ disposed.length }})</div>
      <div v-for="d in disposed" :key="d.id" class="disposed-item">
        <span class="disposed-type">{{ d.type }}</span>
        <span class="disposed-time">{{ d.time }}</span>
        <span class="disposed-status">已关闭</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import eventBus from '../utils/eventBus.js'

const ALERT_TYPES = [
  '暴雨', '雷电', '大风', '冰雹', '高温',
  '暴雪', '大雾', '道路结冰', '地质灾害', '森林火险',
  '人群聚集', '车辆违停', '异常闯入', '烟雾检测', '设备故障'
]
const CAMERA_NAMES = [
  '东宝区主干道A', '东宝区主干道B', '象山大道入口', '长宁大道中段',
  '泉口路交叉口', '金龙泉大道北', '白云大道南段', '海慧路交叉口',
  '深圳大道西段', '培公大道东段', '关公大道转盘', '漳河大道入口'
]
const LEVELS = ['蓝', '黄', '橙', '红']
const COLORS = { '蓝': '#4da6ff', '黄': '#ffcc00', '橙': '#ff8800', '红': '#ff3333' }
const LEVEL_ORDER = { '红': 4, '橙': 3, '黄': 2, '蓝': 1 }

const alerts = ref([])
const disposed = ref([])
let timer = null
let isDispatching = false

const randomAlert = () => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
  type: ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)],
  level: LEVELS[Math.floor(Math.random() * 4)],
  time: new Date().toLocaleTimeString('zh-CN'),
  cameraName: CAMERA_NAMES[Math.floor(Math.random() * CAMERA_NAMES.length)],
  pos: [112.201 + (Math.random() - 0.5) * 0.02, 31.041 + (Math.random() - 0.5) * 0.02]
})

const getColor = (lvl) => COLORS[lvl] || '#999'
const urgentCount = computed(() => alerts.value.filter(a => a.level === '红' || a.level === '橙').length)

const handleDispose = (alert) => {
  alerts.value = alerts.value.filter(a => a.id !== alert.id)
  disposed.value.unshift({ ...alert })
  if (disposed.value.length > 20) disposed.value.pop()
  setTimeout(() => { disposed.value = disposed.value.filter(d => d.id !== alert.id) }, 5000)
  eventBus.emit('alert:disposed', alert.id)
  eventBus.emit('workorder:dispatch', alert)
}

const autoDispatch = () => {
  if (isDispatching) return
  const urgent = alerts.value.filter(a => a.level === '红' || a.level === '橙')
  if (!urgent.length) return
  isDispatching = true
  const sorted = [...urgent].sort((a, b) => (LEVEL_ORDER[b.level] || 0) - (LEVEL_ORDER[a.level] || 0))
  sorted.slice(0, 2).forEach(handleDispose)
  setTimeout(() => { isDispatching = false }, 0)
}

watch(() => alerts.value.length, autoDispatch)

onMounted(() => {
  alerts.value.push(randomAlert(), randomAlert(), randomAlert())
  timer = setInterval(() => {
    const newAlert = randomAlert()
    alerts.value.unshift(newAlert)
    if (alerts.value.length > 10) alerts.value.pop()
    eventBus.emit('alert:new', newAlert)
  }, 15000)
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.alert-center { font-size: 12px; color: var(--text-primary); }
.alert-stats { display: flex; gap: 8px; margin-bottom: 16px; }
.alert-stats .stat-item {
  flex: 1; background: rgba(0,20,40,0.6); border: 1px solid rgba(0,150,255,0.2);
  border-radius: 6px; padding: 8px; text-align: center;
}
.alert-stats .stat-value { font-size: 18px; font-weight: 700; display: block; }
.alert-stats .stat-label { font-size: 10px; color: var(--text-secondary); margin-top: 4px; }
.text-red { color: #ff3333; } .text-orange { color: #ff8800; } .text-green { color: #4caf50; }

.alert-header { padding: 8px 0; font-weight: 700; color: #ff6b6b; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 8px; }
.alert-list { max-height: 350px; overflow-y: auto; }
.empty-state { text-align: center; color: var(--text-dim); padding: 16px; }

.alert-card {
  background: rgba(255,255,255,0.03); border-left: 3px solid;
  border-radius: 6px; padding: 10px; margin-bottom: 8px;
}
.alert-top { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.alert-level { padding: 2px 6px; border-radius: 3px; font-size: 10px; color: #fff; font-weight: 700; }
.alert-type { font-weight: 600; font-size: 13px; }
.alert-time { margin-left: auto; font-size: 10px; color: var(--text-dim); }
.alert-bottom { display: flex; justify-content: space-between; align-items: center; }
.alert-source { font-size: 11px; color: var(--color-primary); cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.alert-source:hover { color: #80c8ff; }
.alert-actions { display: flex; gap: 6px; }
.btn-detail {
  background: rgba(0,150,255,0.2); border: 1px solid rgba(0,150,255,0.4);
  color: var(--color-primary); padding: 4px 10px; border-radius: 4px;
  font-size: 10px; cursor: pointer;
}
.btn-dispatch {
  background: rgba(255,136,0,0.2); border: 1px solid rgba(255,136,0,0.4);
  color: #ff8800; padding: 4px 10px; border-radius: 4px;
  font-size: 10px; cursor: pointer; white-space: nowrap;
}
.btn-detail:hover { background: rgba(0,150,255,0.4); color: #fff; }
.btn-dispatch:hover { background: rgba(255,136,0,0.4); color: #fff; }

.disposed-section { margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px; }
.section-title { color: #4caf50; font-size: 12px; font-weight: 600; margin-bottom: 6px; }
.disposed-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 11px; color: var(--text-secondary); }
.disposed-type { color: #a0bcd0; }
.disposed-time { color: var(--text-dim); flex: 1; }
.disposed-status { color: #4caf50; font-weight: 600; }
</style>
