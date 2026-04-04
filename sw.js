const CACHE_NAME = "lang-pwa-v2";
const CACHE_FILES = [
  "/pages/login.html",
  "/pages/index.html",
  "/pages/follow.html",
  "/pages/words.html",
  "/pages/history.html",
  "/pages/member.html",
  "/i18n.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_FILES))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
