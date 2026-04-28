import { ref } from 'vue'
import eventBus from '../utils/eventBus.js'

export const WO_STATUS = {
  PROCESSING: 'processing',
  CLOSED: 'closed',
  HUNG: 'hung'
}

const GRID_WORKERS = ['张正-东宝01', '李敏-东宝02', '王强-东宝03', '赵丽-东宝04', '陈浩-东宝05']

const CAMERAS_MAP = {
  '东宝区主干道A': [112.201, 31.041], '东宝区主干道B': [112.203, 31.042],
  '象山大道入口': [112.198, 31.039], '长宁大道中段': [112.205, 31.040],
  '泉口路交叉口': [112.207, 31.044], '金龙泉大道北': [112.210, 31.046],
  '白云大道南段': [112.195, 31.037], '海慧路交叉口': [112.200, 31.043],
  '深圳大道西段': [112.192, 31.035], '培公大道东段': [112.212, 31.048],
  '关公大道转盘': [112.202, 31.033], '漳河大道入口': [112.188, 31.045]
}

const MOCK_IMAGES = [
  '现场处置照片_全景.jpg','现场处置照片_近景.jpg','整改后照片_A.jpg',
  '处理结果确认单.jpg','周边环境恢复.jpg'
]

const MOCK_NOTES = [
  '网格员已到达现场，违规行为已制止，现场恢复秩序。',
  '现场已清理完毕，相关责任人已警告处理。',
  '问题已解决，拍照留证，无需后续跟进。',
  '已与相关人员沟通，现场情况已记录备案。'
]

const HUNG_REASONS = [
  '附近网格员均已出勤，暂无人接单',
  '网格员培训不足，未及时登录平台确认',
  '现场处置数据未同步，待手动补录',
  '网格员已处理但忘记上传凭证'
]

const MAX_ORDERS = 200
const dispatchedAlertIds = new Set()

export function useWorkOrder() {
  const workOrders = ref([])
  let nextId = 6001
  const activeTimers = {}

  function createFromAlert(alert) {
    if (dispatchedAlertIds.has(alert.id)) return null
    const worker = GRID_WORKERS[Math.floor(Math.random() * GRID_WORKERS.length)]
    return createOrder(alert, worker, false)
  }

  function createFromManual(alert, workerName) {
    if (dispatchedAlertIds.has(alert.id)) {
      console.warn('预警已派单，无法重复派单')
      return null
    }
    dispatchedAlertIds.add(alert.id)
    return createOrder(alert, workerName, true)
  }

  function getDelayByLevel(level) {
    // 蓝/黄：3-5分钟（180-300秒），红/橙：5-8分钟（300-480秒）
    // Demo加速：蓝/黄 4-7秒，红/橙 7-12秒
    if (level === '蓝' || level === '黄') return 4000 + Math.floor(Math.random() * 3000)
    return 7000 + Math.floor(Math.random() * 5000)
  }

  function isHung() {
    // 5%概率挂起
    return Math.random() < 0.05
  }

  function createOrder(alert, workerName, isManual) {
    dispatchedAlertIds.add(alert.id)

    let lng, lat
    if (alert.cameraName && CAMERAS_MAP[alert.cameraName]) {
      [lng, lat] = CAMERAS_MAP[alert.cameraName]
    } else if (alert.pos && alert.pos.length === 2) {
      [lng, lat] = alert.pos
    } else {
      [lng, lat] = [112.201, 31.041]
    }

    const assignee = workerName || GRID_WORKERS[Math.floor(Math.random() * GRID_WORKERS.length)]
    const hung = isHung()
    const hungReason = hung ? HUNG_REASONS[Math.floor(Math.random() * HUNG_REASONS.length)] : ''

    const wo = {
      id: `WO-${nextId++}`,
      alertId: alert.id,
      title: `【${alert.level}】${alert.type} - ${alert.cameraName || '未知'}`,
      level: alert.level || '蓝',
      alertType: alert.type || '未知',
      cameraName: alert.cameraName || '未知',
      location: { lng, lat },
      status: hung ? WO_STATUS.HUNG : WO_STATUS.PROCESSING,
      createTime: new Date().toLocaleTimeString('zh-CN'),
      assignee: assignee,
      assignMode: isManual ? '人工调度' : 'AI智能分配',
      description: `${isManual ? '管理员调度' : 'AI智能判别'}：${alert.type}告警，已指派网格员${assignee}前往${alert.cameraName || '现场'}处置。`,
      processImages: [],
      closeTime: null,
      closeNote: '',
      hungReason: hungReason
    }

    workOrders.value.unshift(wo)
    if (workOrders.value.length > MAX_ORDERS) {
      const closedIndex = workOrders.value.findIndex(w => w.status === WO_STATUS.CLOSED)
      if (closedIndex !== -1) workOrders.value.splice(closedIndex, 1)
    }

    eventBus.emit('workorder:created', wo)
    eventBus.emit('alert:dispatched', alert.id)

    if (!hung) {
      const delay = getDelayByLevel(alert.level)
      const timerId = setTimeout(() => autoCompleteOrder(wo.id), delay)
      activeTimers[wo.id] = timerId
    } else {
      console.warn(`工单 ${wo.id} 因"${hungReason}"被挂起，需人工介入`)
    }

    return wo
  }

  function autoCompleteOrder(orderId) {
    const wo = workOrders.value.find(w => w.id === orderId)
    if (wo && (wo.status === WO_STATUS.PROCESSING)) {
      const imageCount = 2 + Math.floor(Math.random() * 2)
      const images = []
      for (let i = 0; i < imageCount; i++) {
        images.push(MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)])
      }
      wo.processImages = images
      wo.closeNote = MOCK_NOTES[Math.floor(Math.random() * MOCK_NOTES.length)]
      wo.closeTime = new Date().toLocaleTimeString('zh-CN')
      wo.status = WO_STATUS.CLOSED
      eventBus.emit('workorder:closed', wo)
      delete activeTimers[orderId]
    }
  }

  function closeWorkOrder(orderId) {
    const wo = workOrders.value.find(w => w.id === orderId)
    if (wo && (wo.status === WO_STATUS.PROCESSING || wo.status === WO_STATUS.HUNG)) {
      if (activeTimers[orderId]) {
        clearTimeout(activeTimers[orderId])
        delete activeTimers[orderId]
      }
      wo.processImages = ['管理员手动关闭_无现场照片.jpg']
      wo.closeNote = '管理员手动关闭此工单（原挂起原因：' + wo.hungReason + '）。'
      wo.closeTime = new Date().toLocaleTimeString('zh-CN')
      wo.status = WO_STATUS.CLOSED
      eventBus.emit('workorder:closed', wo)
      return true
    }
    return false
  }

  return { workOrders, createFromAlert, createFromManual, closeWorkOrder }
}
