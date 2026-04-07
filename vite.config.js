import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Sentia',
        short_name: 'Sentia',
        theme_color: '#FDFBF7',
        icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
      }
    })
  ],
})
