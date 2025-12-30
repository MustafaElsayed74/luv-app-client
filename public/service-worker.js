// Service Worker for Love Poke App
const CACHE_NAME = 'love-poke-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.scss',
    '/assets/avatars/'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache).catch(() => {
                // It's okay if some resources fail to cache
            });
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Handle push notifications
self.addEventListener('push', event => {
    let notificationData = {
        title: 'Love Poke',
        body: 'You received a notification',
        icon: '/assets/icon.png',
        badge: '/assets/badge.png',
        tag: 'love-poke-notification',
        requireInteraction: false
    };

    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                title: data.title || notificationData.title,
                body: data.body || notificationData.body,
                data: data.data || {}
            };
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            requireInteraction: notificationData.requireInteraction,
            data: notificationData.data || {}
        })
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    // Open the app or bring it to focus
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Check if the app is already open
            for (let client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not open, open a new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }

            return fetch(event.request).then(response => {
                // Don't cache API requests
                if (event.request.url.includes('/api/')) {
                    return response;
                }

                // Cache successful responses
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }

                return response;
            }).catch(() => {
                // Return a fallback response if both cache and network fail
                return new Response('Network request failed', { status: 503 });
            });
        })
    );
});
