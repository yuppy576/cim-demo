const listeners = {}
export default {
  on(event, cb) { (listeners[event] = listeners[event] || []).push(cb) },
  off(event, cb) { if (listeners[event]) listeners[event] = listeners[event].filter(f => f !== cb) },
  emit(event, data) { (listeners[event] || []).forEach(cb => cb(data)) }
}
