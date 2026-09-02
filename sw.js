// Служебный скрипт: держит копию тренажёра в браузере, чтобы он открывался без интернета.
var CACHE = "fintrainer-v3";
// Книги Excel в этом списке не нужны: они зашиты внутрь index.html
// и сохраняются вместе с ним. Отдельные файлы рядом оставлены для тех,
// кому нужна только таблица, без тренажёра.
var FILES = [
  "./",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./index.html",
  "./manifest.webmanifest"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Сначала сеть, при неудаче — сохранённая копия. Так обновления приходят сразу,
// а без интернета тренажёр всё равно открывается.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (hit) {
        return hit || caches.match("./index.html");
      });
    })
  );
});
