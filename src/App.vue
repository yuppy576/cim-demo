<template>
  <LoginPanel />
  <div class="app-shell" v-if="isLoggedIn">
    <main class="map-area">
      <div id="cesiumContainer"></div>
      <div v-if="currentModule === 'overview'" class="stats-row">
        <div class="stat-card"><div class="stat-value">186</div><div class="stat-label">建筑总数</div></div>
        <div class="stat-card"><div class="stat-value">4,200</div><div class="stat-label">登记户数</div></div>
        <div class="stat-card"><div class="stat-value">12</div><div class="stat-label">摄像头点位</div></div>
        <div class="stat-card"><div class="stat-value">{{ activeWorkOrderCount }}</div><div class="stat-label">处理中工单</div></div>
      </div>
      <PropertyPanel v-if="currentModule === 'overview'" :building="selectedBuilding" @close="handleClosePanel" @selectFloor="handleSelectFloor" @selectUnit="handleSelectUnit" />
    </main>
    <header class="top-nav"><TopNavbar :menu-items="allowedMenuItems" :current-module="currentModule" @switch="switchModule" /></header>
    <FloatingPanel v-if="currentModule !== 'overview'" :current-module="currentModule" :title="currentModuleLabel" :cameras="cameraList" :gaussian-layer="gaussianLayer" :work-orders="workOrders" :buildings="buildingList" :active-camera-id="activePopupCamera?.id" @close="closeFloatingPanel" @camera-select="handleCameraSelect" @camera-locate="handleCameraLocate" @select-building="handleBuildingSelect" @alert-locate-camera="handleAlertLocateCamera" @update:gaussian-layer="gaussianLayer = $event" />
    <CameraPopup :camera="activePopupCamera" @close="closeCameraPopup" @locate="handlePopupLocate" />
    <footer class="global-footer">© 2026 OCL | 智慧城市CIM平台核心模块复刻</footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import * as Cesium from 'cesium'
import './styles/theme.css'
import { useCesiumViewer } from './composables/useCesiumViewer.js'
import { useBuildingLayer } from './composables/useBuildingLayer.js'
import { useBuildingInteraction } from './composables/useBuildingInteraction.js'
import { usePropertyPanel } from './composables/usePropertyPanel.js'
import { useFloorExpand } from './composables/useFloorExpand.js'
import { useCameraLayer } from './composables/useCameraLayer.js'
import { useWorkOrder } from './composables/useWorkOrder.js'
import { useWorkOrderLabel } from './composables/useWorkOrderLabel.js'
import { useAuth } from './composables/useAuth.js'
import TopNavbar from './components/TopNavbar.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import FloatingPanel from './components/FloatingPanel.vue'
import CameraPopup from './components/CameraPopup.vue'
import LoginPanel from './components/LoginPanel.vue'
import eventBus from './utils/eventBus.js'

const { init: initViewer, getViewer } = useCesiumViewer('cesiumContainer')
const { selectedBuilding, selectBuilding, closePanel, updateSelectedFloor, updateSelectedUnit } = usePropertyPanel()
const { workOrders, createFromAlert } = useWorkOrder()
const { isLoggedIn, getAllowedModules } = useAuth()
console.log('🔍 [App.vue] useAuth 加载:', { isLoggedIn: isLoggedIn.value })

let floorExpand, buildingLayer, interaction, cameraLayer, currentSelectedEntityId, workOrderLabel
let mockDataMap = {}
const currentModule = ref('overview'), cameraList = ref([]), gaussianLayer = ref(false), activePopupCamera = ref(null), buildingList = ref([])
const activeWorkOrderCount = computed(() => workOrders.value.filter(w => w.status === 'processing').length)
const allMenuItems = [ { id:'overview', label:'城市总览', icon:'🏠' }, { id:'property', label:'不动产查询', icon:'🏢' }, { id:'video', label:'视频监控', icon:'📹' }, { id:'alert', label:'公共安全预警', icon:'🚨' }, { id:'workorder', label:'工单中心', icon:'📋' }, { id:'gaussian', label:'前沿技术', icon:'🧊' }, { id:'datacenter', label:'数据中台', icon:'📊' }, { id:'usercenter', label:'用户中心', icon:'👤' } ]
const allowedMenuItems = computed(() => allMenuItems.filter(i => getAllowedModules().includes(i.id)))
const currentModuleLabel = computed(() => (allMenuItems.find(m => m.id === currentModule.value) || {}).label || '')

const switchModule = (id) => { currentModule.value = (currentModule.value === id) ? 'overview' : id; if (id !== 'overview') handleClosePanel() }
const closeFloatingPanel = () => { currentModule.value = 'overview' }
const showCameraPopup = (cam) => { console.log('📹 弹出摄像头:', cam.name); activePopupCamera.value = cam }
const closeCameraPopup = () => { activePopupCamera.value = null }
const handleCameraSelect = (cam) => { flyToPosition(cam.lng, cam.lat, 300); showCameraPopup(cam) }
const handleCameraLocate = (cam) => { flyToPosition(cam.lng, cam.lat, 200) }
const handleAlertLocateCamera = (alert) => { const cam = cameraList.value.find(c => c.name === alert.cameraName); if (cam) { flyToPosition(cam.lng, cam.lat, 300); showCameraPopup(cam) } }
const handlePopupLocate = (cam) => { flyToPosition(cam.lng, cam.lat, 200) }

