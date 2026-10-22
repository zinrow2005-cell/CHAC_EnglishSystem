/* CHAC英文系統 v63.0 — scoped GitHub Pages PWA service worker */
const CACHE = 'chac-english-v630-shell';
const MEDIA = 'chac-english-v630-media';
const MAX_MEDIA_ITEMS = 260;
const SHELL = [
  './', './index.html', './style.css', './app.js', './data.js', './lesson.js',
  './v55-ui.js', './game-scope.js', './spell-game.js', './v3.js', './v6.js', './v11.js', './v16.js', './v17.js', './v20.js',
  './clipmap.js', './teacher-segments.js', './addons/manifest.js', './pwa-register.js',
  './manifest.webmanifest', './assets/pwa/icon-192.png', './assets/pwa/icon-512.png',
  './assets/pwa/icon-180.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('chac-english-') && k !== CACHE && k !== MEDIA).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
async function mediaCached(request) {
  const cache = await caches.open(MEDIA);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response && response.ok && response.type !== 'opaque') {
    await cache.put(request, response.clone());
    const keys = await cache.keys();
    if (keys.length > MAX_MEDIA_ITEMS) await cache.delete(keys[0]);
  }
  return response;
}
async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request, {ignoreSearch:true});
    if (cached) return cached;
    if (request.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
    throw error;
  }
}
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  // Native media players use HTTP Range requests. Let the browser handle these.
  if (request.headers.has('range')) return;
  const relative = url.pathname.slice(new URL(self.registration.scope).pathname.length);
  if (/^(assets\/|audio\/)/.test(relative)) {
    event.respondWith(mediaCached(request).catch(() => caches.match(request)));
  } else {
    event.respondWith(networkFirst(request));
  }
});
