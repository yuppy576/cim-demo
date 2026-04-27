<template>
  <nav class="top-navbar">
    <button
      v-for="item in menuItems"
      :key="item.id"
      :class="['nav-btn', { active: currentModule === item.id }]"
      @click="$emit('switch', item.id)"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup>
defineProps({
  menuItems: Array,
  currentModule: String
})
defineEmits(['switch'])
</script>

<style scoped>
.top-navbar {
  display: flex;
  gap: 4px;
  background: var(--bg-panel);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 4px 8px;
  box-shadow: var(--glow-primary);
}
.nav-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  white-space: nowrap;
}
.nav-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.nav-btn.active {
  background: var(--color-primary-dim);
  border-color: var(--border-active);
  color: var(--color-primary);
  text-shadow: var(--glow-primary);
}
.nav-icon { font-size: 1rem; }
</style>
