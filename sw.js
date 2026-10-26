// Block English — офлайн-режим.
// С интернетом берёт свежую версию с сервера (и сохраняет её), без интернета — из памяти телефона.
const CACHE = "blockenglish-v3";
const FILES = ["./", "./index.html", "./icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(p, ms) {
  return new Promise((ok, fail) => { const t = setTimeout(() => fail(new Error("timeout")), ms); p.then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); fail(e); }); });
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    withTimeout(fetch(req, { cache: "no-cache" }), 4000)
      .then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("./index.html")))
  );
});
