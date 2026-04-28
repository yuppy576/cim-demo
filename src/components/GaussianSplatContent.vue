<template>
  <div class="gaussian-panel">
    <div class="panel-header">
      <h3>前瞻技术预研</h3>
      <span class="subtitle">克制中拥抱未来</span>
    </div>

    <div class="golden-quote">
      “有能力，会研判，能落地，有格局”
    </div>

    <!-- 数据资产地图 -->
    <div class="fold-section">
      <div class="fold-header" @click="toggle('asset')">
        <span>{{ sections.asset ? '▾' : '▸' }} 数据资产地图</span>
        <span class="fold-badge">多部门融合</span>
      </div>
      <div v-if="sections.asset" class="fold-body">
        <div class="asset-map">
          <div class="asset-node central">CIM数据中枢</div>
          <div class="asset-lines">
            <div class="asset-node dept">自然资源<span class="dept-data">倾斜摄影·BIM</span></div>
            <div class="asset-node dept">住建局<span class="dept-data">楼盘表·产权</span></div>
            <div class="asset-node dept">公安<span class="dept-data">视频·警情</span></div>
            <div class="asset-node dept">城管<span class="dept-data">网格·工单</span></div>
            <div class="asset-node dept">市政<span class="dept-data">管网·设施</span></div>
          </div>
        </div>
        <div class="asset-insight">
          <span>多源异构数据在三维底座汇聚，形成可检索、可分析、可预警的数字资产。当前原型已整合建筑、摄像头、警情、工单四类核心数据。</span>
        </div>
        <div class="asset-status">
          <span class="status-tag implemented">已实现：建筑·摄像头·警情·工单</span>
          <span class="status-tag planned">预留：管网·市政设施·人口</span>
        </div>
      </div>
    </div>

    <!-- IOT数字孪生 -->
    <div class="fold-section">
      <div class="fold-header" @click="toggle('iot')">
        <span>{{ sections.iot ? '▾' : '▸' }} IOT数字孪生</span>
        <span class="fold-badge">双向控制</span>
      </div>
      <div v-if="sections.iot" class="fold-body">
        <div class="device-demo">
          <div class="device-header">
            <span>东宝区主干道A·摄像头#03</span>
            <span :class="['device-status', demoStatus]">{{ demoStatusText }}</span>
          </div>
          <div class="device-steps" v-if="demoStep > 0">
            <div class="step-row" :class="{ active: demoStep >= 1 }"><span>①</span><span>数字孪生体状态同步</span><span>在线</span></div>
            <div class="step-row" :class="{ active: demoStep >= 2 }"><span>②</span><span>远程拉流检测</span><span>码率正常</span></div>
            <div class="step-row" :class="{ active: demoStep >= 3 }"><span>③</span><span>云台自检</span><span>转动正常</span></div>
            <div class="step-row" :class="{ active: demoStep >= 4 }"><span>④</span><span>诊断完成</span><span>无异常</span></div>
          </div>
          <button class="btn-diagnose" @click="startDiagnose" :disabled="demoRunning">{{ demoRunning ? '诊断中...' : '模拟诊断' }}</button>
        </div>
        <div class="iot-table">
          <h5>数字孪生双向控制能力矩阵</h5>
          <div class="compare-table">
            <div class="compare-header"><span>能力</span><span>描述</span><span>原型状态</span></div>
            <div class="compare-row"><span>实时状态同步</span><span>真实设备状态映射至数字孪生体</span><span class="highlight">视频模块已演示</span></div>
            <div class="compare-row"><span>远程指令下发</span><span>通过平台向真实设备发送控制指令</span><span>接口预留</span></div>
            <div class="compare-row"><span>异常自动诊断</span><span>设备离线或故障自动检测并生成工单</span><span class="highlight">诊断流程已演示</span></div>
            <div class="compare-row"><span>OTA固件升级</span><span>远程推送设备固件更新</span><span>接口预留</span></div>
          </div>
        </div>
        <div class="iot-insight">
          <span>数字孪生的核心价值在于"可控制"而非"可观看"。在株洲驻场期间，运维人员最迫切的需求是远程诊断，可减少约80%的现场巡检工作量。</span>
        </div>
      </div>
    </div>

    <!-- 地下管网案例 -->
    <div class="fold-section">
      <div class="fold-header" @click="toggle('pipe')">
        <span>{{ sections.pipe ? '▾' : '▸' }} 地下管网可视化案例</span>
        <span class="fold-badge">真实项目</span>
      </div>
      <div v-if="sections.pipe" class="fold-body">
        <div class="case-timeline">
          <div class="case-step"><div class="step-marker">①</div><div class="step-content"><div class="step-title">业务需求提出</div><div class="step-desc">业务部门要求在三维模型中实现管道透明透视，查看地下管网布局</div></div></div>
          <div class="case-step"><div class="step-marker">②</div><div class="step-content"><div class="step-title">技术可行性验证</div><div class="step-desc">协调相关部门获取测试数据，采购Cesium商用许可进行原型验证</div></div></div>
          <div class="case-step"><div class="step-marker">③</div><div class="step-content"><div class="step-title">风险评估与判断</div><div class="step-desc">测试发现数据体量过大、渲染性能不足、跨部门协调困难，经综合评估建议暂缓全面部署</div></div></div>
          <div class="case-step"><div class="step-marker">④</div><div class="step-content"><div class="step-title">架构预留与经验沉淀</div><div class="step-desc">完成接口层设计和数据管道打通，待条件成熟后可快速接入并上线</div></div></div>
        </div>
        <div class="case-insight">
          <span>新技术落地需同时满足三个条件：数据就绪、性能达标、组织协调。任一条件缺失，仅能停留在测试验证阶段。</span>
        </div>
      </div>
    </div>

    <!-- 3D高斯泼溅 -->
    <div class="fold-section">
      <div class="fold-header" @click="toggle('gaussian')">
        <span>{{ sections.gaussian ? '▾' : '▸' }} 3D高斯泼溅</span>
        <span class="fold-badge">下一代三维</span>
      </div>
      <div v-if="sections.gaussian" class="fold-body">
        <div class="compare-table">
          <div class="compare-header"><span>维度</span><span>传统倾斜摄影</span><span>3D高斯泼溅</span></div>
          <div class="compare-row"><span>数据量</span><span>OSGB，数百GB</span><span class="highlight">.ply/.splat，轻量数倍</span></div>
          <div class="compare-row"><span>真实感</span><span>三角网格+纹理</span><span class="highlight">椭球体模拟，照片级</span></div>
          <div class="compare-row"><span>GIS坐标系</span><span>成熟支持</span><span>深度开发中</span></div>
          <div class="compare-row"><span>行业状态</span><span>主流方案</span><span class="highlight">SuperMap 2025已支持，Cesium跟进</span></div>
        </div>
        <div class="toolchain">
          <h5>已调研工具链</h5>
          <div class="tool-tags">
            <span class="tool-tag">Postshot（生成）</span>
            <span class="tool-tag">SuperSplat（预览）</span>
            <span class="tool-tag">GISBox（转3D Tiles）</span>
            <span class="tool-tag">Luma AI（移动端）</span>
          </div>
        </div>
        <div class="platform-status">
          <span>本平台已预留加载接口，当前为静态演示页。</span>
        </div>
      </div>
    </div>

    <!-- 产品决策理念 -->
    <div class="fold-section">
      <div class="fold-header" @click="toggle('principle')">
        <span>{{ sections.principle ? '▾' : '▸' }} 决策理念</span>
      </div>
      <div v-if="sections.principle" class="fold-body">
        <div class="insight-cards">
          <div class="insight-card"><div class="card-icon">🔍</div><div class="card-title">有能力</div><div class="card-desc">独立调研前沿技术，梳理完整工具链与行业动态</div></div>
          <div class="insight-card"><div class="card-icon">⚖️</div><div class="card-title">会研判</div><div class="card-desc">判断技术成熟度与落地时机，避免盲目追逐热点</div></div>
          <div class="insight-card"><div class="card-icon">🚀</div><div class="card-title">能落地</div><div class="card-desc">完成预研、原型测试，输出可扩展的架构预留接口</div></div>
          <div class="insight-card"><div class="card-icon">🌐</div><div class="card-title">有格局</div><div class="card-desc">兼顾政务系统的稳定性要求，拥抱未来但不冒进</div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const sections = reactive({
  asset: false,
  iot: false,
  pipe: false,
  gaussian: false,
  principle: false
})

