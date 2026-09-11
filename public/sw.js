/**
 * Service Worker para Zenith PWA
 * Habilita instalação no Android/iOS/Desktop e suporte a cache offline
 */

const CACHE_NAME = "zenith-pwa-v12";

const PRECACHE_RESOURCES = [
  "/",
  "/favicon.svg",
  "/favicon.ico",
  "/manifest.json",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
  "/apple-touch-icon.png",
];

// Instalação: pré-cache dos recursos estáticos essenciais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Ativação: limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Interceptação de requisições
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Ignora chamadas de API externas ou esquemas não-HTTP
  if (!url.protocol.startsWith("http")) return;

  // Para navegações de página (HTML/SPA)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match(event.request);
        return cached || caches.match("/");
      })
    );
    return;
  }

  // Network-first com fallback para cache e atualização em segundo plano
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
