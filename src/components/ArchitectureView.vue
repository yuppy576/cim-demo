<template>
  <div class="arch-page">
    <div class="arch-header">
      <span>📐 系统技术架构</span>
      <button @click="$emit('close')">×</button>
    </div>
    <div class="arch-body">
      <div class="arch-layer layer-frontend">
        <div class="layer-title">展示层</div>
        <div class="layer-items">
          <span class="tech-tag">Cesium.js 1.110+</span>
          <span class="tech-tag">Vue 3 + Vite</span>
          <span class="tech-tag">天地图 WMTS</span>
          <span class="tech-tag">Element Plus</span>
        </div>
        <div class="layer-desc">三维场景渲染 · UI 面板 · 视频弹窗 · 告警联动 · 工单闭环</div>
      </div>

      <div class="arch-arrow">↓ HTTP / WebSocket</div>

      <div class="arch-layer layer-backend">
        <div class="layer-title">API 网关层</div>
        <div class="layer-items">
          <span class="tech-tag">Node.js + Express</span>
          <span class="tech-tag">RESTful API</span>
          <span class="tech-tag">WebSocket</span>
        </div>
        <div class="layer-desc">建筑查询 · 摄像头管理 · 告警推送 · 工单 CRUD · 高斯泼溅数据服务（预留）</div>
      </div>

      <div class="arch-arrow">↓ 标准 OGC 接口</div>

      <div class="arch-layer layer-data">
        <div class="layer-title">数据资源层</div>
        <div class="layer-items">
          <span class="tech-tag">3D Tiles</span>
          <span class="tech-tag">GeoJSON</span>
          <span class="tech-tag">JSON Mock</span>
          <span class="tech-tag">mp4 视频流</span>
          <span class="tech-tag">.ply / .splat（预留）</span>
        </div>
        <div class="layer-desc">荆门东宝区白模 · 建筑属性 · 摄像头点位 · 不动产数据 · 高斯泼溅样本</div>
      </div>

      <div class="arch-notes">
        <h4>架构特点</h4>
        <ul>
          <li>纯开源技术栈，无厂商锁定</li>
          <li>前后端解耦，支持水平扩展</li>
          <li>标准 OGC 接口，可对接超图 / ArcGIS</li>
          <li>预留高斯泼溅图层，支持下一代可视化</li>
          <li>与株洲 CIM 平台数据底座设计一脉相承</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])
</script>

<style scoped>
.arch-page {
  position: fixed; top: 44px; left: 0; right: 0; bottom: 0;
  background: var(--bg-primary); z-index: 2000; overflow-y: auto;
  color: var(--text-primary);
}
.arch-header {
  display: flex; justify-content: space-between; padding: 16px 24px;
  background: var(--bg-header); border-bottom: 1px solid var(--border-primary);
  font-size: 18px; font-weight: bold;
}
.arch-header button { background: none; border: none; color: var(--text-accent); font-size: 24px; cursor: pointer; }
.arch-body { max-width: 800px; margin: 0 auto; padding: 24px; }
.arch-layer { border: 1px solid var(--border-primary); border-radius: 8px; padding: 16px; margin-bottom: 12px; }
.layer-frontend { border-left: 4px solid #00d4ff; }
.layer-backend { border-left: 4px solid #ffaa00; }
.layer-data   { border-left: 4px solid #00ff88; }
.layer-title { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
.layer-frontend .layer-title { color: #00d4ff; }
.layer-backend .layer-title { color: #ffaa00; }
.layer-data   .layer-title { color: #00ff88; }
.layer-items { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.tech-tag {
  background: rgba(0, 212, 255, 0.1); border: 1px solid var(--border-primary);
  padding: 4px 10px; border-radius: 3px; font-size: 12px; color: var(--text-secondary);
}
.layer-desc { font-size: 12px; color: var(--text-muted); }
.arch-arrow { text-align: center; color: var(--text-muted); font-size: 14px; padding: 4px 0; }
.arch-notes { margin-top: 20px; background: rgba(0, 212, 255, 0.05); border-radius: 8px; padding: 16px 20px; }
.arch-notes h4 { color: var(--text-accent); margin-bottom: 10px; }
.arch-notes li { font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
</style>
