// PWA Push Notifications Hook
// Handles push notification registration, permissions, and message handling

import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  subscription: PushSubscription | null;
  error: string | null;
}

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  vibrate?: number[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    supported: false,
    permission: 'default',
    subscribed: false,
    subscription: null,
    error: null
  });

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      setState(prev => ({
        ...prev,
        supported,
        permission: supported ? Notification.permission : 'denied'
      }));
    };

    checkSupport();
  }, []);

  // Register service worker and get subscription
  const subscribe = useCallback(async () => {
    if (!state.supported) {
      setState(prev => ({ ...prev, error: 'Push notifications not supported' }));
      return false;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'denied') {
        setState(prev => ({ 
          ...prev, 
          permission: 'denied',
          error: 'Notification permission denied'
        }));
        return false;
      }

      if (permission === 'default') {
        setState(prev => ({ 
          ...prev, 
          permission: 'default',
          error: 'Notification permission required'
        }));
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/enhanced-sw.js');
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Get subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setState(prev => ({
        ...prev,
        permission: 'granted',
        subscribed: true,
        subscription,
        error: null
      }));

      // Send subscription to server
      await sendSubscriptionToServer(subscription);

      return true;

    } catch (error) {
      console.error('Push subscription failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Subscription failed'
      }));
      return false;
    }
  }, [state.supported, vapidPublicKey]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    try {
      if (state.subscription) {
        await state.subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/unsubscribe-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: state.subscription })
        });
      }

      setState(prev => ({
        ...prev,
        subscribed: false,
        subscription: null,
        error: null
      }));

      return true;

    } catch (error) {
      console.error('Push unsubscribe failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unsubscribe failed'
      }));
      return false;
    }
  }, [state.subscription]);

  // Show local notification
  const showNotification = useCallback(async (options: PushNotificationOptions) => {
    if (!state.supported || state.permission !== 'granted') {
      console.warn('Push notifications not available');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        return await registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/badge-72x72.png',
          tag: options.tag || 'gurbuz-oyuncak',
          data: options.data,
          actions: options.actions,
          vibrate: options.vibrate || [100, 50, 100],
          requireInteraction: options.requireInteraction ?? true,
          silent: options.silent ?? false,
          timestamp: Date.now()
        });
      }

      // Fallback to regular notification
      return new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
        badge: options.badge || '/badge-72x72.png',
        tag: options.tag || 'gurbuz-oyuncak',
        data: options.data
      });

    } catch (error) {
      console.error('Failed to show notification:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Notification failed'
      }));
      return null;
    }
  }, [state.supported, state.permission]);

  // Send push notification via server
  const sendPushNotification = useCallback(async (data: any) => {
    try {
      const response = await fetch('/api/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          subscription: state.subscription,
          data
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send push notification');
      }

      return true;

    } catch (error) {
      console.error('Send push notification failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Push send failed'
      }));
      return false;
    }
  }, [state.subscription]);

  // Handle notification click
  const onNotificationClick = useCallback((event: NotificationEvent) => {
    event.notification.close();

    const data = event.notification.data;
    const url = data?.url || '/';

    // Focus existing window or open new one
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }, []);

  // Set up service worker message handling
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'BACKGROUND_SYNC_COMPLETE':
            console.log('Background sync completed:', data);
            // You can trigger UI updates here
            break;
          
          case 'CACHE_UPDATED':
            console.log('Cache updated:', data);
            break;
          
          case 'OFFLINE_MODE':
            console.log('App is now offline');
            // Handle offline mode
            break;
          
          case 'ONLINE_MODE':
            console.log('App is now online');
            // Handle online mode
            break;
          
          default:
            console.log('Unknown service worker message:', type);
        }
      });
    }
  }, []);

  // Install prompt handling
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      const result = await deferredPrompt.prompt();
      
      if (result.outcome === 'accepted') {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('App installation failed:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Periodic sync for background updates
  const registerPeriodicSync = useCallback(async () => {
    if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        await (registration as any).periodicSync.register('content-sync', {
          minInterval: 24 * 60 * 60 * 1000, // 24 hours
        });
        
        console.log('Periodic sync registered');
      } catch (error) {
        console.error('Periodic sync registration failed:', error);
      }
    }
  }, []);

  // Background sync for offline actions
  const requestBackgroundSync = useCallback(async () => {
    if ('serviceWorker' in navigator && 'sync' in (window.ServiceWorkerRegistration as any)) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        await (registration as any).sync.register('background-sync');
        
        console.log('Background sync requested');
      } catch (error) {
        console.error('Background sync request failed:', error);
      }
    }
  }, []);

  return {
    // State
    ...state,
    showInstallPrompt,
    
    // Actions
    subscribe,
    unsubscribe,
    showNotification,
    sendPushNotification,
    installApp,
    registerPeriodicSync,
    requestBackgroundSync,
    
    // Event handlers
    onNotificationClick,
    
    // Utility
    clearError: () => setState(prev => ({ ...prev, error: null }))
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Helper function to send subscription to server
async function sendSubscriptionToServer(subscription: PushSubscription) {
  try {
    const response = await fetch('/api/subscribe-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ subscription })
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }

    return true;

  } catch (error) {
    console.error('Failed to send subscription to server:', error);
    return false;
  }
}