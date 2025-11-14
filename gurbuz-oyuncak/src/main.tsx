import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { SEOProvider } from './contexts/SEOContext.tsx'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker, runPWADiagnostics } from './utils/pwa-helpers'

// Register Service Worker for PWA functionality (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await registerServiceWorker();
      
      if (registration) {
        console.log('✅ PWA Service Worker registered successfully');
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🆕 New PWA version available');
                const alreadyPrompted = sessionStorage.getItem('pwa_update_prompted');
                if (!alreadyPrompted) {
                  sessionStorage.setItem('pwa_update_prompted', '1');
                  if (confirm('Yeni bir sürüm mevcut. Sayfayı yenilemek ister misiniz?')) {
                    window.location.reload();
                  }
                }
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('❌ PWA Service Worker registration failed:', error);
    }
  });
}

// In development, ensure no service worker controls the page
if ('serviceWorker' in navigator && import.meta.env.DEV) {
  window.addEventListener('load', async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      regs.forEach(r => r.unregister());
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      console.log('🧹 Dev mode: unregistered service workers and cleared caches');
      runPWADiagnostics();
    } catch (e) {
      console.warn('Dev SW cleanup failed', e);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <SEOProvider>
          <App />
        </SEOProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
