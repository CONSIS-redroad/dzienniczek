/*!
 * Dzienniczek samoobserwacji — Service Worker
 * Wersja: 3.0.0  (PWA)
 *
 * Strategia cache:
 *   - Shell aplikacji (HTML/CSS/JS) → Cache First (działa offline)
 *   - Fonty Google → Cache First
 *   - Żądania Google Auth / API → Network Only (nigdy nie cache'uj danych użytkownika)
 *
 * Bezpieczeństwo: Service Worker NIE cache'uje żadnych danych osobowych.
 * Dane dzienniczka żyją wyłącznie w Google (Firestore/Drive) lub RAM sesji.
 */

const CACHE_NAME   = 'dzienniczek-v3-shell-1';
const FONT_CACHE   = 'dzienniczek-v3-fonts-1';

/* Pliki do cache'owania przy instalacji (app shell) */
const SHELL_FILES = [
  './index.html',
  './style.css',
  './app.js',
  './quotes.js',
  './manifest.json',
  './icons/icon.svg',
];

/* URL-e, które NIGDY nie mogą być cache'owane */
const NEVER_CACHE = [
  'accounts.google.com',
  'googleapis.com',
  'firestore.googleapis.com',
  'oauth2.googleapis.com',
];

/* ── INSTALL: pobierz i cache'uj shell ────────────────── */
self.addEventListener('install', event => {
  console.log('[SW] Installing…');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: wyczyść stare cache ───────────────────── */
self.addEventListener('activate', event => {
  console.log('[SW] Activating…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== FONT_CACHE)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH: strategie cache ───────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* 1. Google Auth / API → zawsze sieć, nigdy cache */
  if (NEVER_CACHE.some(host => url.hostname.includes(host))) {
    event.respondWith(fetch(request));
    return;
  }

  /* 2. Fonty Google → Cache First z długim TTL */
  if (url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  /* 3. App shell → Cache First, fallback sieć */
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          /* Cache tylko zasoby z tego samego origin */
          if (url.origin === self.location.origin) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
          }
          return response;
        });
      }).catch(() => {
        /* Offline fallback: zawsze zwróć index.html */
        if (request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
    );
    return;
  }
});

/* ── PUSH (opcja na przyszłość: przypomnienia) ─────────── */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Dzienniczek', {
      body:    data.body   ?? 'Czas na dzisiejszy wpis 🌿',
      icon:    './icons/icon.svg',
      badge:   './icons/icon.svg',
      tag:     'reminder',
      renotify: false,
      data:    { url: '.' },
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('index.html') && 'focus' in client)
          return client.focus();
      }
      return clients.openWindow('.');
    })
  );
});
