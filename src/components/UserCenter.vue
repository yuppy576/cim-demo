<template>
  <div class="user-center">
    <div class="user-profile">
      <div class="avatar">👤</div>
      <div class="info"><strong>{{ currentUser?.username }}</strong><span class="role">{{ currentUser?.role === 'admin' ? '管理员' : '普通用户' }}</span></div>
      <button class="btn-logout" @click="handleLogout">退出</button>
    </div>

    <div class="permissions">
      <h4>可访问模块</h4>
      <div class="perm-tags"><span v-for="p in currentUser?.permissions" :key="p" class="perm-tag">{{ getModuleName(p) }}</span></div>
    </div>

    <div v-if="isAdmin" class="admin-panel">
      <h4>用户管理 ({{ users.length }})</h4>
      <div v-for="user in users" :key="user.id" class="user-row">
        <div><span class="user-name">{{ user.username }}</span><span class="user-role">{{ user.role === 'admin' ? '管理员' : '普通用户' }}</span></div>
        <div class="user-actions">
          <button @click="editUser(user)">编辑</button>
          <button v-if="user.role !== 'admin'" @click="removeUser(user.id)">删除</button>
        </div>
      </div>
      <button class="btn-add" @click="showAdd = true">+ 添加用户</button>

      <div v-if="showAdd || editingUser" class="edit-form">
        <h5>{{ editingUser ? '编辑用户' : '添加用户' }}</h5>
        <input v-model="f.username" placeholder="用户名" />
        <input v-model="f.password" type="password" placeholder="密码" />
        <select v-model="f.role">
          <option value="user">普通用户</option>
          <option value="admin">管理员</option>
        </select>
        <div class="perm-checkboxes">
          <label v-for="m in allModules" :key="m.id">
            <input type="checkbox" :value="m.id" v-model="f.permissions" />{{ m.label }}
          </label>
        </div>
        <div class="form-actions"><button @click="saveUser">保存</button><button @click="cancelEdit">取消</button></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { currentUser, isAdmin, logout, getUsers, addUser, updateUser, deleteUser } = useAuth()

const allModules = [
  { id:'overview', label:'城市总览' }, { id:'property', label:'不动产查询' },
  { id:'video', label:'视频监控' }, { id:'alert', label:'公共安全预警' },
  { id:'workorder', label:'工单中心' }, { id:'gaussian', label:'前沿技术' },
  { id:'usercenter', label:'用户中心' }
]
function getModuleName(id) { const m = allModules.find(m => m.id === id); return m ? m.label : id }

const users = ref([])
const showAdd = ref(false)
const editingUser = ref(null)
const f = reactive({ username:'', password:'', role:'user', permissions:['overview'] })

function loadUsers() { users.value = getUsers() }
onMounted(loadUsers)

function handleLogout() { logout(); location.reload() }
function editUser(user) {
  editingUser.value = user; showAdd.value = false
  f.username = user.username; f.password = ''; f.role = user.role; f.permissions = [...user.permissions]
}
async function removeUser(id) { if (confirm('确认删除?')) { deleteUser(id); loadUsers() } }
async function saveUser() {
  if (!f.username) return
  if (editingUser.value) { await updateUser(editingUser.value.id, { ...f }) }
  else { await addUser({ ...f }) }
  loadUsers(); cancelEdit()
}
function cancelEdit() { showAdd.value = false; editingUser.value = null; f.username = ''; f.password = ''; f.role = 'user'; f.permissions = ['overview'] }
</script>

<style scoped>
.user-center { font-size:13px; }
.user-profile { display:flex; align-items:center; gap:12px; margin-bottom:24px; }
.avatar { font-size:32px; } .info { flex:1; } .info strong { display:block; color:var(--text-primary); } .role { color:var(--color-primary); font-size:11px; }
.btn-logout { background:rgba(255,100,100,0.2); border:1px solid rgba(255,100,100,0.4); color:#ff6666; padding:4px 12px; border-radius:4px; cursor:pointer; }
.permissions h4, .admin-panel h4 { color:var(--color-primary); margin:16px 0 8px; font-size:14px; }
.perm-tags { display:flex; flex-wrap:wrap; gap:6px; }
.perm-tag { background:rgba(0,229,255,0.15); border:1px solid rgba(0,229,255,0.3); padding:3px 10px; border-radius:12px; font-size:11px; color:var(--color-primary); }
.admin-panel { border-top:1px solid var(--border-subtle); padding-top:16px; margin-top:16px; }
.user-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
.user-name { color:var(--text-primary); } .user-role { color:var(--text-secondary); font-size:11px; margin-left:8px; }
.user-actions button { background:none; border:1px solid var(--border-active); color:var(--text-secondary); padding:2px 8px; border-radius:3px; margin-left:4px; cursor:pointer; font-size:11px; }
.btn-add { background:rgba(0,229,255,0.2); border:1px solid var(--border-active); color:var(--color-primary); padding:6px 16px; border-radius:6px; margin-top:8px; cursor:pointer; }
.edit-form { background:rgba(0,20,40,0.8); border:1px solid var(--border-active); border-radius:8px; padding:16px; margin-top:12px; }
.edit-form h5 { margin:0 0 12px; color:var(--color-primary); }
.edit-form input, .edit-form select { display:block; width:100%; margin-bottom:8px; padding:6px; border-radius:4px; border:1px solid var(--border-active); background:rgba(0,0,0,0.5); color:#fff; }
.perm-checkboxes { display:flex; flex-direction:column; gap:4px; margin-bottom:12px; color:var(--text-secondary); font-size:12px; }
.perm-checkboxes input { width:auto; margin-right:6px; }
.form-actions { display:flex; gap:8px; }
.form-actions button { flex:1; padding:6px; border-radius:4px; border:1px solid var(--border-active); background:rgba(0,150,255,0.3); color:#fff; cursor:pointer; }
</style>
