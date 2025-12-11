import { useEffect } from 'react';

const useServiceWorker = () => {
  useEffect(() => {
    // Check if service worker is supported in the browser
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Register the service worker
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch((error) => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    }
  }, []);
};

export default useServiceWorker;