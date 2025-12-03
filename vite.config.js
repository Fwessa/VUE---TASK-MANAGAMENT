import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.js",

    // 🔥 Enable Vitest UI
    ui: true,

    // 🔥 Enable Coverage
    coverage: {
      provider: "v8",          // v8 = fastest, recommended
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
