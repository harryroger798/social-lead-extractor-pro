import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const isElectron = process.env.ELECTRON_BUILD === 'true'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.ELECTRON': JSON.stringify(isElectron),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  // For Electron builds, use relative paths
  base: isElectron ? './' : '/',
})
