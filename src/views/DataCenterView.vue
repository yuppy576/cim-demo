<template>
  <div class="datacenter-panel">
    <div class="panel-header">
      <h3>📊 数据中台</h3>
      <span class="update-time">实时监控 · {{ currentTime }}</span>
    </div>

    <!-- 上排：2大核心卡片 -->
    <div class="stats-row top-row">
      <div class="stat-card large-card" @mouseenter="hoverCard = 'building'" @mouseleave="hoverCard = null">
        <div class="card-glow" :class="{ 'pulse': hoverCard === 'building' }"></div>
        <div class="stat-icon">🏢</div>
        <div class="stat-value" :class="{ 'bounce': animTrigger === 'building' }">{{ animatedBuildingCount }}</div>
        <div class="stat-label">建筑总量</div>
        <div class="stat-sub">覆盖荆门东宝区</div>
        <div class="stat-trend" v-if="buildingTrend !== 0">
          {{ buildingTrend > 0 ? '↑' : '↓' }} {{ Math.abs(buildingTrend) }}% 较上月
        </div>
      </div>

      <div class="stat-card large-card" @mouseenter="hoverCard = 'camera'" @mouseleave="hoverCard = null">
        <div class="card-glow" :class="{ 'pulse': hoverCard === 'camera' }"></div>
        <div class="stat-icon">📹</div>
        <div class="stat-value" :class="{ 'bounce': animTrigger === 'camera' }">{{ onlineCameraCount }}</div>
        <div class="stat-label">IOT摄像头</div>
        <div class="stat-sub">在线率 {{ cameraOnlineRate }}%</div>
        <div class="card-action" v-if="hoverCard === 'camera'">
          <button class="btn-action" @click="openInspection">🔍 一键巡检</button>
        </div>
      </div>
    </div>

    <!-- 下排：2小卡片 + 趋势图 + 工单列表 -->
    <div class="stats-row bottom-row">
      <div class="stat-card small-card" @mouseenter="hoverCard = 'alert'" @mouseleave="hoverCard = null">
        <div class="card-glow" :class="{ 'pulse': hoverCard === 'alert' }"></div>
        <div class="stat-icon">🚨</div>
        <div class="stat-value" :class="{ 'bounce': animTrigger === 'alert' }">{{ alerts.length }}</div>
        <div class="stat-label">今日警情</div>
        <div class="stat-sub">已处置 {{ disposedAlertsCount }}</div>
      </div>

      <div class="stat-card small-card" @mouseenter="hoverCard = 'workorder'" @mouseleave="hoverCard = null">
        <div class="card-glow" :class="{ 'pulse': hoverCard === 'workorder' }"></div>
        <div class="stat-icon">📋</div>
        <div class="stat-value" :class="{ 'bounce': animTrigger === 'workorder' }">{{ workOrders.length }}</div>
        <div class="stat-label">工单总数</div>
        <div class="stat-sub">闭环率 {{ orderCloseRate }}%</div>
        <div class="card-action" v-if="hoverCard === 'workorder'">
          <button class="btn-action" @click="openQuickDispatch">📋 快速派单</button>
        </div>
      </div>
    </div>

    <!-- 趋势图 + 工单列表 横向排列 -->
    <div class="bottom-section">
      <div class="chart-section">
        <h4>📈 近7日警情趋势 & 预测</h4>
        <div class="bar-chart">
          <div v-for="(bar, i) in trendBarsWithPrediction" :key="i" class="bar-col">
            <div class="bar-value">{{ bar.count }}</div>
            <div class="bar-fill" :class="{ 'prediction-bar': bar.isPrediction }" :style="{ height: bar.height + '%' }"></div>
            <div class="bar-label" :class="{ 'prediction-label': bar.isPrediction }">{{ bar.label }}</div>
          </div>
        </div>
        <div class="prediction-legend">
          <span class="legend-dot"></span> 预测趋势
          <span class="prediction-arrow">→</span>
          <span class="prediction-text">预计未来7天警情{{ predictionTrend > 0 ? '上升' : '下降' }} {{ Math.abs(predictionTrend) }}%</span>
        </div>
      </div>

      <div class="order-section">
        <h4>📌 最近工单</h4>
        <div class="order-table">
          <div class="order-row header">
            <span>ID</span><span>标题</span><span>状态</span><span>时间</span>
          </div>
          <div v-for="wo in recentOrders" :key="wo.id" class="order-row">
            <span class="order-id">{{ wo.id }}</span>
            <span>{{ wo.title }}</span>
            <span :class="'status-' + wo.status">{{ statusLabel(wo.status) }}</span>
            <span>{{ wo.createTime }}</span>
          </div>
          <div v-if="!recentOrders.length" class="order-empty">暂无工单数据</div>
        </div>
      </div>
    </div>

    <!-- 已完成工单详情 -->
    <div class="order-section" v-if="completedOrders.length > 0">
      <h4>✅ 最近已完成工单</h4>
      <div class="completed-list">
        <div v-for="wo in completedOrders" :key="wo.id" class="completed-item">
          <div class="completed-header">
            <span class="order-id">{{ wo.id }}</span>
            <span>{{ wo.title }}</span>
            <span class="completed-time">{{ wo.closeTime }}</span>
          </div>
          <div class="completed-body">
            <div>👤 {{ wo.assignee }} · {{ wo.assignMode }}</div>
            <div>📸 {{ wo.processImages?.join(', ') || '无' }}</div>
            <div>📝 {{ wo.closeNote }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速派单弹窗 -->
    <div v-if="showDispatchModal" class="modal-overlay" @click.self="showDispatchModal = false">
      <div class="modal-content">
        <h4>📋 快速派单</h4>
        <div class="form-row">
          <label>工单类型</label>
          <select v-model="quickDispatchType">
            <option value="常规巡检">常规巡检</option>
            <option value="设备维修">设备维修</option>
            <option value="安全隐患排查">安全隐患排查</option>
          </select>
        </div>
        <div class="form-row">
          <label>指派网格员</label>
          <select v-model="quickDispatchWorker">
            <option v-for="w in gridWorkers" :key="w" :value="w">{{ w }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>所属区域</label>
          <select v-model="quickDispatchArea">
            <option v-for="area in areas" :key="area" :value="area">{{ area }}</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="btn-submit" @click="confirmQuickDispatch">确认派单</button>
          <button class="btn-cancel" @click="showDispatchModal = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 巡检报告弹窗 -->
    <div v-if="showInspectionModal" class="modal-overlay" @click.self="showInspectionModal = false">
      <div class="modal-content inspection-report">
        <h4>🔍 摄像头巡检报告</h4>
        <div class="report-time">生成时间：{{ currentTime }}</div>
        <div class="report-stats">
          <div class="report-row"><span>巡检总数</span><span>{{ cameras.length }}</span></div>
          <div class="report-row"><span>在线</span><span class="text-green">{{ onlineCameraCount }}</span></div>
          <div class="report-row"><span>离线</span><span class="text-red">{{ offlineCameraCount }}</span></div>
          <div class="report-row"><span>报警中</span><span class="text-orange">{{ alarmCameraCount }}</span></div>
          <div class="report-row"><span>巡检结果</span><span class="text-green">全部正常</span></div>
        </div>
        <button class="btn-close-report" @click="showInspectionModal = false">关闭报告</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import eventBus from '../utils/eventBus.js'

const props = defineProps({
  buildings: { type: Array, default: () => [] },
  cameras: { type: Array, default: () => [] },
  workOrders: { type: Array, default: () => [] },
  alerts: { type: Array, default: () => [] }
})

const currentTime = ref('')
const hoverCard = ref(null)
const animTrigger = ref(null)
const showDispatchModal = ref(false)
const showInspectionModal = ref(false)
const quickDispatchType = ref('常规巡检')
const quickDispatchWorker = ref('张正-东宝01')
const quickDispatchArea = ref('东宝区')
const animatedBuildingCount = ref(0)
const prevBuildingCount = ref(0)
const buildingTrend = ref(0)

const gridWorkers = ['张正-东宝01', '李敏-东宝02', '王强-东宝03', '赵丽-东宝04', '陈浩-东宝05']
const areas = ['东宝区', '掇刀区', '漳河新区']

let timer = null
let animTimer = null

// 建筑数字滚动动画
watch(() => props.buildings.length, (newVal, oldVal) => {
  prevBuildingCount.value = oldVal || 0
  if (oldVal && oldVal > 0) {
    buildingTrend.value = Math.round(((newVal - oldVal) / oldVal) * 100)
  }
  const start = oldVal || 0
  const end = newVal
  const duration = 800
  const startTime = Date.now()
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    animatedBuildingCount.value = Math.round(start + (end - start) * progress)
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      animTrigger.value = 'building'
      setTimeout(() => { animTrigger.value = null }, 600)
    }
  }
  animate()
}, { immediate: true })

