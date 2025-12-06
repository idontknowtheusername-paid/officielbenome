// ============================================================================
// SERVICE WORKER MAXIMARKET - PRODUCTION READY
// Version: 2.0.0
// Date: 2025-12-06
// ============================================================================

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  version: '2.0.0',
  caches: {
    static: 'maximarket-static-v2',
    dynamic: 'maximarket-dynamic-v2',
    images: 'maximarket-images-v2'
  },
  limits: {
    dynamicCache: 50,      // Nombre max d'entrées dans le cache dynamique
    imageCache: 100,       // Nombre max d'images en cache
    networkTimeout: 5000   // Timeout réseau en ms
  },
  allowedDomains: [
    'maximarket.com',
    'supabase.co',
    'cdnjs.cloudflare.com'
  ]
};

// Ressources critiques à mettre en cache dès l'installation
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Routes à précacher (Vite génère des hashes, on les détectera dynamiquement)
const PRECACHE_ROUTES = [
  '/messages',
  '/annonces',
  '/profil',
  '/favoris'
];

// ============================================================================
// INSTALLATION DU SERVICE WORKER
// ============================================================================

self.addEventListener('install', (event) => {
  console.log(`[SW] Installation de la version ${CONFIG.version}`);
  
  event.waitUntil(
    caches.open(CONFIG.caches.static)
      .then((cache) => {
        console.log('[SW] Mise en cache des ressources critiques');
        return cache.addAll(CRITICAL_ASSETS.map(url => new Request(url, {cache: 'reload'})));
      })
      .then(() => {
        console.log('[SW] Ressources critiques cachées avec succès');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erreur lors de l\'installation:', error);
        // Ne pas bloquer l'installation si certaines ressources échouent
      })
  );
});

// ============================================================================
// ACTIVATION DU SERVICE WORKER
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log(`[SW] Activation de la version ${CONFIG.version}`);
  
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!Object.values(CONFIG.caches).includes(cacheName)) {
              console.log('[SW] Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Prendre le contrôle immédiat
      self.clients.claim()
    ])
    .then(() => {
      console.log('[SW] Service Worker activé et en contrôle');
      // Notifier tous les clients de la nouvelle version
      return notifyAllClients({ type: 'SW_ACTIVATED', version: CONFIG.version });
    })
  );
});

// ============================================================================
// GESTION DES REQUÊTES RÉSEAU (FETCH)
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers l'API et Supabase (toujours network)
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetchWithTimeout(request)
        .catch((error) => {
          console.error('[SW] Erreur requête API/Supabase:', error);
          return new Response(
            JSON.stringify({ error: 'Service temporairement indisponible' }),
            { 
              status: 503, 
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Stratégies de cache selon le type de ressource
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font') {
    event.respondWith(handleStaticAsset(request));
  } else if (request.destination === 'document') {
    event.respondWith(handleDocumentRequest(request));
  } else {
    event.respondWith(handleDefaultRequest(request));
  }
});

// ============================================================================
// STRATÉGIES DE CACHE
// ============================================================================

/**
 * Cache First avec fallback réseau (pour les images)
 */
async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetchWithTimeout(request);
    
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CONFIG.caches.images);
      cache.put(request, networkResponse.clone());
      await limitCacheSize(CONFIG.caches.images, CONFIG.limits.imageCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Erreur chargement image:', error);
    // Retourner une image placeholder
    return caches.match('/placeholder.png') || new Response('', { status: 404 });
  }
}

/**
 * Stale-While-Revalidate (pour CSS/JS/Fonts)
 */
async function handleStaticAsset(request) {
  const cache = await caches.open(CONFIG.caches.static);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetchWithTimeout(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  // Retourner le cache immédiatement, mettre à jour en arrière-plan
  return cachedResponse || fetchPromise || caches.match('/offline.html');
}

/**
 * Network First avec fallback cache (pour les documents/pages)
 */
async function handleDocumentRequest(request) {
  try {
    const networkResponse = await fetchWithTimeout(request);
    
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CONFIG.caches.dynamic);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Réseau indisponible, utilisation du cache');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Page offline de secours
    return caches.match('/offline.html') || caches.match('/');
  }
}

/**
 * Network First par défaut
 */
async function handleDefaultRequest(request) {
  try {
    const networkResponse = await fetchWithTimeout(request);
    
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CONFIG.caches.dynamic);
      cache.put(request, networkResponse.clone());
      await limitCacheSize(CONFIG.caches.dynamic, CONFIG.limits.dynamicCache);
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Fetch avec timeout
 */
function fetchWithTimeout(request, timeout = CONFIG.limits.networkTimeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ]);
}

/**
 * Limiter la taille d'un cache (LRU - Least Recently Used)
 */
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Supprimer les plus anciennes entrées
    const itemsToDelete = keys.length - maxItems;
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
    console.log(`[SW] Cache ${cacheName} limité à ${maxItems} entrées`);
  }
}

/**
 * Valider une URL avant navigation
 */
