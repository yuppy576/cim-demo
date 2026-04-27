<template>
  <div class="floating-panel">
    <div class="panel-header"><h3>公共安全预警</h3><button class="panel-close-btn" @click="$router.push('/overview')">✕</button></div>
    <div class="panel-body"><AlertCenter @locate-camera="alert => $emit('alert-locate-camera', alert)" /></div>
  </div>
</template>

<script setup>
import AlertCenter from '../components/AlertCenter.vue'
defineEmits(['alert-locate-camera'])
</script>

<style scoped>
.floating-panel{position:fixed;top:50px;right:12px;width:var(--panel-width);max-height:75vh;background:var(--bg-panel);backdrop-filter:blur(14px);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);z-index:300;display:flex;flex-direction:column;box-shadow:var(--glow-primary)}
.panel-header{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border-active)}
.panel-header h3{margin:0;font-size:var(--font-size-md);color:var(--color-primary);font-weight:600}
.panel-close-btn{background:none;border:1px solid var(--border-active);color:var(--text-secondary);width:26px;height:26px;border-radius:var(--radius-sm);cursor:pointer;font-size:var(--font-size-md);display:flex;align-items:center;justify-content:center}
.panel-body{flex:1;overflow-y:auto;padding:12px}
</style>
