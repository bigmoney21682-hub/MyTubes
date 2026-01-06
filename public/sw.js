// PCC v2 — Auto‑Refresh Service Worker
// Purpose:
//   - Never cache JS/CSS/HTML
//   - Always fetch fresh files from the network
//   - Immediately activate on update
//   - Force all clients to reload

self.addEventListener("install", (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of all pages immediately
  event.waitUntil(self.clients.claim());

  // Force all open tabs to reload so they get the new JS bundle
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          client.navigate(client.url);
        }
      })
  );
});

// Network‑only strategy: never cache anything
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
