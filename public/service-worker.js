const staticCacheName = 'static-cache';
const dynamicCacheName = 'dynamic-cache';

const staticAssets = [
  '/'
];

// Install event for service worker
self.addEventListener('install', evt => {
  self.skipWaiting(); // skip waiting for the new service worker to activate
  evt.waitUntil(
    // Open the static cache and add all static assets
    caches.open(staticCacheName).then(cache => {
      cache.addAll(staticAssets);
    })
  );
});

// Activate event for service worker
self.addEventListener('activate', evt => {
  clients.claim(); // use the new service worker immediately without waiting for the old one to finish
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key != staticCacheName && key != dynamicCacheName).map(key => caches.delete(key)) // delete every cache with different name
      );
    })
  );
});

// Fetch event for service worker
self.addEventListener('fetch', evt => {
  if (evt.request.url.indexOf('firestore.googleapis.com') === -1) {
    evt.respondWith(
      // If there is connection return the result of the fetch, otherwise try to get te resource from the cache
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(async fetchRes => {
          // If there is connection and the fetch return correctly, add the resource to the cache
          return caches.open(dynamicCacheName).then(cache => {
            cache.put(evt.request.url, fetchRes.clone());
            return fetchRes;
          });
        });
      })
    );
  }
});