/* JOD 2028 — offline cache. index.html: pehle net (naya version), net na ho to cache. Baaki files: cache. */
const C='jod2028-p2';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  const page=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');
  if(page){
    e.respondWith(new Promise(resolve=>{
      let done=false;
      const fromCache=()=>caches.match('./index.html').then(m=>m||caches.match('./'));
      const t=setTimeout(()=>{fromCache().then(m=>{if(m&&!done){done=true;resolve(m)}})},3500);
      fetch(r).then(res=>{clearTimeout(t);if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put('./index.html',cp))}if(!done){done=true;resolve(res)}})
        .catch(()=>{clearTimeout(t);fromCache().then(m=>{if(!done){done=true;resolve(m||Response.error())}})});
    }));
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r)));
});
