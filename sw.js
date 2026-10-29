/* Ordenaqr · service worker: recibe los avisos de pedidos aunque la app esté cerrada. No guarda nada en caché. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { /* sin datos */ }
  const title = String(d.title || 'Nuevo pedido').slice(0, 80);
  e.waitUntil(self.registration.showNotification(title, {
    body: String(d.body || '').slice(0, 200),
    icon: 'icon-192.png', badge: 'icon-192.png',
    tag: 'pedido', renotify: true, requireInteraction: true,
    vibrate: [250, 120, 250, 120, 250],
    data: { url: './' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const todas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of todas) { if ('focus' in c) { await c.focus(); if ('navigate' in c) { try { await c.navigate('./'); } catch { /* ya está */ } } return; } }
    await self.clients.openWindow('./');
  })());
});