function toggle(key) {
  sections[key] = !sections[key]
}

const demoStep = ref(0)
const demoRunning = ref(false)
const demoStatus = ref('idle')
const demoStatusText = ref('待诊断')

function startDiagnose() {
  if (demoRunning.value) return
  demoRunning.value = true
  demoStep.value = 0
  demoStatus.value = 'running'
  demoStatusText.value = '诊断中...'
  const steps = [
    { delay: 800, step: 1 },
    { delay: 1500, step: 2 },
    { delay: 2200, step: 3 },
    { delay: 3000, step: 4 }
  ]
  steps.forEach(({ delay, step }) => {
    setTimeout(() => {
      demoStep.value = step
      if (step === 4) {
        demoStatus.value = 'done'
        demoStatusText.value = '诊断完成'
        demoRunning.value = false
      }
    }, delay)
  })
}
</script>

<style scoped>
.gaussian-panel { padding: 20px 24px; color: var(--text-primary); height: 100%; overflow-y: auto; font-size: 13px; }
.panel-header { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle); }
.panel-header h3 { margin: 0; font-size: 20px; color: var(--color-primary); }
.subtitle { font-size: 12px; color: var(--text-dim); letter-spacing: 4px; }
.golden-quote { text-align: center; font-size: 18px; font-weight: 700; color: #00e5ff; padding: 16px; margin: 12px 0 20px; background: rgba(0,229,255,0.05); border: 1px solid rgba(0,229,255,0.2); border-radius: 8px; letter-spacing: 2px; }

.fold-section { margin-bottom: 8px; border: 1px solid rgba(0,150,255,0.1); border-radius: 8px; overflow: hidden; }
.fold-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(0,150,255,0.05); cursor: pointer; font-weight: 600; font-size: 14px; color: var(--color-primary); transition: background 0.2s; }
.fold-header:hover { background: rgba(0,150,255,0.12); }
.fold-badge { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: rgba(0,229,255,0.15); font-weight: 400; }
.fold-body { padding: 16px; }

