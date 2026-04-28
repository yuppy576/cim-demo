import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/overview' },
  { path: '/overview', name: 'overview', component: () => import('../views/CityOverview.vue'), meta: { title: '城市总览' } },
  { path: '/property', name: 'property', component: () => import('../views/RealEstateView.vue'), meta: { title: '不动产查询' } },
  { path: '/video', name: 'video', component: () => import('../views/VideoView.vue'), meta: { title: '视频监控' } },
  { path: '/alert', name: 'alert', component: () => import('../views/AlertView.vue'), meta: { title: '公共安全预警' } },
  { path: '/workorder', name: 'workorder', component: () => import('../views/WorkOrderView.vue'), meta: { title: '工单中心' } },
  { path: '/gaussian', name: 'gaussian', component: () => import('../views/GaussianView.vue'), meta: { title: '前沿技术' } },
  { path: '/usercenter', name: 'usercenter', component: () => import('../views/UserCenterView.vue'), meta: { title: '用户中心' } },
  { path: '/datacenter', name: 'datacenter', component: () => import('../views/DataCenterView.vue'), meta: { title: '数据中心' } }
]

export default createRouter({ history: createWebHashHistory(), routes })
