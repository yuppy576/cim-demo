# 智慧城市CIM平台核心模块复刻

基于 Cesium + Vue3 的智慧城市 CIM 平台核心能力原型，独立复刻不动产管理、IOT 视频监控、预警工单闭环等核心模块，并预留 3D 高斯泼溅演进接口。

## 技术栈
- 三维引擎：Cesium.js（纯色地球 + GeoJSON 白模 + 3DTiles）
- 前端框架：Vue 3 + Vite
- 架构模式：Composables（模块化 + 事件总线解耦）
- 数据：OpenStreetMap → Geofabrik → Python 转换脚本

## 核心功能
- 三维城市底板（Bing 底图 + 建筑白模）
- 不动产分层分户查询（楼层展开 + 户数脉冲动画）
- 视频监控（地图/列表双入口，统一弹窗）
- 公共安全预警（红橙自动派单 + 蓝黄人工处置）
- 工单闭环（Label 实体 + 生命周期管理）
- 3D 高斯泼溅接口预留（glTF 模拟管线）

## 本地运行

npm install
npm run dev

访问 http://localhost:5173

## 项目结构

src/
├── components/        Vue 组件
│   ├── TopNavbar.vue
│   ├── PropertyPanel.vue
│   ├── PropertySearchContent.vue
│   ├── CameraPanel.vue
│   ├── CameraPopup.vue
│   ├── AlertCenter.vue
│   ├── WorkOrderPanel.vue
│   ├── GaussianSplatContent.vue
│   └── FloatingPanel.vue
├── composables/       业务逻辑模块
│   ├── useCesiumViewer.js
│   ├── useBuildingLayer.js
│   ├── useBuildingInteraction.js
│   ├── usePropertyPanel.js
│   ├── useFloorExpand.js
│   ├── useCameraLayer.js
│   ├── useWorkOrder.js
│   ├── useWorkOrderLabel.js
│   └── useGaussianSplat.js
├── utils/
│   └── eventBus.js    事件总线
├── styles/
│   └── theme.css      全局CSS变量
└── App.vue            主入口

## 作者
OCL | 5年GIS/CIM实施经验 | 株洲CIM平台驻场技术负责人
