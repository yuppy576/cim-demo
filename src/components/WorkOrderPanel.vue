<template>
  <div class="workorder-panel">
    <div class="wo-header">📋 工单中心</div>

    <!-- 工单列表 -->
    <div class="wo-list" v-if="orders.length > 0">
      <div
        v-for="wo in orders"
        :key="wo.id"
        class="wo-item"
        :class="{ 'wo-closed': wo.status === 'closed' }"
        :style="{ borderLeftColor: wo.status === 'processing' ? '#FF8800' : '#4CAF50' }"
      >
        <span class="wo-status">{{ wo.status === 'processing' ? '🔧' : '✅' }}</span>
        <div class="wo-body">
          <div class="wo-title">{{ wo.title }}</div>
          <div class="wo-meta">
            <span>{{ wo.createTime }}</span>
            <span>{{ wo.assignee }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">暂无工单</div>

    <!-- 已关闭计数 -->
    <div class="wo-summary" v-if="closedCount > 0">
      已自动关闭 <strong>{{ closedCount }}</strong> 条工单
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  orders: { type: Array, default: () => [] }
})

const closedCount = computed(() => props.orders.filter(o => o.status === 'closed').length)
</script>

<style scoped>
.workorder-panel { font-size: 12px; color: var(--text-primary); }
.wo-header {
  padding: 8px 0;
  font-weight: 700;
  color: var(--color-primary);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 8px;
}
.empty-state { text-align: center; color: var(--text-dim); padding: 16px; }
.wo-list { max-height: 400px; overflow-y: auto; }
.wo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin: 4px 0;
  border-radius: 4px;
  border-left: 3px solid;
  background: rgba(255,255,255,0.03);
  transition: opacity 0.5s;
}
.wo-closed { opacity: 0.6; }
.wo-status { font-size: 16px; min-width: 24px; text-align: center; }
.wo-body { flex: 1; min-width: 0; }
.wo-title {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wo-meta {
  font-size: 10px;
  color: var(--text-dim);
  display: flex;
  gap: 8px;
  margin-top: 2px;
}
.wo-summary {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.06);
  font-size: 10px;
  color: var(--text-secondary);
  text-align: center;
}
</style>
