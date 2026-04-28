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

      <div class="data-mapping">
        <div class="mapping-title">📋 数据映射</div>
        <div class="mapping-flow">
          <span class="mapping-item">幢表</span><span class="mapping-arrow">→</span>
          <span class="mapping-item">层表</span><span class="mapping-arrow">→</span>
          <span class="mapping-item">户表</span><span class="mapping-arrow">→</span>
          <span class="mapping-item">权利人表</span>
        </div>
        <div class="mapping-desc">统一编码合成：一幢 · 一户 · 一权利人</div>
      </div>

      <!-- 楼层分组列表 -->
      <div class="tree-section">
        <div class="tree-title" @click="floorCollapsed = !floorCollapsed">
          {{ floorCollapsed ? '▸' : '▾' }} 📐 楼层 · 户数
        </div>
        <div v-if="!floorCollapsed" class="tree-body">
          <div v-for="group in floorGroups" :key="group.label" class="floor-group">
            <div class="group-label" @click="toggleGroup(group.start)">
              {{ group.expanded ? '▾' : '▸' }} {{ group.label }}
            </div>
            <div v-if="group.expanded" class="group-floors">
              <div v-for="floor in group.floors" :key="floor" class="tree-floor">
                <div class="tree-floor-label"
                     :class="{ active: building.selectedFloor === floor }"
                     @click="handleFloorClick(floor)">
                  ▸ 第 {{ floor }} 层
                </div>
                <div v-if="building.selectedFloor === floor" class="tree-units">
                  <div v-for="unit in 4" :key="unit" class="tree-unit"
                       :class="{ active: building.selectedUnit === unit }"
                       @click.stop="handleUnitClick(unit)">
                    <div class="unit-main">
                      <span class="unit-id">· 户 {{ unit }}</span>
                      <span class="unit-owner">👤 {{ getUnitOwner(floor, unit) }}</span>
                    </div>
                    <div class="unit-detail">{{ getUnitDetail(floor, unit) }}</div>
                    <!-- 户完整属性行 -->
                    <div class="unit-props">
                      <div class="unit-prop"><span>面积</span><span>{{ getUnitArea(floor, unit) }}㎡</span></div>
                      <div class="unit-prop"><span>户型</span><span>{{ getUnitType(floor, unit) }}</span></div>
                      <div class="unit-prop"><span>权属</span><span :class="getUnitStatus(floor, unit) === '权属清晰' ? 'status-normal' : 'status-alert'">{{ getUnitStatus(floor, unit) }}</span></div>
                      <div class="unit-prop"><span>登记日期</span><span>{{ getUnitDate(floor, unit) }}</span></div>
                      <div class="unit-prop"><span>抵押</span><span>{{ getUnitMortgage(floor, unit) }}</span></div>
                      <div class="unit-prop"><span>查封</span><span>{{ getUnitSeized(floor, unit) }}</span></div>
                    </div>
                  </div>
                </div>
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
import { ref, computed } from 'vue'

const props = defineProps({ building: { type: Object, default: null } })
const emit = defineEmits(['close', 'selectFloor', 'selectUnit'])

const floorCollapsed = ref(false)
const expandedGroups = ref({})

function toggleGroup(start) {
  expandedGroups.value[start] = !expandedGroups.value[start]
}

const floorGroups = computed(() => {
  if (!props.building?.levels) return []
  const totalLevels = props.building.levels
  const groupSize = 5
  const groups = []
  for (let i = 1; i <= totalLevels; i += groupSize) {
    const end = Math.min(i + groupSize - 1, totalLevels)
    const floors = []
    for (let j = i; j <= end; j++) floors.push(j)
    groups.push({
      label: `${i}-${end} 层`,
      start: i,
      floors,
      expanded: expandedGroups.value[i] || false
    })
  }
  return groups
})

function handleFloorClick(floor) { emit('selectFloor', floor) }
function handleUnitClick(unit) { emit('selectUnit', unit) }

function getUnitOwner(floor, unit) { const o = ['张三','李四','王五','赵六']; return o[(floor * unit) % 4] }
function getUnitArea(floor, unit) { const a = [85,92,108,120]; return a[(floor * unit) % 4] }
function getUnitType(floor, unit) { const t = ['两室一厅','三室两厅','一室一厅','两室两厅']; return t[(floor * unit) % 4] }
function getUnitStatus(floor, unit) { const s = ['权属清晰','抵押中','查封','权属清晰']; return s[(floor * unit) % 4] }
function getUnitDate(floor, unit) { return `202${(floor * unit) % 4 + 1}-0${unit + 3}-${10 + unit}` }
function getUnitMortgage(floor, unit) { return (floor * unit) % 4 === 1 ? '是' : '否' }
function getUnitSeized(floor, unit) { return (floor * unit) % 4 === 2 ? '是' : '否' }
function getUnitDetail(floor, unit) { return `${getUnitArea(floor, unit)}㎡ · ${getUnitType(floor, unit)}` }
</script>

