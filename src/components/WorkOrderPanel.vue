<template>
  <div class="workorder-panel">
    <div class="wo-header">📋 工单中心</div>

    <div class="wo-filters">
      <div class="filter-group">
        <button v-for="lvl in ['全部','红','橙','黄','蓝']" :key="lvl"
          class="filter-btn" :class="{ active: currentLevel === lvl }"
          @click="currentLevel = lvl; currentPage = 1">{{ lvl === '全部' ? '全部' : '● '+lvl }}</button>
      </div>
      <div class="filter-group">
        <button :class="{ active: statusFilter === 'all' }" @click="statusFilter = 'all'; currentPage = 1">全部</button>
        <button :class="{ active: statusFilter === 'processing' }" @click="statusFilter = 'processing'; currentPage = 1">处理中</button>
        <button :class="{ active: statusFilter === 'closed' }" @click="statusFilter = 'closed'; currentPage = 1">已关闭</button>
      </div>
      <div class="page-size-selector">
        <span>每页</span>
        <select v-model.number="pageSize" @change="currentPage = 1">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="customSize">自定义</option>
        </select>
        <input
          v-if="pageSize === customSize"
          v-model.number="customSizeValue"
          type="number"
          min="1"
          max="50"
          class="custom-size-input"
          @change="onCustomSizeChange"
        />
        <span>条</span>
      </div>
    </div>

    <div class="wo-list" v-if="pagedOrders.length > 0">
      <div v-for="wo in pagedOrders" :key="wo.id" class="wo-item"
        :class="{ 'wo-closed': wo.status === 'closed' }"
        :style="{ borderLeftColor: wo.status === 'processing' ? '#FF8800' : '#4CAF50' }">
        <span class="wo-status">{{ wo.status === 'processing' ? '🔧' : '✅' }}</span>
        <div class="wo-body">
          <div class="wo-title">
            <span class="level-tag" :style="{ color: levelColor(wo.level) }">●</span>
            {{ wo.title }}
          </div>
          <div class="wo-meta">
            <span>{{ wo.createTime }}</span>
            <span>👤 {{ wo.assignee }}</span>
            <span class="wo-mode">{{ wo.assignMode }}</span>
            <span v-if="wo.status === 'processing'" class="wo-waiting">⏳ 处理中</span>
            <span v-else class="wo-done">✅ 已完成</span>
          </div>
          <div class="wo-description">{{ wo.description }}</div>
          <div v-if="wo.status === 'closed'" class="wo-close-detail">
            <div class="detail-title">📋 处理结果</div>
            <div>📸 现场照片：{{ wo.processImages?.join(', ') || '无' }}</div>
            <div>📝 处理说明：{{ wo.closeNote }}</div>
            <div>🕐 完成时间：{{ wo.closeTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">暂无匹配工单</div>

    <div class="wo-pagination" v-if="totalPages > 1">
      <button :disabled="currentPage === 1" @click="currentPage--">◀</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++">▶</button>
    </div>

    <div class="wo-summary">
      处理中 <strong>{{ stats.processing }}</strong> · 已关闭 <strong>{{ stats.closed }}</strong> · 总计 <strong>{{ orders.length }}</strong>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ orders: { type: Array, default: () => [] } })

const currentLevel = ref('全部')
const statusFilter = ref('all')
const pageSize = ref(5)
const customSize = ref(-1)
const customSizeValue = ref(5)
const currentPage = ref(1)

const LEVEL_COLORS = { '红': '#ff3333', '橙': '#ff8800', '黄': '#ffcc00', '蓝': '#4da6ff' }
function levelColor(lvl) { return LEVEL_COLORS[lvl] || '#999' }

const actualPageSize = computed(() => {
  return pageSize.value === customSize.value ? customSizeValue.value : pageSize.value
})

function onCustomSizeChange() {
  pageSize.value = customSize.value
  currentPage.value = 1
}

const filteredOrders = computed(() => {
  let list = props.orders
  if (currentLevel.value !== '全部') list = list.filter(wo => wo.level === currentLevel.value)
  if (statusFilter.value === 'processing') list = list.filter(wo => wo.status === 'processing')
  else if (statusFilter.value === 'closed') list = list.filter(wo => wo.status === 'closed')
  return list
})

const totalPages = computed(() =>
  Math.ceil(filteredOrders.value.length / actualPageSize.value) || 1
)

const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * actualPageSize.value
  return filteredOrders.value.slice(start, start + actualPageSize.value)
})

const stats = computed(() => ({
  processing: props.orders.filter(o => o.status === 'processing').length,
  closed: props.orders.filter(o => o.status === 'closed').length
}))
</script>

<style scoped>
.workorder-panel { font-size: 12px; color: var(--text-primary); }
.wo-header { padding: 8px 0; font-weight: 700; color: var(--color-primary); border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 8px; }
.wo-filters { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding: 6px 0; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.filter-group { display: flex; gap: 4px; }
.filter-btn, .filter-group button {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-dim); padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;
}
.filter-btn.active, .filter-group button.active {
  background: rgba(0,150,255,0.2); border-color: var(--color-primary); color: var(--color-primary);
}
.page-size-selector { margin-left: auto; display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--text-dim); }
.page-size-selector select {
  background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; padding: 2px 4px; border-radius: 3px; font-size: 10px;
}
.custom-size-input {
  width: 40px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; padding: 2px 4px; border-radius: 3px; font-size: 10px; text-align: center;
}
.empty-state { text-align: center; color: var(--text-dim); padding: 16px; }
.wo-list { max-height: 420px; overflow-y: auto; }
.wo-item { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; margin: 6px 0; border-radius: 4px; border-left: 3px solid; background: rgba(255,255,255,0.03); }
.wo-closed { opacity: 0.7; }
.wo-status { font-size: 16px; min-width: 24px; text-align: center; padding-top: 2px; }
.wo-body { flex: 1; min-width: 0; }
.wo-title { font-size: 12px; font-weight: 600; }
.level-tag { margin-right: 4px; }
.wo-meta { font-size: 10px; color: var(--text-dim); display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
.wo-mode { color: #ff8800; font-weight: 600; }
.wo-waiting { color: #ffaa00; }
.wo-done { color: #00ff88; }
.wo-description { font-size: 10px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4; }
.wo-close-detail { margin-top: 8px; padding: 8px 10px; background: rgba(0,255,136,0.06); border: 1px solid rgba(0,255,136,0.15); border-radius: 6px; font-size: 10px; color: var(--text-secondary); line-height: 1.8; }
.detail-title { font-weight: 600; color: #00ff88; margin-bottom: 4px; }
.wo-pagination { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 8px 0; font-size: 11px; color: var(--text-dim); }
.wo-pagination button { background: rgba(0,150,255,0.1); border: 1px solid rgba(0,150,255,0.2); color: var(--color-primary); padding: 3px 10px; border-radius: 4px; cursor: pointer; }
.wo-pagination button:disabled { opacity: 0.3; cursor: default; }
.wo-summary { margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 10px; color: var(--text-secondary); text-align: center; }
</style>
