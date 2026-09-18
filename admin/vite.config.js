import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['maplibre-gl']
  },
  server: {
    allowedHosts: [
      'telesthetic-tridimensionally-margarete.ngrok-free.dev'
    ]
  }
})