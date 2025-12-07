const CACHE_NAME = 'siga-v1.0.2';

// Install event - skip waiting to activate immediately
self.addEventListener('install', event => {
  console.log('Service Worker: Installing v1.0.2...');
  self.skipWaiting();
});

// Activate event - clear all old caches and take control
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating v1.0.2...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('Service Worker: Activated and controlling');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, no caching for development
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip caching for development files and API calls
  const url = new URL(event.request.url);
  if (
    url.pathname.includes('node_modules') || 
    url.pathname.includes('.vite') ||
    url.pathname.includes('/@') ||
    url.pathname.includes('/api/') ||
    url.hostname.includes('supabase')
  ) {
    return;
  }

  // Network first strategy
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

// Message handling for updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
