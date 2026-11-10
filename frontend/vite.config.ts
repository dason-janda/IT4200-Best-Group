import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The class API (2026-IT4200-Fall/app.py) is hosted on Render. It doesn't send
// CORS headers, so the browser can't call it directly; instead the dev server
// proxies /api/* to it. To use a locally running copy instead:
//   API_TARGET=http://localhost:8000 npm run dev
const apiTarget = process.env.API_TARGET ?? 'https://two026-it4200-fall.onrender.com'

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
