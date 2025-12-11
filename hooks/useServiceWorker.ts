import { useEffect } from 'react';

const useServiceWorker = () => {
  useEffect(() => {
    // Check if service worker is supported in the browser
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        // Register the service worker (next-pwa generates this automatically)
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
              console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch((error) => {
              console.log('ServiceWorker registration failed: ', error);
            });
        }
      });
    }
  }, []);
};

export default useServiceWorker;