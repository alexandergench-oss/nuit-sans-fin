// Garde une copie du jeu sur l'appareil : une fois chargé, il se relance vite et fonctionne même sans réseau.
// VERSION est remplacée à chaque publication (tools/publish.sh) : l'ancienne copie est alors jetée.
const VERSION = '20261114023228';
const CACHE = `nuit-sans-fin-${VERSION}`;
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin || request.headers.has('range')) return;
  const keep = (response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone())).catch(() => undefined);
    return response;
  };
  // La page elle-même : toujours la plus récente quand il y a du réseau. Le reste : la copie locale d'abord.
  if (request.mode === 'navigate') event.respondWith(fetch(request).then(keep).catch(() => caches.match(request, { ignoreSearch: true })));
  else event.respondWith(caches.match(request).then((hit) => hit ?? fetch(request).then(keep)));
});