<style scoped>
.property-panel {
  position: fixed; top: 60px; right: -380px; width: 320px;
  max-height: calc(100vh - 100px); background: var(--bg-panel);
  backdrop-filter: blur(10px); border: 1px solid var(--border-active);
  border-radius: 10px 0 0 10px; color: var(--text-primary);
  z-index: 1000; transition: right 0.3s; overflow-y: auto; font-size: 13px;
}
.property-panel.active { right: 0; }
.panel-header { display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid rgba(0,150,255,0.2); }
.panel-title { font-weight: 600; color: var(--color-primary); }
.panel-close { background: none; border: 1px solid rgba(0,150,255,0.4); color: #7fb8e0; border-radius: 4px; cursor: pointer; width: 24px; height: 24px; }
.panel-body { padding: 12px 16px; }

.prop-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; }
.prop-row span:first-child { color: var(--text-secondary); }
.prop-row span:last-child { color: var(--text-primary); }

.data-mapping { margin: 12px 0; padding: 10px 12px; background: rgba(0,229,255,0.06); border: 1px solid rgba(0,229,255,0.15); border-radius: 6px; }
.mapping-title { font-size: 11px; color: var(--color-primary); font-weight: 600; margin-bottom: 8px; }
.mapping-flow { display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap; margin-bottom: 6px; }
.mapping-item { background: rgba(0,150,255,0.15); border: 1px solid rgba(0,150,255,0.25); padding: 3px 8px; border-radius: 4px; font-size: 11px; color: var(--text-primary); font-weight: 500; }
.mapping-arrow { color: var(--color-primary); font-size: 12px; font-weight: bold; }
.mapping-desc { font-size: 10px; color: var(--text-dim); text-align: center; }

.tree-section { margin-top: 4px; border-top: 1px solid rgba(0,150,255,0.2); padding-top: 8px; }
.tree-title { font-size: 13px; color: var(--text-secondary); cursor: pointer; padding: 4px 0; user-select: none; }
.tree-title:hover { color: var(--color-primary); }
.tree-body { padding-left: 4px; }

.floor-group { margin: 4px 0; }
.group-label { padding: 6px 10px; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--text-secondary); background: rgba(0,150,255,0.06); border-radius: 4px; transition: background 0.2s; }
.group-label:hover { background: rgba(0,150,255,0.15); color: var(--color-primary); }
.group-floors { padding-left: 8px; }

.tree-floor { margin: 2px 0; }
.tree-floor-label { padding: 5px 8px; cursor: pointer; border-radius: 4px; font-size: 12px; color: #a0bcd0; }
.tree-floor-label:hover { background: rgba(0,150,255,0.2); color: #fff; }
.tree-floor-label.active { background: rgba(0,150,255,0.3); color: #fff; font-weight: 600; }

.tree-units { padding-left: 16px; margin: 2px 0; }
.tree-unit { padding: 8px 10px; cursor: pointer; border-radius: 4px; font-size: 12px; color: #8ea8c8; border-bottom: 1px solid rgba(255,255,255,0.04); margin: 4px 0; background: rgba(255,255,255,0.02); }
.tree-unit:hover { background: rgba(0,255,136,0.08); }
.tree-unit.active { background: rgba(0,255,136,0.12); border-left: 2px solid #00ff88; }
.unit-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.unit-id { font-size: 13px; font-weight: 600; color: #e0f0ff; }
.unit-owner { font-size: 11px; color: var(--text-dim); }
.unit-detail { font-size: 10px; color: var(--text-dim); margin-bottom: 6px; padding-left: 4px; }

/* 户完整属性 */
.unit-props { padding: 6px 8px; background: rgba(0,0,0,0.2); border-radius: 4px; font-size: 10px; }
.unit-prop { display: flex; justify-content: space-between; padding: 2px 0; }
.unit-prop span:first-child { color: var(--text-secondary); }
.unit-prop span:last-child { color: var(--text-primary); font-weight: 500; }
.status-normal { color: #00ff88 !important; }
.status-alert { color: #ff8800 !important; }

.panel-empty { text-align: center; padding: 30px; color: var(--text-dim); }
</style>
