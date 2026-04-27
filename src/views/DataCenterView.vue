<template>
  <div class="datacenter-panel">
    <div class="panel-header">
      <h3>📊 数据中台</h3>
      <span class="update-time">实时监控 · {{ currentTime }}</span>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">🏢</div>
        <div class="stat-value">{{ buildings.length }}</div>
        <div class="stat-label">建筑总量</div>
        <div class="stat-sub">覆盖武汉核心区</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📹</div>
        <div class="stat-value">{{ cameras.length }}</div>
        <div class="stat-label">IOT摄像头</div>
        <div class="stat-sub">在线率 {{ cameraOnlineRate }}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🚨</div>
        <div class="stat-value">{{ alertTotal }}</div>
        <div class="stat-label">今日警情</div>
        <div class="stat-sub">已处置 {{ alertDisposed }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-value">{{ workOrders.length }}</div>
        <div class="stat-label">工单总数</div>
        <div class="stat-sub">闭环率 {{ orderCloseRate }}%</div>
      </div>
    </div>

    <div class="chart-section">
      <h4>📈 近7日警情趋势</h4>
      <div class="bar-chart">
        <div v-for="bar in trendBars" :key="bar.day" class="bar-col">
          <div class="bar-value">{{ bar.count }}</div>
          <div class="bar-fill" :style="{ height: bar.height + '%' }"></div>
          <div class="bar-label">{{ bar.day }}</div>
        </div>
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
          <span>{{ wo.time }}</span>
        </div>
        <div v-if="!recentOrders.length" class="order-empty">暂无工单数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  buildings: { type: Array, default: () => [] },
  cameras: { type: Array, default: () => [] },
  workOrders: { type: Array, default: () => [] }
})

const currentTime = ref('')
let timer = null

onMounted(() => {
  const update = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
  }
  update()
  timer = setInterval(update, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const cameraOnlineRate = computed(() => {
  if (!props.cameras.length) return 100
  return Math.floor(Math.random() * 15 + 85)
})

const alertTotal = ref(Math.floor(Math.random() * 20 + 5))
const alertDisposed = ref(Math.floor(alertTotal.value * 0.7))

const orderCloseRate = computed(() => {
  if (!props.workOrders.length) return 100
  const closed = props.workOrders.filter(w => w.status === 'closed').length
  return Math.floor((closed / props.workOrders.length) * 100)
})

const trendBars = computed(() => {
  const days = ['周一','周二','周三','周四','周五','周六','周日']
  return days.map(day => {
    const count = Math.floor(Math.random() * 30 + 5)
    return { day, count, height: (count / 35) * 100 }
  })
})

const recentOrders = computed(() => {
  return props.workOrders.slice(-5).reverse().map(wo => ({
    ...wo,
    time: new Date().toLocaleDateString('zh-CN')
  }))
})

function statusLabel(s) {
  return s === 'processing' ? '处理中' : s === 'closed' ? '已关闭' : s
}
</script>

<style scoped>
.datacenter-panel {
  padding: 16px;
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.stat-card {
  background: rgba(0,150,255,0.05);
  border: 1px solid rgba(0,150,255,0.15);
  border-radius: 10px;
  padding: 14px;
  text-align: center;
  transition: all 0.2s;
}
.stat-card:hover {
  background: rgba(0,150,255,0.1);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}
.stat-icon { font-size: 24px; margin-bottom: 4px; }
.stat-value { font-size: 28px; font-weight: 700; color: var(--color-primary); }
.stat-label { font-size: 12px; color: var(--text-secondary); margin: 4px 0; }
.stat-sub { font-size: 10px; color: var(--text-dim); }

.chart-section {
  background: rgba(0,150,255,0.03);
  border: 1px solid rgba(0,150,255,0.1);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
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
  width: 40px;
}
.bar-value { font-size: 11px; color: var(--text-dim); margin-bottom: 4px; }
.bar-fill {
  width: 28px;
  background: linear-gradient(to top, #0066cc, #00e5ff);
  border-radius: 4px 4px 0 0;
  min-height: 8px;
  transition: height 0.6s;
}
.bar-label { font-size: 10px; color: var(--text-dim); margin-top: 6px; }

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
  grid-template-columns: 60px 1fr 60px 90px;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.order-row.header { color: var(--text-dim); font-weight: 600; }
.order-id { color: var(--color-primary); }
.status-processing { color: #ffaa00; }
.status-closed { color: #00ff88; }
.order-empty { text-align: center; padding: 20px; color: var(--text-dim); }
</style>
