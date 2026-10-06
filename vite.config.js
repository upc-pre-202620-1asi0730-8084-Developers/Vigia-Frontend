import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const require = createRequire(import.meta.url)
const vigiaMockApi = require('./server/vite-mock-api.cjs')

// https://vite.dev/config/
export default defineConfig({
  base: './',
  // vigiaMockApi serves the json-server mock API at /api/v1 while running `npm run dev`
  plugins: [vue(), vigiaMockApi()],
})
