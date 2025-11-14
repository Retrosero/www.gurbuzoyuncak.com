// PWA Helper Functions
// Test ve development için PWA yardımcı fonksiyonları

// Service Worker registration helper
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/enhanced-sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Update service worker
export const updateServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration) {
      await registration.update();
      return true;
    }
  }
  return false;
};

// Check if app is running as PWA
export const isPWARunning = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Get app install prompt
export const getInstallPrompt = (): Promise<any> => {
  return new Promise((resolve) => {
    let deferredPrompt: any;
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      resolve(deferredPrompt);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      resolve(null);
    }, 5000);
  });
};

// Test push notification permission
export const testNotificationPermission = (): NotificationPermission => {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Send test notification
export const sendTestNotification = (): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Gürbüz Oyuncak PWA Test', {
      body: 'PWA bildirimleri çalışıyor! 🎉',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'test-notification'
    });
  }
};

// Test offline functionality
export const testOfflineCapability = (): boolean => {
  return 'serviceWorker' in navigator && 'caches' in window;
};

// Clear all caches
export const clearAllCaches = async (): Promise<boolean> => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    return true;
  }
  return false;
};

// Get cache size
export const getCacheSize = async (): Promise<number> => {
  if ('caches' in window) {
    let totalSize = 0;
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  }
  return 0;
};

// Simulate slow network (development only)
export const simulateSlowNetwork = (delayMs: number = 3000): void => {
  if (process.env.NODE_ENV === 'development') {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return originalFetch(...args);
    };
  }
};

// Force app update
export const forceAppUpdate = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        registration.update();
        
        // Post message to skip waiting
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    });
  }
};

// PWA diagnostics
export const runPWADiagnostics = () => {
  console.group('🔍 PWA Diagnostics');
  
  console.log('✅ Service Worker:', 'serviceWorker' in navigator);
  console.log('✅ Push Notifications:', 'PushManager' in window);
  console.log('✅ Notifications:', 'Notification' in window);
  console.log('✅ Background Sync:', 'sync' in ServiceWorkerRegistration.prototype);
  console.log('✅ Periodic Sync:', 'periodicSync' in ServiceWorkerRegistration.prototype);
  console.log('✅ Cache API:', 'caches' in window);
  console.log('✅ PWA Mode:', isPWARunning());
  console.log('✅ Online Status:', navigator.onLine);
  
  console.groupEnd();
  
  return {
    serviceWorker: 'serviceWorker' in navigator,
    pushNotifications: 'PushManager' in window,
    notifications: 'Notification' in window,
    backgroundSync: 'sync' in ServiceWorkerRegistration.prototype,
    cacheAPI: 'caches' in window,
    pwaMode: isPWARunning(),
    onlineStatus: navigator.onLine
  };
};

// Export all functions
export default {
  registerServiceWorker,
  updateServiceWorker,
  isPWARunning,
  getInstallPrompt,
  testNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  testOfflineCapability,
  clearAllCaches,
  getCacheSize,
  simulateSlowNetwork,
  forceAppUpdate,
  runPWADiagnostics
};