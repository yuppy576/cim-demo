<template>
  <div class="gaussian-page">
    <div class="gaussian-header">
      <span>🔬 下一代数实融合底座：3D 高斯泼溅</span>
      <button @click="$emit('close')">×</button>
    </div>

    <div class="gaussian-body">
      <div class="gaussian-intro">
        <p>
          3D Gaussian Splatting（3DGS）是 2023 年 SIGGRAPH 最佳论文技术，
          用<strong>数百万个带颜色和透明度的椭球体</strong>来表示三维场景，
          正在颠覆传统实景三维重建。
        </p>
      </div>

      <table class="gaussian-table">
        <thead>
          <tr>
            <th>对比维度</th>
            <th>传统倾斜摄影</th>
            <th>3D 高斯泼溅</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>数据格式</td><td>OSGB / 三角网格</td><td>.ply / .splat</td></tr>
          <tr><td>视觉真实感</td><td>依赖纹理贴图</td><td>照片级，支持反光/透明</td></tr>
          <tr><td>数据量</td><td>几十平方公里数百 GB</td><td>同等范围更小</td></tr>
          <tr><td>实时编辑</td><td>需重新建模</td><td>支持实时增删改</td></tr>
          <tr><td>GIS 坐标支持</td><td>成熟</td><td>有限（发展中期）</td></tr>
          <tr><td>主流平台支持</td><td>已大规模商用</td><td>SuperMap 2025 / Cesium ion 已支持</td></tr>
        </tbody>
      </table>

      <div class="gaussian-toolchain">
        <h4>技术工具链</h4>
        <div class="toolchain-flow">
          <span class="tool-node">无人机视频</span>
          <span class="tool-arrow">→</span>
          <span class="tool-node">Postshot</span>
          <span class="tool-arrow">→</span>
          <span class="tool-node">.ply 文件</span>
          <span class="tool-arrow">→</span>
          <span class="tool-node">GISBox 切片</span>
          <span class="tool-arrow">→</span>
          <span class="tool-node">3D Tiles</span>
          <span class="tool-arrow">→</span>
          <span class="tool-node">Cesium 加载</span>
        </div>
      </div>

      <div class="gaussian-placeholder">
        <p>📷 高斯泼溅效果示例（预留）</p>
        <div class="placeholder-box">此处展示 Postshot 生成的局部场景截图</div>
      </div>

      <div class="gaussian-status">
        <p>📍 当前状态：<strong>预留接口</strong>，支持未来加载 .ply / .splat 格式数据。</p>
        <p>💡 一旦城市级公开数据集成熟或项目需要，系统可无缝切换底座。</p>
      </div>

      <button class="gaussian-back" @click="$emit('close')">← 返回三维城市</button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])
</script>

<style scoped>
.gaussian-page {
  position: fixed; top: 44px; left: 0; right: 0; bottom: 0;
  background: var(--bg-primary); z-index: 2000; overflow-y: auto;
  color: var(--text-primary);
}
.gaussian-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 24px; background: var(--bg-header);
  border-bottom: 1px solid var(--border-primary);
  font-size: 18px; font-weight: bold;
}
.gaussian-header button {
  background: none; border: none; color: var(--text-accent);
  font-size: 24px; cursor: pointer;
}
.gaussian-body { max-width: 800px; margin: 0 auto; padding: 24px; }
.gaussian-intro { margin-bottom: 20px; line-height: 1.8; font-size: 14px; }
.gaussian-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
.gaussian-table th, .gaussian-table td {
  padding: 10px 14px; border: 1px solid var(--border-primary); text-align: left;
}
.gaussian-table th { background: var(--bg-header); color: var(--text-accent); }
.gaussian-table tr:hover td { background: rgba(0, 212, 255, 0.05); }
.gaussian-toolchain { margin-bottom: 20px; }
.gaussian-toolchain h4 { color: var(--text-accent); margin-bottom: 12px; }
.toolchain-flow { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; font-size: 12px; }
.tool-node {
  background: rgba(0, 212, 255, 0.1); border: 1px solid var(--border-primary);
  padding: 6px 12px; border-radius: 4px; color: var(--text-secondary);
}
.tool-arrow { color: var(--text-muted); }
.gaussian-placeholder { margin-bottom: 20px; text-align: center; }
.placeholder-box {
  width: 100%; height: 200px; background: rgba(0, 212, 255, 0.05);
  border: 1px dashed var(--border-primary); border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-muted); font-size: 13px; margin-top: 10px;
}
.gaussian-status {
  background: rgba(0, 212, 255, 0.05); border-left: 3px solid var(--color-accent);
  padding: 12px 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.8;
}
.gaussian-back {
  display: block; width: 200px; margin: 0 auto; padding: 10px;
  background: var(--color-accent); color: #000; border: none;
  border-radius: 4px; font-weight: bold; cursor: pointer;
}
</style>
