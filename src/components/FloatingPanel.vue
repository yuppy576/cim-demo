<template>
  <div class="floating-panel" v-if="currentModule !== 'overview'">
    <div class="panel-header"><h3>{{ title }}</h3><button class="panel-close-btn" @click="$emit('close')">✕</button></div>
    <div class="panel-body">
      <PropertySearchContent v-if="currentModule === 'property'" :buildings="buildings" @select-building="$emit('select-building', $event)" />
      <CameraPanel v-if="currentModule === 'video'" :cameras="cameras" :inline="true" :show-header="false" :active-cam-id="activeCameraId" @select="$emit('camera-select', $event)" @locate="$emit('camera-locate', $event)" />
      <AlertCenter v-if="currentModule === 'alert'" @locate-camera="$emit('alert-locate-camera', $event)" />
      <WorkOrderPanel v-if="currentModule === 'workorder'" :orders="workOrders" />
      <GaussianSplatContent v-if="currentModule === 'gaussian'" :model-value="gaussianLayer" @update:model-value="$emit('update:gaussianLayer', $event)" />
      <UserCenter v-if="currentModule === 'usercenter'" />
      <DataCenterView v-if="currentModule === 'datacenter'" :buildings="buildings" :cameras="cameras" :work-orders="workOrders" />
    </div>
  </div>
</template>

<script setup>
import PropertySearchContent from './PropertySearchContent.vue'
import CameraPanel from './CameraPanel.vue'
import AlertCenter from './AlertCenter.vue'
import GaussianSplatContent from './GaussianSplatContent.vue'
import WorkOrderPanel from './WorkOrderPanel.vue'
import UserCenter from './UserCenter.vue'
import DataCenterView from '../views/DataCenterView.vue'
defineProps({ currentModule:String, title:String, cameras:{type:Array,default:()=>[]}, gaussianLayer:Boolean, workOrders:{type:Array,default:()=>[]}, activeCameraId:{type:String,default:null}, buildings:{type:Array,default:()=>[]} })
defineEmits(['close','camera-select','camera-locate','select-building','alert-locate-camera','update:gaussianLayer'])
</script>

<style scoped>
.floating-panel{position:fixed;top:50px;right:12px;width:var(--panel-width);max-height:75vh;background:var(--bg-panel);backdrop-filter:blur(14px);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);z-index:300;display:flex;flex-direction:column;box-shadow:var(--glow-primary)}
.panel-header{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border-active)}
.panel-header h3{margin:0;font-size:var(--font-size-md);color:var(--color-primary);font-weight:600}
.panel-close-btn{background:none;border:1px solid var(--border-active);color:var(--text-secondary);width:26px;height:26px;border-radius:var(--radius-sm);cursor:pointer;font-size:var(--font-size-md);display:flex;align-items:center;justify-content:center}
.panel-body{flex:1;overflow-y:auto;padding:12px}
</style>