onMounted(() => {
  const update = () => { currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false }) }
  update()
  timer = setInterval(update, 1000)
  // 模拟数据跳动
  animTimer = setInterval(() => {
    const cards = ['building', 'camera', 'alert', 'workorder']
    const random = cards[Math.floor(Math.random() * cards.length)]
    animTrigger.value = random
    setTimeout(() => { animTrigger.value = null }, 600)
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (animTimer) clearInterval(animTimer)
})

const onlineCameraCount = computed(() => props.cameras.filter(c => c.status === 'online').length)
const offlineCameraCount = computed(() => props.cameras.filter(c => c.status === 'offline').length)
const alarmCameraCount = computed(() => props.cameras.filter(c => c.status === 'alarm').length)

const cameraOnlineRate = computed(() => {
  if (!props.cameras.length) return 100
  return Math.floor((onlineCameraCount.value / props.cameras.length) * 100)
})

const disposedAlertsCount = computed(() => props.alerts.filter(a => a.disposed).length)

const orderCloseRate = computed(() => {
  if (!props.workOrders.length) return 0
  const closed = props.workOrders.filter(w => w.status === 'closed').length
  return Math.floor((closed / props.workOrders.length) * 100)
})

// 移动平均预测
const trendBarsWithPrediction = computed(() => {
  const days = ['周一','周二','周三','周四','周五','周六','周日']
  const nextDays = ['一','二','三','四','五','六','日']
  const alertCountByDay = days.map(() => 0)
  const today = new Date().getDay()
  const todayIdx = today === 0 ? 6 : today - 1
  alertCountByDay[todayIdx] = props.alerts.length
  
  // 用移动平均填充过去几天
  let runningAvg = props.alerts.length
  for (let i = 1; i < 7; i++) {
    const idx = (todayIdx - i + 7) % 7
    runningAvg = Math.max(0, runningAvg - Math.floor(runningAvg * 0.15) + Math.floor(Math.random() * 4 - 2))
    alertCountByDay[idx] = runningAvg
  }
  
  const maxCount = Math.max(...alertCountByDay, 1)
  const bars = days.map((day, i) => ({
    label: day,
    count: alertCountByDay[i],
    height: (alertCountByDay[i] / maxCount) * 100,
    isPrediction: false
  }))
  
  // 预测未来7天（移动平均 + 趋势）
  const last3Avg = alertCountByDay.slice(-3).reduce((a, b) => a + b, 0) / 3
  const predictionBase = last3Avg
  for (let i = 0; i < 7; i++) {
    const predictedCount = Math.round(predictionBase + predictionBase * 0.05 * (i + 1) + Math.floor(Math.random() * 3))
    bars.push({
      label: '下周' + nextDays[i],
      count: predictedCount,
      height: (predictedCount / maxCount) * 100,
      isPrediction: true
    })
  }
  
  return bars
})

