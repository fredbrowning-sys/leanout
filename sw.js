const CACHE = "delta-v5";
const ASSETS = ["./", "./index.html", "./icon-180.png", "./icon-512.png", "./manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // network-first for the page itself so updates land; cache-first for assets
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => {
      const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)).catch(()=>{});
      return r;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)).catch(()=>{});
    return res;
  }).catch(() => caches.match("./index.html"))));
});
