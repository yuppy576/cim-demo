<template>
  <div class="login-overlay" v-if="!isLoggedIn">
    <div class="login-card">
      <h2>智慧城市CIM平台</h2>
      <p class="sub">用户认证 · 安全登录</p>
      <div class="login-form">
        <div class="field"><label>用户名</label><input v-model="username" type="text" placeholder="请输入用户名" @keyup.enter="doLogin" /></div>
        <div class="field"><label>密码</label><input v-model="password" type="password" placeholder="请输入密码" @keyup.enter="doLogin" /></div>
        <div class="error" v-if="error">{{ error }}</div>
        <button class="btn-login" @click="doLogin">登 录</button>
      </div>
      <p class="hint">请联系管理员获取账户</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
const username = ref(''), password = ref(''), error = ref('')
const { isLoggedIn, login } = useAuth()
async function doLogin() {
  error.value = ''
  if (!username.value || !password.value) { error.value = '请输入用户名和密码'; return }
  const ok = await login(username.value, password.value)
  if (!ok) error.value = '用户名或密码错误'
}
</script>

<style scoped>
.login-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center}
.login-card{background:var(--bg-panel);backdrop-filter:blur(15px);border:1px solid var(--border-active);border-radius:16px;padding:40px;width:360px;box-shadow:var(--glow-strong)}
h2{color:var(--color-primary);text-align:center;margin:0 0 8px}
.sub{color:var(--text-secondary);text-align:center;font-size:13px;margin-bottom:24px}
.field{margin-bottom:16px}
.field label{color:var(--text-secondary);font-size:13px;display:block;margin-bottom:4px}
.field input{width:100%;padding:10px;border-radius:6px;border:1px solid var(--border-active);background:rgba(0,0,0,0.4);color:#fff;font-size:14px;outline:none;box-sizing:border-box}
.field input:focus{border-color:var(--color-primary)}
.error{color:var(--color-accent);font-size:12px;margin-bottom:8px}
.btn-login{width:100%;padding:12px;border:none;border-radius:6px;background:linear-gradient(135deg,#0077ff,#00e5ff);color:#fff;font-size:15px;font-weight:bold;cursor:pointer;margin-top:8px}
.btn-login:hover{opacity:0.85}
.hint{color:var(--text-dim);font-size:11px;text-align:center;margin-top:16px;line-height:1.6}
</style>
