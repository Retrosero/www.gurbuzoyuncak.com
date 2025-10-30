/**
 * Service Worker - Offline Support & Caching
 * Gürbüz Oyuncak B2B PWA
 */

const CACHE_NAME = 'gurbuz-b2b-v1.0.0';
const RUNTIME_CACHE = 'gurbuz-runtime-v1.0.0';

// Offline sayfası için gerekli dosyalar
const PRECACHE_URLS = [
    '/public/index.html',
    '/public/products.html',
    '/public/cart.html',
    '/public/css/style.css',
    '/public/js/main.js',
    '/components/css/components.css',
    '/components/js/component-loader.js',
    '/manifest.json',
    // Offline fallback sayfası
    '/offline.html'
];

// Install event - İlk yüklemede cache'i doldur
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Precaching files');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - Eski cache'leri temizle
self.addEventListener('activate', (event) => {
    const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        console.log('Service Worker: Deleting old cache:', cacheToDelete);
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // API istekleri için özel strateji
    if (event.request.url.includes('/backend/api/')) {
        event.respondWith(networkFirst(event.request));
        return;
    }
    
    // Statik dosyalar için cache first
    if (event.request.destination === 'style' || 
        event.request.destination === 'script' || 
        event.request.destination === 'image') {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    
    // HTML sayfaları için network first with cache fallback
    if (event.request.mode === 'navigate') {
        event.respondWith(networkFirst(event.request));
        return;
    }
    
    // Diğerleri için varsayılan strateji
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

/**
 * Cache First Strategy
 * Cache'de varsa cache'den döner, yoksa network'ten alır ve cache'e ekler
 */
async function cacheFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('Fetch failed:', error);
        throw error;
    }
}

/**
 * Network First Strategy
 * Önce network'ten almaya çalışır, başarısız olursa cache'den döner
 */
async function networkFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('Network failed, trying cache:', request.url);
        
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        // Offline fallback sayfası
        if (request.mode === 'navigate') {
            const offlinePage = await caches.match('/offline.html');
            if (offlinePage) {
                return offlinePage;
            }
        }
        
        throw error;
    }
}

/**
 * Background Sync - Çevrimdışı işlemleri senkronize et
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-cart') {
        event.waitUntil(syncCart());
    }
    
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
});

async function syncCart() {
    try {
        // LocalStorage'dan sepet verilerini al ve API'ye gönder
        console.log('Syncing cart data...');
        // Implementation burada yapılacak
        return Promise.resolve();
    } catch (error) {
        console.error('Cart sync failed:', error);
        return Promise.reject(error);
    }
}

async function syncOrders() {
    try {
        // Çevrimdışı oluşturulan siparişleri senkronize et
        console.log('Syncing orders...');
        // Implementation burada yapılacak
        return Promise.resolve();
    } catch (error) {
        console.error('Orders sync failed:', error);
        return Promise.reject(error);
    }
}

/**
 * Push Notifications (Gelecek için hazırlık)
 */
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Yeni bildirim',
        icon: '/public/images/icon-192x192.png',
        badge: '/public/images/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Görüntüle',
                icon: '/public/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Kapat',
                icon: '/public/images/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Gürbüz Oyuncak', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/public/index.html')
        );
    }
});

/**
 * Periodic Background Sync (Gelecek için hazırlık)
 */
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-products') {
        event.waitUntil(updateProductsCache());
    }
});

async function updateProductsCache() {
    try {
        const response = await fetch('/backend/api/products.php');
        const cache = await caches.open(RUNTIME_CACHE);
        
        if (response.ok) {
            await cache.put('/backend/api/products.php', response.clone());
            console.log('Products cache updated');
        }
    } catch (error) {
        console.error('Failed to update products cache:', error);
    }
}

// Message event - Client'tan mesajları dinle
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

console.log('Service Worker: Loaded');
