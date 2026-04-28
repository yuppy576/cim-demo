<template>
  <div :class="['camera-list-wrapper', { 'inline-mode': inline }]">
    <div class="panel-header" v-if="showHeader">
      <span>📹 监控列表</span>
      <button @click="$emit('close')">✕</button>
    </div>
    <div class="search-box">
      <input v-model="searchText" type="text" placeholder="搜索路名/摄像头..." @input="onSearch" />
      <span class="search-hint" v-if="searchText && filteredCameras.length === 0">无匹配结果</span>
    </div>
    <div class="panel-body">
      <div
        v-for="cam in filteredCameras"
        :key="cam.id"
        class="camera-item"
        :class="{ 'camera-item-active': activeCamId === cam.id }"
        @click="selectCamera(cam)"
      >
        <span class="cam-status" :class="cam.status"></span>
        <div class="cam-info">
          <span class="cam-name">{{ cam.name }}</span>
          <span class="cam-addr">{{ cam.address || cam.osd?.split('|')[2]?.trim() || '' }}</span>
        </div>
        <span class="cam-locate" @click.stop="$emit('locate', cam)">📍</span>
      </div>
      <div v-if="cameras.length === 0" class="empty">暂无摄像头数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  cameras: { type: Array, default: () => [] },
  inline: { type: Boolean, default: false },
  showHeader: { type: Boolean, default: false },
  activeCamId: { type: String, default: null }
})

const emit = defineEmits(['close', 'select', 'locate'])

const searchText = ref('')

const filteredCameras = computed(() => {
  let list = [...props.cameras]
  
  // 按状态排序：在线优先
  list.sort((a, b) => {
    if (a.status === 'online' && b.status !== 'online') return -1
    if (a.status !== 'online' && b.status === 'online') return 1
    return 0
  })
  
  // 搜索过滤
  if (searchText.value.trim()) {
    const kw = searchText.value.trim().toLowerCase()
    list = list.filter(c =>
      c.name.toLowerCase().includes(kw) ||
      (c.address && c.address.includes(kw)) ||
      (c.osd && c.osd.includes(kw))
    )
  }
  
  return list
})

function onSearch() {
  if (searchText.value.trim() && filteredCameras.value.length > 0) {
    const firstMatch = filteredCameras.value[0]
    if (firstMatch) {
      // 通过定位事件触发飞行
      setTimeout(() => emit('locate', firstMatch), 100)
    }
  }
}

function selectCamera(cam) {
  emit('select', cam)
}
</script>

<style scoped>
.inline-mode {
  position: relative !important; left: auto !important; top: auto !important;
  width: 100% !important; max-height: none !important;
  background: none !important; border: none !important; border-radius: 0 !important; padding: 0 !important;
}
.camera-list-wrapper { padding: 6px; color: var(--text-primary); font-size: 13px; }
.panel-header { display: flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid rgba(0,150,255,0.2); }
.panel-header button { background: none; border: 1px solid rgba(0,150,255,0.4); color: #7fb8e0; border-radius: 4px; cursor: pointer; }
.panel-body { padding: 6px; max-height: 350px; overflow-y: auto; }

.search-box { padding: 6px 10px; position: relative; }
.search-box input {
  width: 100%; padding: 6px 10px; border-radius: 4px;
  border: 1px solid rgba(0,150,255,0.25); background: rgba(0,0,0,0.3);
  color: #fff; font-size: 12px; box-sizing: border-box;
}
.search-box input::placeholder { color: #888; }
.search-hint { display: block; font-size: 10px; color: var(--text-dim); padding: 4px 0; text-align: center; }

.camera-item {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 8px; cursor: pointer; border-radius: 4px; transition: background 0.2s;
}
.camera-item:hover { background: rgba(0,150,255,0.15); }
.camera-item-active { background: var(--border-active); border-left: 2px solid var(--color-primary); }

.cam-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cam-status.online { background: #4caf50; }
.cam-status.offline { background: #f44336; }
.cam-status.alarm { background: #ff8800; animation: blink 0.8s infinite; }
@keyframes blink { 50% { opacity: 0.3; } }

.cam-info { flex: 1; min-width: 0; }
.cam-name { font-size: 12px; display: block; }
.cam-addr { font-size: 10px; color: var(--text-dim); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cam-locate { font-size: 14px; opacity: 0.5; transition: opacity 0.2s; cursor: pointer; }
.cam-locate:hover { opacity: 1; }
.empty { text-align: center; color: var(--text-dim); padding: 16px; }
</style>
