<template>
  <div class="app-container">
    <!-- 加载过渡页 -->
    <div v-if="!sceneReady" class="loading-screen">
      <div class="loading-text">正在加载城市底板...</div>
      <div class="loading-bar"></div>
    </div>

    <div id="cesiumContainer"></div>

    <!-- 顶部菜单栏 -->
    <div class="top-menu">
      <span class="menu-title">智慧城市 CIM 可视化平台</span>
      <div class="menu-right">
        <div class="menu-dropdown" @click="showModelMenu = !showModelMenu">
          <span>模型切换 ▾</span>
          <div v-if="showModelMenu" class="dropdown-list">
            <div class="dropdown-item active" @click.stop="showModelMenu = false">
              ✅ 倾斜摄影白模
            </div>
            <div class="dropdown-item" @click.stop="showGaussian = true; showModelMenu = false">
              🔬 3D 高斯泼溅（下一代）
            </div>
          </div>
        </div>
        <button class="menu-btn" @click="flyToOverview">俯瞰全市</button>
        <button class="menu-btn" @click="showArch = true">架构视图</button>
        <button class="menu-btn" @click="toggleMonitor">
          📹 {{ videoSurveillance?.showCameraPanel ? '隐藏' : '显示' }}监控
        </button>
      </div>
    </div>

    <PropertyPanel
      :building="dataPlatform?.selectedBuilding"
      @close="dataPlatform?.handleClosePanel"
      @selectFloor="dataPlatform?.handleSelectFloor"
    />

    <CameraPanel
      :visible="videoSurveillance?.showCameraPanel"
      :cameras="videoSurveillance?.cameraList"
      @close="videoSurveillance?.toggleCameraPanel"
      @select="videoSurveillance?.handleCameraSelect"
    />

    <!-- 告警列表 -->
    <div v-if="videoSurveillance?.alertSystem" class="alert-panel">
      <div class="alert-panel-title">⚠️ 实时告警</div>
      <div v-if="!videoSurveillance.alertSystem.alerts?.length" class="alert-empty">
        暂无告警，15 秒后自动触发...
      </div>
      <div
        v-for="alert in videoSurveillance.alertSystem.alerts"
        :key="alert.id"
        class="alert-item"
        :class="{ 'is-new': alert.status === 'new' }"
        @click="videoSurveillance.alertSystem.onAlertClick(alert)"
      >
        <span class="alert-time">{{ alert.time }}</span>
        <span class="alert-name">{{ alert.cameraName }}</span>
        <span class="alert-label">{{ alert.label }}</span>
      </div>
    </div>

    <!-- 工单弹窗 -->
    <div v-if="videoSurveillance?.alertSystem?.showWorkOrder" class="workorder-popup">
      <div class="wo-header">
        <span>📋 生成工单</span>
        <button @click="videoSurveillance.alertSystem.closeWorkOrder">×</button>
      </div>
      <div class="wo-body">
        <div class="wo-field">
          <label>工单编号</label>
          <input :value="videoSurveillance.alertSystem.currentWorkOrder.id" readonly />
        </div>
        <div class="wo-field">
          <label>事发位置</label>
          <input :value="videoSurveillance.alertSystem.currentWorkOrder.location" readonly />
        </div>
        <div class="wo-field">
          <label>事件类型</label>
          <input :value="videoSurveillance.alertSystem.currentWorkOrder.eventType" readonly />
        </div>
        <div class="wo-field">
          <label>指派给</label>
          <select v-model="videoSurveillance.alertSystem.currentWorkOrder.assignee">
            <option>网格员张三</option>
            <option>网格员李四</option>
            <option>网格员王五</option>
          </select>
        </div>
        <div class="wo-field">
          <label>备注</label>
          <textarea v-model="videoSurveillance.alertSystem.currentWorkOrder.remark" rows="2" placeholder="可选填..."></textarea>
        </div>
        <button class="wo-submit" @click="videoSurveillance.alertSystem.submitWorkOrder">
          生成工单
        </button>
      </div>
    </div>

    <!-- 视频弹窗 -->
    <div
      v-if="videoSurveillance?.alertSystem?.showVideo"
      class="video-popup"
      style="left: calc(50% - 180px); top: 100px;"
    >
      <div class="video-header">
        <span>{{ videoSurveillance.alertSystem.currentCamera?.name }}</span>
        <button @click="videoSurveillance.alertSystem.closeVideo">×</button>
      </div>
      <video
        v-if="videoSurveillance.alertSystem.currentCamera?.streamUrl"
        :src="videoSurveillance.alertSystem.currentCamera.streamUrl"
        autoplay loop muted width="360"
      />
      <div v-else class="video-placeholder">📹 实时画面 (Demo)</div>
    </div>

    <!-- 高斯泼溅介绍页 -->
    <GaussianPage v-if="showGaussian" @close="showGaussian = false" />

    <!-- 架构图页 -->
    <ArchitectureView v-if="showArch" @close="showArch = false" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useCesiumViewer } from './composables/useCesiumViewer.js'
import { useDataPlatform } from './composables/useDataPlatform.js'
import { useVideoSurveillance } from './composables/useVideoSurveillance.js'
import PropertyPanel from './components/PropertyPanel.vue'
import CameraPanel from './components/CameraPanel.vue'
import GaussianPage from './components/GaussianPage.vue'
import ArchitectureView from './components/ArchitectureView.vue'

const { init: initViewer, getViewer } = useCesiumViewer('cesiumContainer')
const dataPlatform = ref(null)
const videoSurveillance = ref(null)