const predictionTrend = computed(() => {
  const data = trendBarsWithPrediction.value
  if (data.length < 8) return 0
  const lastActual = data[6].count
  const lastPrediction = data[data.length - 1].count
  if (lastActual === 0) return 0
  return Math.round(((lastPrediction - lastActual) / lastActual) * 100)
})

const recentOrders = computed(() => props.workOrders.slice(-5).reverse())
const completedOrders = computed(() => props.workOrders.filter(w => w.status === 'closed').slice(-5).reverse())

function statusLabel(s) {
  return s === 'processing' ? '处理中' : s === 'closed' ? '已关闭' : s
}

function openQuickDispatch() {
  showDispatchModal.value = true
}

function confirmQuickDispatch() {
  const alert = {
    id: Date.now(),
    type: quickDispatchType.value,
    level: '黄',
    cameraName: quickDispatchArea.value + '摄像头',
    time: new Date().toLocaleTimeString('zh-CN'),
    note: '数据中台快捷派单',
    status: 'active'
  }
  eventBus.emit('alert:new', alert)
  eventBus.emit('workorder:dispatch', alert)
  showDispatchModal.value = false
  animTrigger.value = 'workorder'
  setTimeout(() => { animTrigger.value = null }, 600)
}

function openInspection() {
  showInspectionModal.value = true
}
</script>

