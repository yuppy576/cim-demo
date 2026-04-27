import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  plugins: [vue(), cesium()],
  publicDir: 'public',
  build: {
    rollupOptions: { input: 'index.html' }
  },
  optimizeDeps: {
    entries: ['index.html']
  }
})
