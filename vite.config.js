import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      // Cache semua asset agar bisa dibuka offline
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            // Cache halaman navigasi
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
            },
          },
          {
            // Cache asset JS/CSS
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style',
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
              },
            },
          },
          {
            // Cache gambar & font
            urlPattern: ({ request }) =>
              request.destination === 'image' ||
              request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 tahun
              },
            },
          },
        ],
      },

      manifest: {
        name: 'FinTrack Couple',
        short_name: 'FinTrack',
        description: 'Aplikasi keuangan untuk pasangan',
        theme_color: '#F472B6',
        background_color: '#FFF5F9',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'public/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'public/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})