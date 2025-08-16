// Service Worker pour MaxiMarket
// Gère les notifications push et le cache des ressources

const CACHE_NAME = 'maximarket-v1';
const STATIC_CACHE = 'maximarket-static-v1';
const DYNAMIC_CACHE = 'maximarket-dynamic-v1';

// Ressources à mettre en cache statiquement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/src/main.jsx',
  '/src/index.css'
];

// Installer le Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Cache statique ouvert');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Forcer l'activation immédiate
        return self.skipWaiting();
      })
  );
});

// Activer le Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Prendre le contrôle de toutes les pages
        return self.clients.claim();
      })
  );
});

// Intercepter les requêtes réseau
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers l'API
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Ignorer les requêtes vers Supabase
  if (url.hostname.includes('supabase')) {
    return;
  }

  // Stratégie de cache : Cache First pour les ressources statiques
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image') {
    
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then((fetchResponse) => {
              // Mettre en cache la réponse
              if (fetchResponse && fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              
              return fetchResponse;
            });
        })
    );
    return;
  }

  // Stratégie de cache : Network First pour les pages
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre en cache la réponse
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Fallback vers le cache
          return caches.match(request)
            .then((cachedResponse) => {
    if (cachedResponse) {
      return cachedResponse;
    }

              // Fallback vers la page d'accueil
              return caches.match('/');
            });
        })
    );
    return;
  }

  // Stratégie par défaut : Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mettre en cache la réponse
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        
        return response;
      })
      .catch(() => {
        // Fallback vers le cache
        return caches.match(request);
      })
  );
});

// Gérer les notifications push
self.addEventListener('push', (event) => {
  console.log('Notification push reçue:', event);
  
  if (!event.data) {
    console.log('Aucune donnée dans la notification push');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Données de la notification:', data);
    
    const options = {
      body: data.body || 'Nouvelle notification MaxiMarket',
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      image: data.image,
      tag: data.tag || 'maximarket-notification',
      data: data.data || {},
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [200, 100, 200],
      actions: data.actions || [
        {
          action: 'view',
          title: 'Voir',
          icon: '/favicon.ico'
        },
        {
          action: 'close',
          title: 'Fermer',
          icon: '/favicon.ico'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'MaxiMarket', options)
    );
  } catch (error) {
    console.error('Erreur traitement notification push:', error);
    
    // Notification de fallback
    const fallbackOptions = {
      body: 'Nouvelle notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'maximarket-fallback'
    };

    event.waitUntil(
      self.registration.showNotification('MaxiMarket', fallbackOptions)
    );
  }
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Notification cliquée:', event);
  
  event.notification.close();

  const { action, notification } = event;
  const data = notification.data || {};

  if (action === 'close') {
    return;
  }

  // Action par défaut : ouvrir l'application
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Chercher un client ouvert
        for (const client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            client.focus();
            
            // Naviguer vers la page appropriée si des données sont fournies
            if (data.url) {
              client.navigate(data.url);
            }
            
            return;
          }
        }
        
        // Si aucun client ouvert, en ouvrir un nouveau
        if (clients.openWindow) {
          const url = data.url || '/';
          return clients.openWindow(url);
        }
      })
  );
});

// Gérer la fermeture des notifications
self.addEventListener('notificationclose', (event) => {
  console.log('Notification fermée:', event);
  
  // Ici vous pouvez envoyer des analytics sur la fermeture des notifications
  const data = event.notification.data || {};
  
  // Exemple : envoyer un événement au client principal
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NOTIFICATION_CLOSED',
        data: data
      });
    });
  });
});

// Gérer les messages du client principal
self.addEventListener('message', (event) => {
  console.log('Message reçu du client:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_CACHE':
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      });
      break;
      
    default:
      console.log('Type de message non reconnu:', type);
  }
});

// Gérer les erreurs
self.addEventListener('error', (event) => {
  console.error('Erreur Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Promesse rejetée non gérée:', event.reason);
});

console.log('Service Worker MaxiMarket chargé et prêt !'); 