import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
          manifest: {
            name: 'تطبيق مياه وادي الدواسر',
            short_name: 'المياه',
            description: 'تطبيق طلب المياه بكل سهولة وسرعة بوادي الدواسر',
            theme_color: '#3B82F6',
            background_color: '#ffffff',
            display: 'standalone',
            icons: [
              {
                src: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Water_drop_icon.svg',
                sizes: '192x192',
                type: 'image/svg+xml'
              },
              {
                src: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Water_drop_icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
