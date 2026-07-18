const CACHE_VERSION = "schnapsen-pwa-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

function buildGermanDeckAssets() {
  const suits = ["eichel", "blatt", "herz", "schellen"];
  const ranks = ["ass", "10", "könig", "ober", "unter", "9", "8", "7", "6"];
  const assets = [];
  for (const suit of suits) {
    assets.push(`./img/deck/merkel_deutsch/suits/${suit}.svg`);
    for (const rank of ranks) {
      assets.push(
        `./img/deck/merkel_deutsch/${suit}_${encodeURIComponent(rank)}.svg`,
      );
    }
  }
  assets.push("./img/deck/merkel_deutsch/carte_german_double_back.svg");
  assets.push("./img/deck/merkel_deutsch/carte_german_double_sheet.svg");
  return assets;
}

const APP_SHELL_ASSETS = [
  "./",
  "./index.html",
  "./index.js",
  "./manifest.json",
  "./css/index.css",
  "./css/game.css",
  "./config/configuration.js",
  "./config/constants.js",
  "./config/messages.js",
  "./core/card.js",
  "./core/dealing.js",
  "./core/deck.js",
  "./core/game-engine.js",
  "./core/game-state.js",
  "./core/rules.js",
  "./core/scoring.js",
  "./ai/ai-manager.js",
  "./persistence/persistence-manager.js",
  "./ui/game-controller.js",
  "./ui/game-view.js",
  "./img/icons/favicon.ico",
  "./img/icons/Schnapsen32.png",
  "./img/icons/Schnapsen48.png",
  "./img/icons/Schnapsen60.png",
  "./img/icons/Schnapsen64.png",
  "./img/icons/Schnapsen90.png",
  "./img/oliver_card_playing.jpg",
  ...buildGermanDeckAssets(),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("./index.html")));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request).then((response) => {
        const responseClone = response.clone();
        caches
          .open(RUNTIME_CACHE)
          .then((cache) => cache.put(request, responseClone));
        return response;
      });
    }),
  );
});
