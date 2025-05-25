import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import tailwindConfig from './tailwind.config.js'
import autoprefixer from 'autoprefixer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/personal-color-app/',
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(tailwindConfig),
        autoprefixer,
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/analyze-image': {
        target: 'http://223.195.111.30:5055/api',
        changeOrigin: true,
      },
    },
  },
})
