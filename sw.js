// Network-first strategy: always try the network, fall back to cache only when offline.
// This means uploading new files to GitHub updates the app automatically.
// index.html / sw.js / manifest.json を変えたら CACHE_NAME を1つ上げる。
const CACHE_NAME = 'yayjob-v9';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // HTTP キャッシュ（GitHub Pages は max-age=600）を通さずに取り直す
      cache.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 同じオリジン: ネットワーク優先（HTTP キャッシュも確認し直す）、オフライン時はキャッシュ
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
        .then(resp => {
          if (resp && resp.status === 200) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return resp;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true })
            .then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))
        )
    );
    return;
  }

  // Google Fonts: ネットワーク優先、取れたものは控えておき、オフライン時に使う
  if (FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(
      fetch(req)
        .then(resp => {
          if (resp && (resp.ok || resp.type === 'opaque')) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return resp;
        })
        .catch(() => caches.match(req))
    );
  }
});