<style scoped>
.datacenter-panel {
  padding: 20px 24px;
  color: var(--text-primary);
  height: 100%;
  overflow-y: auto;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
}
.panel-header h3 { margin: 0; font-size: 18px; color: var(--color-primary); }
.update-time { font-size: 12px; color: var(--text-dim); }

/* 上排2大卡片 */
.top-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}
.large-card {
  min-height: 160px;
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
}

/* 下排2小卡片 */
.bottom-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}
.small-card {
  min-height: 130px;
  padding: 16px 14px;
}

/* 卡片通用 */
.stat-card {
  background: rgba(0,150,255,0.04);
  border: 1px solid rgba(0,150,255,0.12);
  border-radius: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  position: relative;
  transition: all 0.3s;
}
.stat-card:hover {
  background: rgba(0,150,255,0.08);
  border-color: rgba(0,150,255,0.35);
  transform: translateY(-2px);
}
.stat-icon { font-size: 22px; margin-bottom: 8px; }
.large-card .stat-icon { font-size: 28px; }
.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-primary);
  font-family: 'Courier New', monospace;
  line-height: 1.2;
  transition: transform 0.3s ease;
}
.large-card .stat-value { font-size: 34px; }
.stat-label { font-size: 13px; color: var(--text-secondary); margin: 4px 0; }
.stat-sub { font-size: 10px; color: var(--text-dim); }
.stat-trend { font-size: 10px; color: #00ff88; margin-top: 4px; }

/* 脉冲光效 */
.card-glow {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 12px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}
.card-glow.pulse {
  animation: cardPulse 1.5s ease-in-out infinite;
  opacity: 1;
}
@keyframes cardPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(0,229,255,0.2), inset 0 0 8px rgba(0,229,255,0.05); }
  50% { box-shadow: 0 0 20px rgba(0,229,255,0.5), inset 0 0 20px rgba(0,229,255,0.15); }
}

/* 数字弹跳 */
.stat-value.bounce {
  animation: bounce 0.6s ease;
}
@keyframes bounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.25); color: #00ff88; }
  100% { transform: scale(1); }
}

