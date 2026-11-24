// Sertanejo offline worker: the app's own files are kept on the phone, so it opens with no internet.
// The songs themselves live in the phone's IndexedDB, added by the user, and never touch the network.
const CACHE='sertanejo-v1';
const FILES=['./','index.html','app.js?v=1','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  if(r.mode==='navigate'){e.respondWith(caches.match('index.html').then(c=>c||fetch(r)));return}
  e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(cc=>cc.put(r,cp))}return res})));
});
