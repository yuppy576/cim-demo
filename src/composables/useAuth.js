import { ref, computed } from 'vue'

// 使用简单的哈希函数（不依赖 Web Crypto API，兼容非 localhost 环境）
function simpleHash(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash = hash & hash // 转32位
  }
  return Math.abs(hash).toString(16)
}

// 预设用户的密码哈希值 (simpleHash)
const HASH_ADMIN = simpleHash('admin123')   // 不存明文
const HASH_GUEST = simpleHash('guest')

// 每次启动都重置用户数据（确保干净状态）
localStorage.removeItem('cim_currentUser')
localStorage.removeItem('cim_users')

const defaultUsers = [
  { id:1, username:'admin', passwordHash:HASH_ADMIN, role:'admin', permissions:['overview','property','video','alert','workorder','gaussian','usercenter', 'datacenter'] },
  { id:2, username:'guest', passwordHash:HASH_GUEST, role:'user', permissions:['overview','video'] }
]
localStorage.setItem('cim_users', JSON.stringify(defaultUsers))
let users = [...defaultUsers]

const currentUser = ref({ username: 'admin', role: 'admin', permissions: ['overview','property','video','alert','workorder','gaussian','usercenter','datacenter'] })

export function useAuth() {
  const isLoggedIn = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  // 登录（不依赖 Web Crypto API）
  function login(u, p) {
    const hash = simpleHash(p)
    const user = users.find(x => x.username === u && x.passwordHash === hash)
    if (user) {
      const safe = { id:user.id, username:user.username, role:user.role, permissions:user.permissions }
      currentUser.value = safe
      localStorage.setItem('cim_currentUser', JSON.stringify(safe))
      return true
    }
    return false
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('cim_currentUser')
  }

  function getAllowedModules() {
    return currentUser.value?.permissions || ['overview']
  }

  function getUsers() {
    return users.map(u => ({ id:u.id, username:u.username, role:u.role, permissions:u.permissions }))
  }

  function addUser(user) {
    const hash = user.password ? simpleHash(user.password) : HASH_GUEST
    users.push({ id:Date.now(), username:user.username, passwordHash:hash, role:user.role||'user', permissions:user.permissions||['overview'] })
    localStorage.setItem('cim_users', JSON.stringify(users))
  }

  function updateUser(id, up) {
    const idx = users.findIndex(u => u.id === id)
    if (idx === -1) return
    if (up.password) { up.passwordHash = simpleHash(up.password); delete up.password }
    users[idx] = { ...users[idx], ...up }
    localStorage.setItem('cim_users', JSON.stringify(users))
  }

  function deleteUser(id) {
    users = users.filter(u => u.id !== id)
    localStorage.setItem('cim_users', JSON.stringify(users))
  }

  return { currentUser, isLoggedIn, isAdmin, login, logout, getAllowedModules, getUsers, addUser, updateUser, deleteUser }
}
