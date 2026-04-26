<template>
  <div class="app-container">
    <div id="cesiumContainer"></div>

    <!-- 右侧属性面板 -->
    <PropertyPanel
      :building="selectedBuilding"
      @close="handleClosePanel"
      @selectFloor="handleSelectFloor"
    />

    <!-- 左侧摄像头列表 -->
    <CameraPanel
      :visible="showCameraPanel"
      :cameras="cameraList"
      @close="showCameraPanel = false"
      @select="handleCameraSelect"
    />

    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <button @click="showCameraPanel = !showCameraPanel" class="toolbar-btn">
        📹 {{ showCameraPanel ? '隐藏' : '显示' }}监控列表
      </button>
    </div>

    <!-- 告警列表 -->
    <div class="alert-panel">
      <div class="alert-panel-title">⚠️ 实时告警</div>
      <div v-if="!alertSystem?.alerts?.length" class="alert-empty">暂无告警，15秒后自动触发...</div>
      <div
        v-for="alert in alertSystem?.alerts"
        :key="alert.id"
        class="alert-item"
        :class="{ 'is-new': alert.status === 'new' }"
        @click="alertSystem?.onAlertClick(alert)"
      >
        <span class="alert-time">{{ alert.time }}</span>
        <span class="alert-name">{{ alert.cameraName }}</span>
        <span class="alert-label">{{ alert.label }}</span>
      </div>
    </div>

    <!-- 视频弹窗 -->
    <div
      v-if="alertSystem?.showVideo"
      class="video-popup"
      style="left: calc(50% - 180px); top: 100px;"
    >
      <div class="video-header">
        <span>{{ alertSystem?.currentCamera?.name }}</span>
        <button @click="alertSystem?.closeVideo">×</button>
      </div>
      <video
        v-if="alertSystem?.currentCamera?.streamUrl"
        :src="alertSystem.currentCamera.streamUrl"
        autoplay loop muted
        width="360"
      />
      <div v-else style="width:360px;height:200px;background:#111;display:flex;align-items:center;justify-content:center;color:#888;">
        📹 实时画面 (Demo)
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as Cesium from 'cesium'
import { useCesiumViewer } from './composables/useCesiumViewer.js'
import { useBuildingLayer } from './composables/useBuildingLayer.js'
import { useBuildingInteraction } from './composables/useBuildingInteraction.js'
import { usePropertyPanel } from './composables/usePropertyPanel.js'
import { useFloorExpand } from './composables/useFloorExpand.js'
import { useCameraLayer } from './composables/useCameraLayer.js'
import { useAlertSystem } from './composables/useAlertSystem.js'
import PropertyPanel from './components/PropertyPanel.vue'
import CameraPanel from './components/CameraPanel.vue'

const { init: initViewer, getViewer } = useCesiumViewer('cesiumContainer')
const { selectedBuilding, selectBuilding, closePanel, updateSelectedFloor } = usePropertyPanel()

let floorExpand = null
let buildingLayer = null
let interaction = null
let cameraLayer = null
let alertSystem = null
let currentSelectedEntityId = null

const showCameraPanel = ref(false)
const cameraList = ref([])

onMounted(async () => {
  const viewer = initViewer()

  buildingLayer = useBuildingLayer(viewer)
  await buildingLayer.load()
  const mockDataMap = buildingLayer.getMockDataMap()

  floorExpand = useFloorExpand(viewer)

  interaction = useBuildingInteraction(viewer, mockDataMap)
  interaction.init()
  interaction.onSelect((mockData, entity) => {
    if (mockData) {
      floorExpand.resetAllHighlights()
      selectBuilding(mockData)
      currentSelectedEntityId = entity.id
      floorExpand.expandFloors(entity, mockData)
    } else {
      closePanel()
      floorExpand.resetAllHighlights()
      currentSelectedEntityId = null
    }
  })

  cameraLayer = useCameraLayer(viewer)
  await cameraLayer.load()
  const resp = await fetch('/data/cameras.json')
  cameraList.value = await resp.json()

  // 初始化告警系统
  alertSystem = useAlertSystem(viewer, cameraList)
  alertSystem.startLoop()
})

onUnmounted(() => {
  alertSystem?.destroy()
})

const handleClosePanel = () => {
  interaction?.resetHighlight()
  floorExpand.resetAllHighlights()
  closePanel()
  currentSelectedEntityId = null
}

const handleSelectFloor = (floorNumber) => {
  updateSelectedFloor(floorNumber)
  if (currentSelectedEntityId && floorExpand) {
    floorExpand.selectFloor(currentSelectedEntityId, floorNumber)
  }
}

const handleCameraSelect = (cam) => {
  const viewer = getViewer()
  if (viewer && cam) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(cam.lng, cam.lat, 300),
      duration: 1
    })
  }
}
</script>

<style>
html, body, #app {
  margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}
.app-container { position: relative; width: 100%; height: 100%; }
#cesiumContainer { width: 100%; height: 100%; }

.toolbar {
  position: fixed; top: 10px; left: 10px; z-index: 800;
  display: flex; gap: 8px;
}
.toolbar-btn {
  background: rgba(10,20,40,0.85); border: 1px solid rgba(0,150,255,0.4);
  color: #4db8ff; padding: 8px 14px; border-radius: 6px;
  cursor: pointer; font-size: 13px; transition: all 0.2s;
}
.toolbar-btn:hover { background: rgba(0,120,255,0.3); color: #fff; }

/* 告警面板 */
.alert-panel {
  position: fixed; left: 10px; bottom: 30px; width: 300px; max-height: 300px;
  background: rgba(5,18,35,0.92); border: 1px solid #00d4ff55;
  border-radius: 6px; color: #c0d8f0; font-size: 12px; z-index: 900;
  overflow-y: auto; backdrop-filter: blur(10px);
}
.alert-panel-title {
  padding: 8px 12px; background: rgba(0,30,60,0.8);
  color: #ff6644; font-weight: bold; border-bottom: 1px solid #00d4ff33;
}
.alert-empty { padding: 20px; text-align: center; color: #5a7a9a; }
.alert-item {
  padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.03);
  cursor: pointer; display: flex; gap: 10px; align-items: center; transition: background 0.2s;
}
.alert-item:hover { background: rgba(0,180,255,0.15); }
.is-new { border-left: 3px solid #ff4444; }
.alert-time { color: #5a7a9a; flex-shrink: 0; }
.alert-name { color: #88bbee; flex-shrink: 0; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.alert-label { color: #ff8866; font-weight: bold; }

/* 视频弹窗 */
.video-popup {
  position: fixed; z-index: 1000;
  background: rgba(5,20,40,0.95); border: 1px solid #ffaa00;
  border-radius: 8px; overflow: hidden; box-shadow: 0 0 30px rgba(0,0,0,0.7);
}
.video-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; color: #ffaa00; font-weight: bold;
  background: rgba(40,20,0,0.8); border-bottom: 1px solid #ffaa0066;
}
.video-header button {
  background: none; border: none; color: #ffaa00; font-size: 20px; cursor: pointer;
}
</style>
