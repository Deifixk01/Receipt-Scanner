/* Receipt Logger service worker
 * - App shell (page, manifest, icons): served from cache instantly, refreshed in the background.
 * - OCR engine (./vendor/… or the jsDelivr CDN): cached on first use, then served from cache,
 *   so scanning works offline after you've run OCR once.
 * The GitHub Actions deploy replaces __BUILD__ with the commit id so each deploy gets fresh caches.
 */
const VERSION = '__BUILD__';
const SHELL_CACHE = 'receipts-shell-' + VERSION;
const OCR_CACHE = 'receipts-ocr-v1'; // big files; kept across app updates
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './favicon-32.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('receipts-shell-') && k !== SHELL_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Cache-first: for large, versioned OCR files.
async function cacheFirst(request) {
  const cache = await caches.open(OCR_CACHE);
  const hit = await cache.match(request, { ignoreVary: true });
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok || res.type === 'opaque') cache.put(request, res.clone()).catch(() => {});
  return res;
}

// Stale-while-revalidate: for the app shell.
async function staleWhileRevalidate(event, key) {
  const cache = await caches.open(SHELL_CACHE);
  const hit = await cache.match(key || event.request, { ignoreSearch: true });
  const update = fetch(event.request).then(res => {
    if (res.ok) cache.put(key || event.request, res.clone()).catch(() => {});
    return res;
  }).catch(() => null);
  if (hit) { event.waitUntil(update); return hit; }
  const res = await update;
  return res || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') {
      event.respondWith(staleWhileRevalidate(event, new URL('./index.html', self.registration.scope).href));
      return;
    }
    if (url.pathname.includes('/vendor/')) { event.respondWith(cacheFirst(req)); return; }
    event.respondWith(staleWhileRevalidate(event));
    return;
  }

  // OCR engine / language data from the CDN fallback
  if (url.hostname === 'cdn.jsdelivr.net') { event.respondWith(cacheFirst(req)); return; }
});
