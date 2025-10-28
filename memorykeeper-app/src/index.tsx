import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeSentry } from './lib/sentry';
import reportWebVitals from './reportWebVitals';

console.log('index.tsx loading');

// Initialize Sentry as early as possible
initializeSentry();

console.log('index.tsx loading');

if (typeof window !== 'undefined' && import.meta.env.MODE === 'development' && 'serviceWorker' in navigator) {
  const refreshFlagKey = 'memorykeeper-sw-dev-reloaded';
  const hasReloadedThisSession = sessionStorage.getItem(refreshFlagKey) === 'true';

  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => Promise.all(
      registrations.map((registration) =>
        registration.unregister().then((didUnregister) => {
          if (didUnregister) {
            console.log('Unregistered dev service worker:', registration.scope);
          }
        })
      )
    ))
    .then(() => {
      if (navigator.serviceWorker.controller && !hasReloadedThisSession) {
        sessionStorage.setItem(refreshFlagKey, 'true');
        window.location.reload();
      }
    })
    .catch((error) => {
      console.warn('Failed to enumerate service workers during dev cleanup:', error);
    });

  if ('caches' in window) {
    caches
      .keys()
      .then((cacheKeys) => Promise.all(
        cacheKeys
          .filter((key) => key.startsWith('workbox') || key.startsWith('vite-pwa'))
          .map((key) =>
            caches.delete(key).then((deleted) => {
              if (deleted) {
                console.log('Deleted stale PWA cache:', key);
              }
            })
          )
      ))
      .catch((error) => {
        console.warn('Failed to inspect caches during dev cleanup:', error);
      });
  }
}

const container = document.getElementById('root');
if (container) {
  console.log('Root container found, rendering app');
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Track web vitals
  reportWebVitals();
} else {
  console.error('Root container not found!');
}
