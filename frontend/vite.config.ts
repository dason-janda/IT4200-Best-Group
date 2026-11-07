import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The class API (2026-IT4200-Fall/app.py) runs on port 8000 and doesn't send
// CORS headers, so the dev server proxies /api/* to it. Override the target
// with API_TARGET=http://host:port npm run dev if it lives somewhere else.
const apiTarget = process.env.API_TARGET ?? 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
