// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 49170,
    host: true, // Permet l'accès depuis d'autres appareils sur le réseau local
    strictPort: true,
    // 🛡️ Autorisation de tes domaines personnalisés pour contourner la protection DNS rebinding de Vite
    allowedHosts: [
      'www.kaokyserver.ovh',
      'kaokyserver.ovh',
      'localhost',
      '127.0.0.1'
    ],
    // 🔄 Proxy pour éviter les erreurs CORS avec Jellyfin
    proxy: {
      '/api': {
        target: 'http://localhost:49169', // Ton backend Jellyfin
        changeOrigin: true, // Indispensable pour tromper le navigateur sur l'origine
        secure: false, // Si jamais Jellyfin est en HTTPS auto-signé en local
        rewrite: (path) => path.replace(/^\/api/, '') // Enlève le /api avant d'envoyer à Jellyfin
      }
    }
  }
})