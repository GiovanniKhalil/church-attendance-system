import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'logo.jpg', 'church_logo.jpg'],
        manifest: {
          id: '/',
          name: 'كنيسة ماريوحنا بالمعراج التربية الكنسية',
          short_name: 'خدمة ماريوحنا',
          description: 'منظومة إلكترونية متكاملة لخدمة التربية الكنسية ومدارس الأحد بكنيسة القديس يوحنا المعمدان بالمعراج',
          theme_color: '#4d0b1f',
          background_color: '#180810',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          lang: 'ar',
          dir: 'rtl',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'تسجيل حضور المخدومين',
              short_name: 'حضور الأولاد',
              description: 'تسجيل الحضور والغياب للمخدومين والأولاد',
              url: '/?tab=children_attendance',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'تسجيل حضور الخدام',
              short_name: 'حضور الخدام',
              description: 'تسجيل ومتابعة حضور الخدام',
              url: '/?tab=servants_attendance',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'دليل المخدومين',
              short_name: 'المخدومين',
              description: 'بيانات وتفاصيل الأولاد والمخدومين',
              url: '/?tab=children_directory',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'دليل الخدام',
              short_name: 'الخدام',
              description: 'دليل الخدام والمراحل الخدمية',
              url: '/?tab=servants_directory',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
