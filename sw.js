/* Service Worker — wersja pochodzi z js/version.js (jedno miejsce do podbijania). */
importScripts("./js/version.js");

const CACHE_PREFIX = "dzienniczek-";
const CACHE_NAME = `${CACHE_PREFIX}${APP_VERSION}`;
const SHELL = ["./", "./index.html", "./manifest.json",
  "./css/base.css", "./css/layout.css", "./css/components.css", "./css/calendar.css", "./css/modal.css", "./css/responsive.css", "./css/theme.css", "./css/print.css",
  "./js/version.js", "./js/config.js", "./js/state.js", "./js/symptoms.js", "./js/utils.js", "./js/storage.js", "./js/quotes.js", "./js/auth.js",
  "./js/calendar.js", "./js/statistics.js", "./js/modal.js", "./js/month-view.js", "./js/theme.js", "./js/pwa.js", "./js/app.js",
  "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png",
  "./themes/ksiezyc.webp"];
const NEVER = ["accounts.google.com", "googleapis.com", "google.com"];
const NETWORK_TIMEOUT_MS = 4000;

// install: pobierz powłokę aplikacji z pominięciem cache HTTP (GitHub Pages potrafi trzymać pliki do 10 min)
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

// activate: usuń cache starszych wersji (tylko nasze, z prefiksem) i przejmij otwarte karty
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => {
  const d = e.data || {};
  if (d.type === "SKIP_WAITING") self.skipWaiting();
  if (d.type === "GET_VERSION" && e.source) e.source.postMessage({ type: "VERSION", version: APP_VERSION });
});

// network-first: najpierw sieć (z rewalidacją), przy braku sieci/timeoucie — cache
function networkFirst(req) {
  const cacheFallback = () => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined));
  return caches.match(req, { ignoreSearch: true }).then(cached => {
    const ctrl = typeof AbortController === "function" ? new AbortController() : null;
    const timer = cached && ctrl ? setTimeout(() => ctrl.abort(), NETWORK_TIMEOUT_MS) : null;
    return fetch(req, { cache: "no-cache", signal: ctrl ? ctrl.signal : undefined })
      .then(res => {
        if (timer) clearTimeout(timer);
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => { if (timer) clearTimeout(timer); return cacheFallback(); });
  });
}

self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  if (NEVER.some(h => u.hostname.includes(h))) return;
  if (u.origin !== self.location.origin) return;
  e.respondWith(networkFirst(r).then(res => res || Response.error()));
});
