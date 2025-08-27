const CACHE_NAME = 'finance-tracker-v2-fix';
const CORE = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e=>{
  if(e.data && e.data.type === 'SKIP_WAITING'){ self.skipWaiting(); }
});

self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  // Prefer network, fall back to cache, cache new GETs
  e.respondWith((async()=>{
    try{
      const resp = await fetch(e.request);
      if(e.request.method === 'GET' && resp && resp.status === 200 && resp.type !== 'opaque'){
        const copy = resp.clone();
        const cache = await caches.open(CACHE_NAME);
        cache.put(e.request, copy);
      }
      return resp;
    }catch(err){
      const cached = await caches.match(e.request);
      return cached || caches.match('./index.html');
    }
  })());
});