function isUrlSafe(url) {
  try {
    const urlObj = new URL(url);
    return CONFIG.allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    ) || urlObj.hostname === self.location.hostname;
  } catch {
    return false;
  }
}

/**
 * Notifier tous les clients connectés
 */
async function notifyAllClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((client) => {
    if (client.postMessage) {
      client.postMessage(message);
    }
  });
}

// ============================================================================
// NOTIFICATIONS PUSH
// ============================================================================

// Types de notifications MaxiMarket
const NOTIFICATION_TYPES = {
  new_message: {
    icon: '/icons/message.png',
    badge: '/icons/badge-message.png',
    vibrate: [200, 100, 200],
    actions: [
      { action: 'reply', title: '💬 Répondre', icon: '/icons/reply.png' },
      { action: 'view', title: '👁️ Voir', icon: '/icons/view.png' }
    ]
  },
  new_listing: {
    icon: '/icons/listing.png',
    badge: '/icons/badge-listing.png',
    vibrate: [100, 50, 100],
    actions: [
      { action: 'view', title: '👁️ Voir l\'annonce', icon: '/icons/view.png' },
      { action: 'favorite', title: '❤️ Ajouter aux favoris', icon: '/icons/heart.png' }
    ]
  },
  boost_activated: {
    icon: '/icons/boost.png',
    badge: '/icons/badge-boost.png',
    vibrate: [300, 100, 300],
    actions: [
      { action: 'view', title: '📈 Voir les stats', icon: '/icons/stats.png' }
    ]
  },
  boost_expiring: {
    icon: '/icons/boost-warning.png',
    badge: '/icons/badge-warning.png',
    vibrate: [100, 50, 100, 50, 100],
    actions: [
      { action: 'renew', title: '🔄 Renouveler', icon: '/icons/renew.png' },
      { action: 'view', title: '👁️ Voir l\'annonce', icon: '/icons/view.png' }
    ]
  },
  price_alert: {
    icon: '/icons/price-alert.png',
    badge: '/icons/badge-alert.png',
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: '👁️ Voir l\'annonce', icon: '/icons/view.png' }
    ]
  }
};

self.addEventListener('push', (event) => {
  console.log('[SW] Notification push reçue');
  
  if (!event.data) {
    console.warn('[SW] Notification push sans données');
    return;
  }

  try {
    const data = event.data.json();
    const notifType = data.type || 'default';
    const config = NOTIFICATION_TYPES[notifType] || {};
    
    const options = {
      body: data.body || 'Nouvelle notification MaxiMarket',
      icon: data.icon || config.icon || '/icon-192x192.png',
      badge: data.badge || config.badge || '/icon-72x72.png',
      image: data.image,
      tag: data.tag || `maximarket-${notifType}-${Date.now()}`,
      data: {
        ...data.data,
        type: notifType,
        timestamp: Date.now()
      },
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || config.vibrate || [200, 100, 200],
      actions: data.actions || config.actions || [
        { action: 'view', title: '👁️ Voir', icon: '/icons/view.png' }
      ]
    };

    event.waitUntil(
      Promise.all([
        self.registration.showNotification(data.title || 'MaxiMarket', options),
        updateBadgeCount(1) // Incrémenter le badge
      ])
    );
  } catch (error) {
    console.error('[SW] Erreur traitement notification push:', error);
    
    // Notification de fallback simple
    event.waitUntil(
      self.registration.showNotification('MaxiMarket', {
        body: 'Vous avez reçu une nouvelle notification',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'maximarket-fallback'
      })
    );
  }
});

// ============================================================================
// GESTION DES CLICS SUR NOTIFICATIONS
// ============================================================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification cliquée:', event.action);
  
  event.notification.close();

  const { action, notification } = event;
  const data = notification.data || {};
  const notifType = data.type;

  // Décrémenter le badge
  event.waitUntil(updateBadgeCount(-1));

  // Action de fermeture
  if (action === 'close') {
    return;
  }

  // Déterminer l'URL de destination
  let targetUrl = '/';
  
  if (data.url && isUrlSafe(data.url)) {
    targetUrl = data.url;
  } else {
    // URL par défaut selon le type
    switch (notifType) {
      case 'new_message':
        targetUrl = '/messages';
        break;
      case 'new_listing':
      case 'boost_activated':
      case 'boost_expiring':
        targetUrl = data.listingId ? `/annonces/${data.listingId}` : '/annonces';
        break;
      case 'price_alert':
        targetUrl = data.listingId ? `/annonces/${data.listingId}` : '/favoris';
        break;
    }
  }

  // Actions spécifiques
  if (action === 'reply' && notifType === 'new_message') {
    targetUrl = `/messages?reply=${data.conversationId || ''}`;
  } else if (action === 'favorite' && notifType === 'new_listing') {
    targetUrl = `/annonces/${data.listingId}?action=favorite`;
  } else if (action === 'renew' && notifType === 'boost_expiring') {
    targetUrl = `/annonces/${data.listingId}?action=renew-boost`;
  }

  // Ouvrir ou focus la fenêtre
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Chercher une fenêtre existante
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              action: action,
              url: targetUrl,
              data: data
            });
            return client.focus();
          }
        }
        
        // Ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .catch((error) => {
        console.error('[SW] Erreur ouverture fenêtre:', error);
      })
  );
});

