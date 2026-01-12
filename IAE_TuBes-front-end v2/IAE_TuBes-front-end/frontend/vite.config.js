import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@apollo/client', 'graphql'] // Paksa Vite untuk optimize library ini
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true, // Izinkan modul campuran CJS/ESM
    },
  },
})