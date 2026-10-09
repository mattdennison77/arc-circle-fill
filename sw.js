const CACHE_NAME = 'coord-stepper-v1.4.5';
const ASSETS = [
  '/arc-circle-fill/stepper.html',
  '/arc-circle-fill/manifest.json',
  '/arc-circle-fill/sw.js',
];

// Install — cache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - App shell (stepper.html, manifest) → cache first
// - GitHub API (CSV data) → network always, never cache
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Always fetch CSV fresh from GitHub API — never cache it
  if (url.includes('api.github.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // App shell — cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