const sceneReady = ref(false)
const showModelMenu = ref(false)
const showGaussian = ref(false)
const showArch = ref(false)

onMounted(async () => {
  const viewer = initViewer()

  dataPlatform.value = useDataPlatform(viewer)
  await dataPlatform.value.init()

  videoSurveillance.value = useVideoSurveillance(viewer)
  await videoSurveillance.value.init()

  sceneReady.value = true
})

onUnmounted(() => {
  videoSurveillance.value?.stopAlert()
})

const toggleMonitor = () => {
  videoSurveillance.value?.toggleCameraPanel()
}

const flyToOverview = () => {
  const viewer = getViewer()
  if (viewer) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(112.20, 31.06, 5000),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-60), roll: 0 },
      duration: 2
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

/* 加载过渡 */
.loading-screen {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: var(--bg-primary, #0a1428); z-index: 9999;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 20px;
}
.loading-text { color: #00d4ff; font-size: 18px; }
.loading-bar {
  width: 300px; height: 3px; background: rgba(0,212,255,0.2);
  border-radius: 2px; overflow: hidden;
}
.loading-bar::after {
  content: ''; display: block; width: 40%; height: 100%;
  background: #00d4ff;
  animation: loading-slide 1.5s ease-in-out infinite;
}
@keyframes loading-slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}

/* 顶部菜单 */
.top-menu {
  position: fixed; top: 0; left: 0; right: 0; height: 44px;
  background: var(--bg-header, rgba(0,30,60,0.85));
  border-bottom: 1px solid var(--border-primary, rgba(0,212,255,0.35));
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; z-index: 1500;
}
.menu-title { color: #00d4ff; font-size: 15px; font-weight: bold; }
.menu-right { display: flex; align-items: center; gap: 10px; }
.menu-dropdown {
  position: relative; color: #88bbee; font-size: 12px;
  cursor: pointer; padding: 4px 8px; border-radius: 3px;
}
.menu-dropdown:hover { background: rgba(0,212,255,0.1); }
.dropdown-list {
  position: absolute; top: 100%; right: 0;
  background: rgba(5,18,35,0.95); border: 1px solid rgba(0,212,255,0.35);
  border-radius: 4px; min-width: 210px; z-index: 100;
}
.dropdown-item { padding: 8px 12px; font-size: 12px; cursor: pointer; }
.dropdown-item:hover { background: rgba(0,212,255,0.15); }
.dropdown-item.active { color: #00d4ff; }
.menu-btn {
  background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.35);
  color: #88bbee; padding: 4px 10px; border-radius: 3px;
  font-size: 11px; cursor: pointer;
}
.menu-btn:hover { background: rgba(0,212,255,0.2); }

/* 告警面板 */
.alert-panel {
  position: fixed; left: 10px; bottom: 30px; width: 300px; max-height: 300px;
  background: rgba(5,18,35,0.92); border: 1px solid rgba(0,212,255,0.35);
  border-radius: 6px; color: #c0d8f0; font-size: 12px; z-index: 900;
  overflow-y: auto;
}
.alert-panel-title {
  padding: 8px 12px; background: rgba(0,30,60,0.8);
  color: #ff6644; font-weight: bold; border-bottom: 1px solid rgba(0,212,255,0.2);
}
.alert-empty { padding: 20px; text-align: center; color: #5a7a9a; }
.alert-item {
  padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.03);
  cursor: pointer; display: flex; gap: 10px; align-items: center;
}
.alert-item:hover { background: rgba(0,180,255,0.15); }
.is-new { border-left: 3px solid #ff4444; }
.alert-time { color: #5a7a9a; flex-shrink: 0; }
.alert-name { color: #88bbee; flex-shrink: 0; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.alert-label { color: #ff8866; font-weight: bold; }

/* 工单弹窗 */
.workorder-popup {
  position: fixed; z-index: 1000; left: calc(50% - 200px); top: 80px; width: 400px;
  background: rgba(5,20,40,0.95); border: 1px solid #ffaa00;
  border-radius: 6px; color: #c0d8f0; font-size: 13px;
}
.wo-header {
  display: flex; justify-content: space-between; padding: 8px 12px;
  background: rgba(40,20,0,0.8); border-bottom: 1px solid #ffaa00;
  color: #ffaa00; font-weight: bold;
}
.wo-header button { background: none; border: none; color: #ffaa00; font-size: 18px; cursor: pointer; }
.wo-body { padding: 12px; }
.wo-field { margin-bottom: 8px; }
.wo-field label { display: block; color: #7a9ab0; font-size: 11px; margin-bottom: 2px; }
.wo-field input, .wo-field select, .wo-field textarea {
  width: 100%; background: rgba(10,30,50,0.8); border: 1px solid rgba(255,170,0,0.3);
  color: #e0e8f0; padding: 6px 8px; border-radius: 3px; font-size: 12px; box-sizing: border-box;
}
.wo-submit {
  width: 100%; padding: 8px; background: #ff8800; color: #000;
  border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 10px;
}

/* 视频弹窗 */
.video-popup {
  position: fixed; z-index: 1001;
  background: rgba(5,20,40,0.95); border: 1px solid #ffaa00;
  border-radius: 8px; overflow: hidden;
}
.video-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; color: #ffaa00; font-weight: bold;
  background: rgba(40,20,0,0.8); border-bottom: 1px solid rgba(255,170,0,0.4);
}
.video-header button { background: none; border: none; color: #ffaa00; font-size: 20px; cursor: pointer; }
.video-placeholder {
  width: 360px; height: 200px; background: #111;
  display: flex; align-items: center; justify-content: center; color: #888;
}
</style>
