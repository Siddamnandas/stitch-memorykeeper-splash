import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import manifest from './public/manifest.json';

const devServiceWorkerCleanup = () => ({
  name: 'dev-service-worker-cleanup',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url) {
        next();
        return;
      }

      if (req.url.startsWith('/sw.js')) {
        res.setHeader('Content-Type', 'application/javascript');
        res.end(`
          self.addEventListener('install', () => self.skipWaiting());
          self.addEventListener('activate', (event) => {
            event.waitUntil(
              Promise.all([
                self.registration.unregister(),
                self.clients.matchAll({ type: 'window' }).then((clients) => {
                  clients.forEach((client) => {
                    client.navigate(client.url);
                  });
                })
              ])
            );
          });
        `);
        return;
      }

      if (req.url.startsWith('/registerSW.js')) {
        res.setHeader('Content-Type', 'application/javascript');
        res.end(`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((regs) => {
              regs.forEach((registration) => {
                registration.unregister().then((didUnregister) => {
                  if (didUnregister) {
                    console.log('[dev] Unregistered stale service worker:', registration.scope);
                  }
                });
              });
            });
          }
        `);
        return;
      }

      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    devServiceWorkerCleanup(),
    react({
      jsxRuntime: 'automatic'
    }),
    VitePWA({
      registerType: 'prompt',
      devOptions: {
        enabled: false
      },
      includeAssets: [
        'offline.html',
        'logo.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-192-maskable.png',
        'icons/icon-512-maskable.png'
      ],
      manifest,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api/, /^\/registerSW\.js/],
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              url.origin.includes('supabase.co') && request.method === 'GET',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-rest-get',
              networkTimeoutSeconds: 6,
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          },
          {
            urlPattern: ({ url, request }) =>
              url.origin.includes('supabase.co') &&
              ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method),
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'supabase-mutation-queue',
                options: {
                  maxRetentionTime: 60 * 24
                }
              }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      injectRegister: 'auto',
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Bundle heavy AI-related chunks separately
          'ai-studio': ['src/components/AiStudio.tsx'],
          'game-components': [
            'src/components/MemoryMatchGame.tsx',
            'src/components/MemoryMatchUpGame.tsx',
            'src/components/MemoryMatchup1.tsx',
            'src/components/MemoryMatchup2.tsx',
            'src/components/StoryQuizQuest1.tsx',
            'src/components/StoryQuizQuest2.tsx',
            'src/components/SnapshotSolve1.tsx',
            'src/components/SnapshotSolve2.tsx',
            'src/components/EchoEcho.tsx',
            'src/components/TimelineTango.tsx'
          ],
          // Keep heavy libraries separate
          'pdf-utils': ['jspdf', 'html2canvas']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
