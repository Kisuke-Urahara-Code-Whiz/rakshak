import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ['maplibre-gl']
  },

  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'rakshak.tech',
      '.rakshak.tech',
      'www.rakshak.tech',
      'telesthetic-tridimensionally-margarete.ngrok-free.dev'
    ]
  },

  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true
  }
})