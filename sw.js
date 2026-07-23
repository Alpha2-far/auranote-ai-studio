/**
 * AuraNote AI Studio - Service Worker
 * TASK-005 Implementation
 */

const CACHE_NAME = 'auranote-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/icon.svg',
  '/css/main.css',
  '/css/auras.css',
  '/css/zen-editor.css',
  '/js/config.js',
  '/js/app.js',
  '/js/models/Note.js',
  '/js/services/StorageService.js',
  '/js/services/LocalFileSyncService.js',
  '/js/services/SmartPasteService.js',
  '/js/utils/sanitizer.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => console.warn('Cache warning:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Gestion de la route Web Share Target
  if (url.hash.includes('share-target') || url.pathname.includes('share-target')) {
    event.respondWith(Response.redirect('/' + url.search, 303));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => caches.match('/index.html'));
    })
  );
});