.asset-map { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px 0; }
.asset-node.central { background: rgba(0,229,255,0.15); border: 2px solid rgba(0,229,255,0.4); padding: 10px 20px; border-radius: 8px; font-weight: 700; color: var(--color-primary); font-size: 14px; }
.asset-lines { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.asset-node.dept { background: rgba(0,150,255,0.08); border: 1px solid rgba(0,150,255,0.2); padding: 8px 12px; border-radius: 6px; text-align: center; font-size: 11px; min-width: 80px; }
.dept-data { display: block; font-size: 9px; color: var(--text-dim); margin-top: 2px; }
.asset-insight { margin-top: 8px; padding: 8px; font-size: 11px; color: #ccc; line-height: 1.5; }
.asset-status { margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; }
.status-tag { font-size: 10px; padding: 3px 8px; border-radius: 4px; }
.status-tag.implemented { background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); color: #00ff88; }
.status-tag.planned { background: rgba(0,150,255,0.1); border: 1px solid rgba(0,150,255,0.3); color: var(--color-primary); }

.device-demo { margin-bottom: 12px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; }
.device-header { display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 8px; }
.device-status { font-size: 10px; padding: 2px 8px; border-radius: 4px; margin-left: auto; }
.device-status.idle { background: rgba(255,255,255,0.05); color: #999; }
.device-status.running { background: rgba(255,170,0,0.15); color: #ffaa00; }
.device-status.done { background: rgba(0,255,136,0.15); color: #00ff88; }
.device-steps { margin-bottom: 10px; }
.step-row { display: flex; align-items: center; gap: 8px; padding: 3px 0; font-size: 11px; color: var(--text-dim); }
.step-row.active { color: var(--text-primary); }
.step-row span:last-child { margin-left: auto; }
.step-row.active span:last-child { color: #00ff88; }
.btn-diagnose { background: rgba(0,229,255,0.15); border: 1px solid rgba(0,229,255,0.3); color: var(--color-primary); padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 11px; width: 100%; }
.btn-diagnose:disabled { opacity: 0.4; cursor: default; }

.iot-table h5 { margin: 0 0 8px; font-size: 12px; color: var(--text-secondary); }
.compare-table { font-size: 11px; }
.compare-header, .compare-row { display: grid; grid-template-columns: 100px 1fr 100px; gap: 8px; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.compare-header { font-weight: 600; color: var(--text-dim); }
.highlight { color: #00e5ff; }
.iot-insight { margin-top: 10px; padding: 8px; font-size: 11px; color: #ccc; line-height: 1.5; }

.case-timeline { display: flex; flex-direction: column; gap: 0; }
.case-step { display: flex; gap: 10px; padding: 6px 0; position: relative; }
.case-step:not(:last-child)::after { content: ''; position: absolute; left: 13px; top: 32px; width: 2px; height: calc(100% - 12px); background: rgba(0,150,255,0.2); }
.step-marker { width: 26px; height: 26px; border-radius: 50%; background: rgba(0,150,255,0.2); border: 2px solid var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--color-primary); flex-shrink: 0; z-index: 1; }
.step-content { flex: 1; }
.step-title { font-weight: 600; font-size: 13px; margin-bottom: 2px; }
.step-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.4; }
.case-insight { margin-top: 10px; padding: 8px; font-size: 11px; color: #ccc; line-height: 1.5; }

.toolchain { margin-top: 12px; }
.toolchain h5 { margin: 0 0 8px; font-size: 12px; color: var(--text-secondary); }
.tool-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tool-tag { background: rgba(0,229,255,0.1); border: 1px solid rgba(0,229,255,0.2); padding: 4px 10px; border-radius: 14px; font-size: 10px; }
.platform-status { margin-top: 10px; font-size: 11px; color: var(--text-dim); }

.insight-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.insight-card { background: rgba(0,150,255,0.05); border: 1px solid rgba(0,150,255,0.1); border-radius: 8px; padding: 14px 12px; text-align: center; }
.card-icon { font-size: 24px; margin-bottom: 6px; }
.card-title { font-weight: 700; font-size: 13px; color: var(--color-primary); margin-bottom: 4px; }
.card-desc { font-size: 10px; color: var(--text-dim); line-height: 1.4; }
</style>
