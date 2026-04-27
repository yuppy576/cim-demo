<template>
  <div class="gaussian-content">
    <h4>🧊 3D 高斯泼溅（3DGS）</h4>
    <p>下一代三维重建技术，以更轻量的数据实现照片级真实感渲染。</p>
    <button class="gaussian-btn" @click="toggleLayer">
      {{ modelValue ? '关闭图层预览' : '开启图层预览' }}
    </button>
    <div v-if="modelValue" class="gaussian-preview">
      <img
        src="/gaussian_preview.png"
        alt="预览"
        style="max-width:100%; opacity:0.8; margin-top:12px; border-radius:6px;"
        onerror="this.style.display='none'"
      />
      <p class="hint">SuperMap GIS 2025 已原生支持 · Cesium 路线图规划中</p>
    </div>
  </div>
</template>

<script setup>
defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])
const toggleLayer = () => emit('update:modelValue', !props.modelValue)
</script>

<style scoped>
.gaussian-content h4 { color: var(--color-primary); margin-top: 0; }
.gaussian-content p { font-size: 12px; color: #a0bcd0; }
.gaussian-btn {
  background: rgba(0,150,255,0.2);
  border: 1px solid rgba(0,150,255,0.5);
  color: var(--color-primary);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.hint { font-size: 11px; color: var(--text-dim); margin-top: 8px; }
</style>
