<template>
  <div class="app-container">
    <div id="cesiumContainer"></div>

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

    <div class="toolbar">
      <button @click="videoSurveillance?.toggleCameraPanel" class="toolbar-btn">
        📹 {{ videoSurveillance?.showCameraPanel ? '隐藏' : '显示' }}监控列表
      </button>
    </div>

    <!-- 告警列表 -->
    <div v-if="videoSurveillance?.alertSystem" class="alert-panel">
      <div class="alert-panel-title">⚠️ 实时告警</div>
      <div v-if="!videoSurveillance.alertSystem.alerts?.length" class="alert-empty">
        暂无告警，15秒后自动触发...
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
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useCesiumViewer } from './composables/useCesiumViewer.js'
import { useDataPlatform } from './composables/useDataPlatform.js'
import { useVideoSurveillance } from './composables/useVideoSurveillance.js'
import PropertyPanel from './components/PropertyPanel.vue'
import CameraPanel from './components/CameraPanel.vue'

const { init: initViewer } = useCesiumViewer('cesiumContainer')
const dataPlatform = ref(null)
const videoSurveillance = ref(null)

onMounted(async () => {
  const viewer = initViewer()

  dataPlatform.value = useDataPlatform(viewer)
  await dataPlatform.value.init()

  videoSurveillance.value = useVideoSurveillance(viewer)
  await videoSurveillance.value.init()
})

onUnmounted(() => {
  videoSurveillance.value?.stopAlert()
})
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

/* 工单弹窗 */
.workorder-popup {
  position: fixed; z-index: 1000; left: calc(50% - 200px); top: 80px; width: 400px;
  background: rgba(5,20,40,0.95); border: 1px solid #ffaa00;
  border-radius: 6px; color: #c0d8f0; font-size: 13px;
  box-shadow: 0 0 20px rgba(255,170,0,0.2);
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
.wo-submit:hover { background: #ffaa00; }

/* 视频弹窗 */
.video-popup {
  position: fixed; z-index: 1001;
  background: rgba(5,20,40,0.95); border: 1px solid #ffaa00;
  border-radius: 8px; overflow: hidden; box-shadow: 0 0 30px rgba(0,0,0,0.7);
}
.video-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; color: #ffaa00; font-weight: bold;
  background: rgba(40,20,0,0.8); border-bottom: 1px solid #ffaa0066;
}
.video-header button { background: none; border: none; color: #ffaa00; font-size: 20px; cursor: pointer; }
.video-placeholder {
  width: 360px; height: 200px; background: #111;
  display: flex; align-items: center; justify-content: center; color: #888;
}
</style>