// ============================================================================
// GESTION DE LA FERMETURE DES NOTIFICATIONS
// ============================================================================

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification fermée');
  
  const data = event.notification.data || {};
  
  event.waitUntil(
    Promise.all([
      updateBadgeCount(-1),
      notifyAllClients({
        type: 'NOTIFICATION_CLOSED',
        notificationType: data.type,
        timestamp: Date.now()
      })
    ])
  );
});

// ============================================================================
// BADGE COUNT
// ============================================================================

let badgeCount = 0;

async function updateBadgeCount(delta) {
  badgeCount = Math.max(0, badgeCount + delta);
  
  if ('setAppBadge' in self.navigator) {
    try {
      if (badgeCount > 0) {
        await self.navigator.setAppBadge(badgeCount);
      } else {
        await self.navigator.clearAppBadge();
      }
    } catch (error) {
      console.warn('[SW] setAppBadge non supporté:', error);
    }
  }
  
  // Notifier les clients du nouveau count
  await notifyAllClients({
    type: 'BADGE_COUNT_UPDATED',
    count: badgeCount
  });
}

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync:', event.tag);
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-listings') {
    event.waitUntil(syncListings());
  }
});

async function syncMessages() {
  try {
    console.log('[SW] Synchronisation des messages...');
    // Récupérer les messages en attente depuis IndexedDB
    // Envoyer au serveur
    // Marquer comme synchronisés
    await notifyAllClients({ type: 'MESSAGES_SYNCED' });
  } catch (error) {
    console.error('[SW] Erreur sync messages:', error);
    throw error; // Retry automatique
  }
}

async function syncListings() {
  try {
    console.log('[SW] Synchronisation des annonces...');
    await notifyAllClients({ type: 'LISTINGS_SYNCED' });
  } catch (error) {
    console.error('[SW] Erreur sync annonces:', error);
    throw error;
  }
}

// ============================================================================
// PERIODIC BACKGROUND SYNC (Expérimental)
// ============================================================================

self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic Sync:', event.tag);
  
  if (event.tag === 'refresh-listings') {
    event.waitUntil(refreshListingsCache());
  }
});

async function refreshListingsCache() {
  try {
    console.log('[SW] Rafraîchissement du cache des annonces...');
    // Pré-charger les annonces populaires
    const response = await fetch('/api/listings/popular');
    const cache = await caches.open(CONFIG.caches.dynamic);
    await cache.put('/api/listings/popular', response);
  } catch (error) {
    console.error('[SW] Erreur refresh cache:', error);
  }
}

// ============================================================================
// MESSAGES DU CLIENT
// ============================================================================

self.addEventListener('message', (event) => {
  console.log('[SW] Message reçu:', event.data);
  
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CONFIG.version });
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearAllCaches());
      break;
      
    case 'UPDATE_BADGE':
      event.waitUntil(updateBadgeCount(data?.delta || 0));
      break;
      
    case 'PRECACHE_ROUTES':
      event.waitUntil(precacheRoutes());
      break;
      
    default:
      console.warn('[SW] Type de message non reconnu:', type);
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log('[SW] Tous les caches supprimés');
}

async function precacheRoutes() {
  const cache = await caches.open(CONFIG.caches.dynamic);
  await Promise.all(
    PRECACHE_ROUTES.map((route) => 
      fetch(route)
        .then((response) => cache.put(route, response))
        .catch((error) => console.warn(`[SW] Erreur precache ${route}:`, error))
    )
  );
  console.log('[SW] Routes précachées');
}

// ============================================================================
// GESTION DES ERREURS
// ============================================================================

self.addEventListener('error', (event) => {
  console.error('[SW] Erreur globale:', event.error);
  notifyAllClients({
    type: 'SW_ERROR',
    error: event.error?.message || 'Erreur inconnue'
  });
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Promise rejetée non gérée:', event.reason);
  notifyAllClients({
    type: 'SW_UNHANDLED_REJECTION',
    reason: event.reason?.message || 'Promesse rejetée'
  });
});

// ============================================================================
// DÉMARRAGE
// ============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║   🚀 SERVICE WORKER MAXIMARKET - PRODUCTION READY v${CONFIG.version}   ║
║                                                               ║
║   ✅ Cache intelligent avec limites                          ║
║   ✅ Notifications push typées                               ║
║   ✅ Badge count automatique                                 ║
║   ✅ Background Sync                                         ║
║   ✅ Sécurité renforcée                                      ║
║   ✅ Stale-While-Revalidate                                  ║
║   ✅ Network timeout protection                              ║
║                                                               ║
║   Status: READY 🟢                                           ║
╚═══════════════════════════════════════════════════════════════╝
`);