const handleBuildingSelect = (building) => {
  if (!building.lng || !building.lat) { console.warn('建筑缺少坐标:', building.name); return }
  currentModule.value = 'overview'
  const v = getViewer(); if (!v) return
  v.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(building.lng, building.lat, building.height + 120), orientation: { heading: Cesium.Math.toRadians(25), pitch: Cesium.Math.toRadians(-35), roll: 0 }, duration: 1.2 })
  const enriched = { ...building, structure:'框架-剪力墙', usage:Math.random()>0.5?'商住综合':'住宅', year:2015+Math.floor(Math.random()*8), totalUnits:building.levels*4 }
  selectBuilding(enriched)
  const ds = buildingLayer?.getDataSource(); if (!ds) return
  const entity = ds.entities.values.find(e => e.buildId === building.id)
  if (entity) { currentSelectedEntityId = entity.id; interaction?.resetHighlight(); entity.polygon.material = Cesium.Color.fromCssColorString('#00e5ff').withAlpha(0.85); floorExpand?.expandFloors(entity, enriched) }
}

const onMapCameraClick = (camData) => { showCameraPopup(camData); flyToPosition(camData.lng, camData.lat, 300) }
const flyToPosition = (lng, lat, height) => { const v = getViewer(); if (v) v.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(lng, lat, height), duration: 1.2 }) }

onMounted(async () => {
  const viewer = initViewer(); if (!viewer) return
  document.getElementById('app-loading')?.remove()
  buildingLayer = useBuildingLayer(viewer); await buildingLayer.load()
  mockDataMap = buildingLayer.getMockDataMap()
  buildingList.value = Object.values(mockDataMap).map(b => {
    const entity = buildingLayer.getDataSource()?.entities?.values?.find(e => e.buildId === b.id)
    let lng, lat
    if (entity?.polygon) { try { const p = entity.polygon.hierarchy.getValue().positions[0]; const c = Cesium.Cartographic.fromCartesian(p); lng = Cesium.Math.toDegrees(c.longitude); lat = Cesium.Math.toDegrees(c.latitude) } catch(e) {} }
    return { ...b, lng: lng || 112.20+Math.random()*0.03, lat: lat || 31.04+Math.random()*0.02 }
  })
  floorExpand = useFloorExpand(viewer); interaction = useBuildingInteraction(viewer, mockDataMap); interaction.init()
  interaction.onSelect((d, e) => { if (currentModule.value !== 'overview') return; if (d) { selectBuilding({ ...d, structure:'框架-剪力墙', usage:Math.random()>0.5?'商住综合':'住宅', year:2015+Math.floor(Math.random()*8), totalUnits:d.levels*4 }); currentSelectedEntityId = e.id; floorExpand.expandFloors(e, d) } else { closePanel(); floorExpand.resetAllHighlights(); currentSelectedEntityId = null } })
  cameraLayer = useCameraLayer(viewer); await cameraLayer.load()
  cameraList.value = await (await fetch(import.meta.env.BASE_URL+'data/cameras.json')).json()
  workOrderLabel = useWorkOrderLabel(viewer)
  eventBus.on('workorder:dispatch', (a) => { const wo = createFromAlert(a); flyToPosition(wo.location.lng, wo.location.lat, 400) })
  eventBus.on('workorder:created', (w) => { if (workOrderLabel) workOrderLabel.addOrUpdateLabel(w) })
  eventBus.on('workorder:closed', (w) => { if (workOrderLabel) workOrderLabel.addOrUpdateLabel(w) })
  eventBus.on('workorder:removed', (id) => { if (workOrderLabel) workOrderLabel.removeLabel(id) })
  eventBus.on('camera:map-click', onMapCameraClick)
})

onUnmounted(() => { eventBus.off('workorder:dispatch'); eventBus.off('workorder:created'); eventBus.off('workorder:closed'); eventBus.off('workorder:removed'); eventBus.off('camera:map-click'); if(workOrderLabel) workOrderLabel.destroy() })
function handleClosePanel() { interaction?.resetHighlight(); floorExpand?.resetAllHighlights(); closePanel(); currentSelectedEntityId = null }
function handleSelectFloor(f) { updateSelectedFloor(f); if(currentSelectedEntityId && floorExpand) floorExpand.selectFloor(currentSelectedEntityId, f) }
function handleSelectUnit(u) { updateSelectedUnit(u) }
</script>

<style>
html,body,#app{margin:0;padding:0;width:100%;height:100%;overflow:hidden;font-family:var(--font-family);background:var(--bg-deep);color:var(--text-primary)}
.app-shell{width:100vw;height:100vh;position:relative}
.top-nav{position:fixed;top:0;left:0;right:0;z-index:500;display:flex;justify-content:center;padding:4px;pointer-events:none}
.top-nav>*{pointer-events:auto}
.global-footer{position:fixed;bottom:4px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.12);font-size:var(--font-size-sm);z-index:300;pointer-events:none}
</style>

<style>
/* 强制修复：地图容器必须占满剩余高度 */
#cesiumContainer {
  height: 100% !important;
  min-height: 100vh;
}
.map-area {
  height: 100% !important;
  position: relative;
}
</style>
