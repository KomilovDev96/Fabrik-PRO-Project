import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Backend origin used by the dev proxy. Mirrors the legacy frontend default.
  const apiOrigin = env.VITE_API_PROXY_TARGET || 'http://46.225.154.145'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      // In dev we call the API with a relative `/api` prefix and let Vite proxy it,
      // so there are no CORS issues and the same code works in prod behind nginx.
      proxy: {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      // Split heavy vendor chunks so the initial bundle stays small (code splitting).
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('antd') || id.includes('@ant-design')) return 'antd'
            if (id.includes('@tanstack')) return 'query'
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod'))
              return 'forms'
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/'))
              return 'react'
            return undefined
          },
        },
      },
    },
  }
})
