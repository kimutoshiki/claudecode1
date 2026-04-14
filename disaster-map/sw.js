// Service Worker - 有楽自治会 防災マップ
const APP_CACHE = 'yuraku-app-v2';
const TILE_CACHE = 'yuraku-tiles-v1';
const MAX_TILE_ENTRIES = 800;

const PRECACHE_URLS = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/config.js',
  './js/map.js',
  './js/layers.js',
  './js/locate.js',
  './js/ui.js',
  './js/sw-register.js',
  './vendor/leaflet/leaflet.js',
  './vendor/leaflet/leaflet.css',
  './vendor/leaflet/images/marker-icon.png',
  './vendor/leaflet/images/marker-icon-2x.png',
  './vendor/leaflet/images/marker-shadow.png',
  './data/yuraku-boundary.geojson',
  './data/shelters.geojson',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(APP_CACHE).then(function (cache) {
      return cache.addAll(PRECACHE_URLS).catch(function (e) {
        console.warn('[sw] precache partial failure:', e);
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== APP_CACHE && k !== TILE_CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 国土地理院タイル: stale-while-revalidate + LRU 上限
  if (url.hostname === 'cyberjapandata.gsi.go.jp') {
    event.respondWith(tileHandler(req));
    return;
  }

  // 管理ページは常に最新をネット取得 (編集作業用、オフライン不要)
  if (url.origin === self.location.origin &&
      (url.pathname.endsWith('/admin.html') ||
       url.pathname.endsWith('/js/admin.js'))) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(function () {
        return caches.match(req);
      })
    );
    return;
  }

  // データファイルは stale-while-revalidate (キャッシュから即返すが裏で更新)
  if (url.origin === self.location.origin &&
      (url.pathname.endsWith('/data/yuraku-boundary.geojson') ||
       url.pathname.endsWith('/data/shelters.geojson'))) {
    event.respondWith(dataHandler(req));
    return;
  }

  // 同一オリジンのナビゲーション: ネット優先、失敗時は offline.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(function () {
        return caches.match('./index.html').then(function (r) {
          return r || caches.match('./offline.html');
        });
      })
    );
    return;
  }

  // 同一オリジンのアセット: cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(function (cached) {
        return cached || fetch(req).then(function (res) {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(APP_CACHE).then(function (c) { c.put(req, clone); });
          }
          return res;
        }).catch(function () { return cached; });
      })
    );
  }
});

async function dataHandler(req) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(req);
  const networkFetch = fetch(req, { cache: 'no-store' }).then(async function (res) {
    if (res && res.ok) {
      await cache.put(req, res.clone());
    }
    return res;
  }).catch(function () { return cached; });
  return cached || networkFetch;
}

async function tileHandler(req) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(req);
  const networkFetch = fetch(req).then(async function (res) {
    if (res && res.ok) {
      await cache.put(req, res.clone());
      trimTileCache().catch(function () {});
    }
    return res;
  }).catch(function () { return cached; });
  return cached || networkFetch;
}

async function trimTileCache() {
  const cache = await caches.open(TILE_CACHE);
  const keys = await cache.keys();
  if (keys.length <= MAX_TILE_ENTRIES) return;
  const over = keys.length - MAX_TILE_ENTRIES;
  for (let i = 0; i < over; i++) {
    await cache.delete(keys[i]);
  }
}
