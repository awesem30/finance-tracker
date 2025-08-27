const CACHE_NAME = 'finance-tracker-v1';
const ASSETS = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
      if(e.request.method==='GET'){
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request, copy));
      }
      return resp;
    }).catch(()=>caches.match('./index.html')))
  );
});