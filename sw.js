// Service Worker no4eye.
// При каждом заметном обновлении сайта меняй номер версии (v1 -> v2), чтобы у пользователей обновился кэш.
var CACHE = 'no4eye-v1';
var ASSETS = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // Страницы: сначала сеть (чтобы видеть свежую версию), при отсутствии интернета берём из кэша.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(function (r) {
      var copy = r.clone();
      caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
      return r;
    }).catch(function () { return caches.match('./index.html'); }));
    return;
  }
  // Остальное: из кэша, иначе из сети.
  e.respondWith(caches.match(e.request).then(function (m) {
    return m || fetch(e.request).then(function (r) {
      var copy = r.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return r;
    });
  }));
});
