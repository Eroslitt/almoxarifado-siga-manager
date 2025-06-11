
const CACHE_NAME = 'siga-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installed');
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline fallback for HTML pages
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});

// Background sync
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'sync-reservations') {
    event.waitUntil(syncReservations());
  }
  
  if (event.tag === 'sync-movements') {
    event.waitUntil(syncMovements());
  }
});

// Push notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do SIGA',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Detalhes',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar',
        icon: '/icons/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SIGA - Almoxarifado', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Message handling
self.addEventListener('message', event => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Sync functions
async function syncReservations() {
  try {
    console.log('Service Worker: Syncing reservations...');
    
    // Get pending reservations from IndexedDB
    const db = await openDB();
    const tx = db.transaction(['queue'], 'readonly');
    const store = tx.objectStore('queue');
    const reservations = await store.getAll();
    
    // Process each reservation
    for (const reservation of reservations) {
      if (reservation.table === 'reservations') {
        // Simulate API call
        console.log('Service Worker: Syncing reservation:', reservation.id);
        
        // Remove from queue after successful sync
        const deleteTx = db.transaction(['queue'], 'readwrite');
        const deleteStore = deleteTx.objectStore('queue');
        await deleteStore.delete(reservation.id);
      }
    }
    
    console.log('Service Worker: Reservations synced');
  } catch (error) {
    console.error('Service Worker: Error syncing reservations:', error);
  }
}

async function syncMovements() {
  try {
    console.log('Service Worker: Syncing movements...');
    
    // Similar to syncReservations but for tool movements
    const db = await openDB();
    const tx = db.transaction(['queue'], 'readonly');
    const store = tx.objectStore('queue');
    const movements = await store.getAll();
    
    for (const movement of movements) {
      if (movement.table === 'tool_movements') {
        console.log('Service Worker: Syncing movement:', movement.id);
        
        const deleteTx = db.transaction(['queue'], 'readwrite');
        const deleteStore = deleteTx.objectStore('queue');
        await deleteStore.delete(movement.id);
      }
    }
    
    console.log('Service Worker: Movements synced');
  } catch (error) {
    console.error('Service Worker: Error syncing movements:', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SIGA_Cache', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
