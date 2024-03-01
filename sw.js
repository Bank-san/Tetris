let CACHE_NAME = "Tetris";
let urlsToCache = [
  "/Tetris/index.html",
  "/Tetris/start.css",
  "/Tetris/start.js",
  "/Tetris/game.html",
  "/Tetris/style.css",
  "/Tetris/main.js",
  "/Tetris/png/Tetris.png",
  "/Tetris/Tetris.mp3",
];

// インストール処理
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
