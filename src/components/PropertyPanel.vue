<template>
  <div class="property-panel" :class="{ active: !!building }">
    <div class="panel-header">
      <span class="panel-title">{{ building?.name || '建筑属性' }}</span>
      <button class="panel-close" @click="$emit('close')">✕</button>
    </div>
    <div class="panel-body" v-if="building">
      <!-- 基础属性 -->
      <div class="prop-row"><span>名称</span><span>{{ building.name }}</span></div>
      <div class="prop-row"><span>层数</span><span>{{ building.levels }} 层</span></div>
      <div class="prop-row"><span>高度</span><span>{{ building.height }} m</span></div>
      <div class="prop-row"><span>结构类型</span><span>{{ building.structure || '框架-剪力墙' }}</span></div>
      <div class="prop-row"><span>建筑用途</span><span>{{ building.usage || '商住综合' }}</span></div>
      <div class="prop-row"><span>竣工年份</span><span>{{ building.year || '2019' }}</span></div>
      <div class="prop-row"><span>总户数</span><span>{{ building.totalUnits || building.levels * 4 }}</span></div>

      <!-- 楼层折叠列表 -->
      <div class="tree-section">
        <div class="tree-title" @click="floorCollapsed = !floorCollapsed">
          {{ floorCollapsed ? '▸' : '▾' }} 📐 楼层 · 户数
        </div>
        <div v-if="!floorCollapsed" class="tree-body">
          <div v-for="floor in building.levels" :key="floor" class="tree-floor">
            <div class="tree-floor-label"
                 :class="{ active: building.selectedFloor === floor }"
                 @click="handleFloorClick(floor)">
              ▸ 第 {{ floor }} 层
            </div>
            <!-- 选中楼层时展开户数列表 -->
            <div v-if="building.selectedFloor === floor" class="tree-units">
              <div
                v-for="unit in 4"
                :key="unit"
                class="tree-unit"
                :class="{ active: building.selectedUnit === unit }"
                @click.stop="$emit('selectUnit', unit)"
              >
                · 户 {{ unit }}
                <span class="unit-info">{{ getUnitInfo(floor, unit) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-body panel-empty" v-else>
      <p>点击建筑查看详情</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ building: { type: Object, default: null } })
const emit = defineEmits(['close', 'selectFloor', 'selectUnit'])

const floorCollapsed = ref(false)

function handleFloorClick(floor) {
  emit('selectFloor', floor)
}

function getUnitInfo(floor, unit) {
  const owners = ['张三', '李四', '王五', '赵六']
  const areas = [85, 92, 108, 120]
  const types = ['住宅', '商业', '办公', '住宅']
  const idx = (floor * unit) % 4
  return `${areas[idx]}㎡ · ${types[idx]} · ${owners[idx]}`
}
</script>

<style scoped>
.property-panel {
  position: fixed;
  top: 60px;
  right: -360px;
  width: 300px;
  max-height: calc(100vh - 100px);
  background: var(--bg-panel);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-active);
  border-radius: 10px 0 0 10px;
  color: var(--text-primary);
  z-index: 1000;
  transition: right 0.3s;
  overflow-y: auto;
  font-size: 13px;
}
.property-panel.active { right: 0; }
.panel-header {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,150,255,0.2);
}
.panel-title { font-weight: 600; color: var(--color-primary); }
.panel-close {
  background: none;
  border: 1px solid rgba(0,150,255,0.4);
  color: #7fb8e0;
  border-radius: 4px;
  cursor: pointer;
  width: 24px;
  height: 24px;
}
.panel-body { padding: 12px 16px; }

.prop-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 12px;
}
.prop-row span:first-child { color: var(--text-secondary); }
.prop-row span:last-child { color: var(--text-primary); }

.tree-section {
  margin-top: 12px;
  border-top: 1px solid rgba(0,150,255,0.2);
  padding-top: 8px;
}
.tree-title {
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 0;
  user-select: none;
}
.tree-title:hover { color: var(--color-primary); }
.tree-body { padding-left: 4px; }

.tree-floor { margin: 2px 0; }
.tree-floor-label {
  padding: 5px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  color: #a0bcd0;
}
.tree-floor-label:hover { background: rgba(0,150,255,0.2); color: #fff; }
.tree-floor-label.active { background: rgba(0,150,255,0.3); color: #fff; font-weight: 600; }

.tree-units { padding-left: 16px; margin: 2px 0; }
.tree-unit {
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  color: #8ea8c8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tree-unit:hover { background: rgba(0,255,136,0.15); color: #fff; }
.tree-unit.active { background: rgba(0,255,136,0.25); color: #00ff88; font-weight: 600; }
.unit-info { font-size: 10px; color: var(--text-dim); }

.panel-empty { text-align: center; padding: 30px; color: var(--text-dim); }
</style>
