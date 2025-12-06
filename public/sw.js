
const CACHE_NAME = 'siga-v1.0.1';
const urlsToCache = [
  '/'
];

// Install event - force update
self.addEventListener('install', event => {
  console.log('Service Worker: Installing v1.0.1...');
  self.skipWaiting();
});

// Activate event - clear all old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating v1.0.1...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Service Worker: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  // Don't cache Vite dev server files
  if (event.request.url.includes('node_modules') || 
      event.request.url.includes('.vite') ||
      event.request.url.includes('/@')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Message handling
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