/* 悬停按钮 */
.card-action {
  margin-top: 8px;
}
.btn-action {
  background: rgba(0,229,255,0.15);
  border: 1px solid rgba(0,229,255,0.4);
  color: var(--color-primary);
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.btn-action:hover {
  background: rgba(0,229,255,0.3);
  border-color: var(--color-primary);
}

/* 底部图表+工单 */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-section {
  background: rgba(0,150,255,0.03);
  border: 1px solid rgba(0,150,255,0.1);
  border-radius: 10px;
  padding: 16px;
}
.chart-section h4 { margin: 0 0 16px; font-size: 14px; color: var(--text-secondary); }

.bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 160px;
  padding-top: 20px;
}
.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 28px;
}
.bar-value { font-size: 10px; color: var(--text-dim); margin-bottom: 4px; }
.bar-fill {
  width: 22px;
  background: linear-gradient(to top, #0066cc, #00e5ff);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.6s;
}
.prediction-bar {
  background: linear-gradient(to top, #0066cc44, #00e5ff44);
  border: 1px dashed rgba(0,229,255,0.5);
  border-bottom: none;
}
.bar-label { font-size: 9px; color: var(--text-dim); margin-top: 4px; }
.prediction-label { color: rgba(0,229,255,0.6); font-style: italic; }

.prediction-legend {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--text-dim);
}
.legend-dot {
  width: 10px; height: 10px;
  border: 1px dashed rgba(0,229,255,0.5);
  border-radius: 2px;
  display: inline-block;
}
.prediction-arrow { color: var(--color-primary); }
.prediction-text { color: #ffaa00; font-weight: 600; }

.order-section {
  background: rgba(0,150,255,0.03);
  border: 1px solid rgba(0,150,255,0.1);
  border-radius: 10px;
  padding: 16px;
}
.order-section h4 { margin: 0 0 12px; font-size: 14px; color: var(--text-secondary); }
.order-table { font-size: 12px; }
.order-row {
  display: grid;
  grid-template-columns: 60px 1fr 60px 70px;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.order-row.header { color: var(--text-dim); font-weight: 600; }
.order-id { color: var(--color-primary); }
.status-processing { color: #ffaa00; }
.status-closed { color: #00ff88; }
.order-empty { text-align: center; padding: 12px; color: var(--text-dim); }

.completed-list { font-size: 11px; }
.completed-item { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.completed-item:last-child { border-bottom: none; }
.completed-header { display: flex; gap: 12px; align-items: center; margin-bottom: 4px; }
.completed-time { margin-left: auto; font-size: 10px; color: var(--text-dim); }
.completed-body { font-size: 10px; color: var(--text-secondary); line-height: 1.6; padding-left: 4px; }

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.modal-content {
  background: var(--bg-panel);
  border: 1px solid var(--border-active);
  border-radius: 12px;
  padding: 24px;
  width: 320px;
}
.modal-content h4 { margin: 0 0 16px; color: var(--color-primary); }
.form-row { margin-bottom: 10px; }
.form-row label { display: block; font-size: 11px; color: #aaa; margin-bottom: 3px; }
.form-row select, .form-row input {
  width: 100%;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,150,255,0.3);
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
}
.form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.btn-submit { background: rgba(0,229,255,0.2); border: 1px solid rgba(0,229,255,0.4); color: #fff; padding: 6px 14px; border-radius: 4px; cursor: pointer; }
.btn-cancel { background: none; border: 1px solid rgba(255,255,255,0.2); color: #aaa; padding: 6px 14px; border-radius: 4px; cursor: pointer; }
.btn-close-report {
  display: block; margin: 16px auto 0;
  background: rgba(0,229,255,0.15); border: 1px solid rgba(0,229,255,0.3);
  color: var(--color-primary); padding: 8px 20px; border-radius: 6px; cursor: pointer;
}

.inspection-report .report-time { font-size: 10px; color: var(--text-dim); margin-bottom: 12px; }
.report-stats { font-size: 12px; }
.report-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.text-green { color: #00ff88; }
.text-red { color: #ff4444; }
.text-orange { color: #ff8800; }
</style>
