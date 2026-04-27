import { ref } from 'vue'
import eventBus from '../utils/eventBus.js'

// 工单状态
export const WO_STATUS = {
  PROCESSING: 'processing',
  CLOSED: 'closed'
}

// 12个摄像头坐标（用于将预警pos转换为摄像头标准坐标）
const CAMERAS_MAP = {
  '东宝区主干道A': [112.201, 31.041],
  '东宝区主干道B': [112.203, 31.042],
  '象山大道入口': [112.198, 31.039],
  '长宁大道中段': [112.205, 31.040],
  '泉口路交叉口': [112.207, 31.044],
  '金龙泉大道北': [112.210, 31.046],
  '白云大道南段': [112.195, 31.037],
  '海慧路交叉口': [112.200, 31.043],
  '深圳大道西段': [112.192, 31.035],
  '培公大道东段': [112.212, 31.048],
  '关公大道转盘': [112.202, 31.033],
  '漳河大道入口': [112.188, 31.045]
}

export function useWorkOrder() {
  const workOrders = ref([])
  let nextId = 6001

  // 从预警创建工单
  function createFromAlert(alert) {
    // 从摄像头名称获取精确坐标，降级使用预警自带的pos
    let lng, lat
    if (alert.cameraName && CAMERAS_MAP[alert.cameraName]) {
      [lng, lat] = CAMERAS_MAP[alert.cameraName]
    } else if (alert.pos && alert.pos.length === 2) {
      [lng, lat] = alert.pos
    } else {
      [lng, lat] = [112.201, 31.041]
    }

    const wo = {
      id: `WO-${nextId++}`,
      alertId: alert.id,
      title: `【${alert.level}】${alert.type} - ${alert.cameraName || '未知'}`,
      cameraName: alert.cameraName || '未知',
      location: { lng, lat },
      status: WO_STATUS.PROCESSING,
      createTime: new Date().toLocaleTimeString('zh-CN'),
      assignee: '值班员-张三',
      description: `系统自动派发：${alert.type}告警，请前往${alert.cameraName || '现场'}处置。`
    }

    workOrders.value.unshift(wo)
    // 限制最多保留50条
    if (workOrders.value.length > 50) workOrders.value.pop()

    // 广播工单创建事件
    eventBus.emit('workorder:created', wo)

    // 3秒后自动关闭
    setTimeout(() => {
      closeWorkOrder(wo.id)
    }, 3000)

    return wo
  }

  function closeWorkOrder(orderId) {
    const wo = workOrders.value.find(w => w.id === orderId)
    if (wo && wo.status === WO_STATUS.PROCESSING) {
      wo.status = WO_STATUS.CLOSED
      eventBus.emit('workorder:closed', wo)
      
      // 10秒后从列表中移除
      setTimeout(() => {
        workOrders.value = workOrders.value.filter(w => w.id !== orderId)
        eventBus.emit('workorder:removed', orderId)
      }, 10000)
    }
  }

  return { workOrders, createFromAlert, closeWorkOrder }
}
