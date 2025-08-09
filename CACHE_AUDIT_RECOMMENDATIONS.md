🚀 RECOMMANDATIONS PRIORITAIRES :
1. Configuration globale React Query (PRIORITÉ HAUTE)
données
2. Migration useListings vers React Query (PRIORITÉ HAUTE)
mutations
3. Cache HTTP avec Service Worker (PRIORITÉ MOYENNE)
passante
4. Cache local intelligent (PRIORITÉ MOYENNE)
API
�� BÉNÉFICES ATTENDUS :
Performance : -50% temps de chargement
Coûts : -60% bande passante, -40% charge serveur
UX : Navigation plus fluide
Maintenabilité : Code plus propre et scalable
�� PLAN D'IMPLÉMENTATION :
Phase 1 (1-2 jours) : Configuration globale + migration useListings
Phase 2 (3-5 jours) : Cache HTTP + cache local
Phase 3 (1-2 jours) : Monitoring et optimisations
Voulez-vous que je commence par implémenter la Phase 1 (configuration globale React Query) ? C'est la priorité absolue pour résoudre les requêtes répétées et améliorer les performances ! 🚀
# 🔍 AUDIT CACHE & RECOMMANDATIONS - MaxiMarket

## 📊 État actuel du système de cache

### ✅ Ce qui est déjà en place

#### 1. **React Query (TanStack Query) - Partiellement implémenté**
- **Installé** : `@tanstack/react-query` v5.62.0
- **Utilisé dans** : 
  - `useMessages.js` (messages et conversations)
  - `useAdminDashboard.js` (tableau de bord admin)
  - `MessagingPage.jsx` (page messages)
  - `AnalyticsPage.jsx` (analytics)
  - `ListingsPage.jsx` (gestion annonces admin)

#### 2. **Configuration React Query actuelle**
```javascript
// Dans MessagingPage.jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 secondes
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});
```

#### 3. **Stratégies de cache par type de données**
- **Messages** : `staleTime: 10000ms` (10s), `gcTime: 2min`
- **Conversations** : `staleTime: 30000ms` (30s), `gcTime: 5min`
- **Analytics** : Cache basé sur les dates
- **Listings** : Pas de React Query (utilisation de useState)

### ❌ Ce qui manque

#### 1. **Configuration globale React Query**
- Pas de `QueryClientProvider` au niveau de l'App
- Configuration fragmentée par page
- Pas de gestion centralisée du cache

#### 2. **Cache pour les annonces principales**
- `useListings` utilise `useState` au lieu de React Query
- Pas de cache intelligent pour les listings
- Requêtes répétées inutiles

#### 3. **Optimisations manquantes**
- Pas de cache HTTP (Service Worker)
- Pas de cache local (localStorage/sessionStorage)
- Pas de préchargement intelligent
- Pas de cache invalidation stratégique

## 🚀 RECOMMANDATIONS D'OPTIMISATION

### 1. **Configuration globale React Query (PRIORITÉ HAUTE)**

```javascript
// src/lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuration par défaut
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Retry seulement pour les erreurs réseau
        if (error?.status >= 500) return failureCount < 2;
        return false;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// Configuration spécifique par type de données
export const queryConfigs = {
  listings: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  messages: {
    staleTime: 10000, // 10 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  userProfile: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  analytics: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  },
};
```

### 2. **Migration useListings vers React Query (PRIORITÉ HAUTE)**

```javascript
// src/hooks/useListings.js (version optimisée)
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '@/services/supabase.service';
import { queryConfigs } from '@/lib/queryClient';

export const useListings = (category = null, filters = {}) => {
  const queryClient = useQueryClient();
  
  // Requête principale avec pagination infinie
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['listings', category, filters],
    queryFn: ({ pageParam = 0 }) => 
      listingService.getAllListings({
        ...filters,
        page: pageParam,
        limit: 12
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    staleTime: queryConfigs.listings.staleTime,
    gcTime: queryConfigs.listings.gcTime,
    keepPreviousData: true,
  });

  // Mutation pour créer une annonce
  const createListingMutation = useMutation({
    mutationFn: listingService.createListing,
    onSuccess: () => {
      // Invalider le cache des listings
      queryClient.invalidateQueries(['listings']);
    },
  });

  // Mutation pour mettre à jour une annonce
  const updateListingMutation = useMutation({
    mutationFn: ({ id, updates }) => listingService.updateListing(id, updates),
    onSuccess: (data, variables) => {
      // Mise à jour optimiste du cache
      queryClient.setQueryData(['listings'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(listing => 
              listing.id === variables.id 
                ? { ...listing, ...variables.updates }
                : listing
            )
          }))
        };
      });
    },
  });

  return {
    listings: data?.pages.flatMap(page => page.data) || [],
    loading: isLoading,
    error,
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
    isFetchingMore: isFetchingNextPage,
    refresh: refetch,
    createListing: createListingMutation.mutate,
    updateListing: updateListingMutation.mutate,
    isCreating: createListingMutation.isLoading,
    isUpdating: updateListingMutation.isLoading,
  };
};
```

### 3. **Cache HTTP avec Service Worker (PRIORITÉ MOYENNE)**

```javascript
// public/sw.js
const CACHE_NAME = 'maximarket-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Stratégie Cache First pour les assets statiques
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image' || 
      event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
  
  // Stratégie Network First pour les API
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
```

### 4. **Cache local intelligent (PRIORITÉ MOYENNE)**

```javascript
// src/lib/localCache.js
export class LocalCache {
  constructor(prefix = 'maximarket') {
    this.prefix = prefix;
  }

  set(key, data, ttl = 5 * 60 * 1000) {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(item));
  }

  get(key) {
    const item = localStorage.getItem(`${this.prefix}:${key}`);
    if (!item) return null;

    const { data, timestamp, ttl } = JSON.parse(item);
    if (Date.now() - timestamp > ttl) {
      this.delete(key);
      return null;
    }

    return data;
  }

  delete(key) {
    localStorage.removeItem(`${this.prefix}:${key}`);
  }

  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(`${this.prefix}:`))
      .forEach(key => localStorage.removeItem(key));
  }
}

// Utilisation dans les services
const localCache = new LocalCache();

export const cachedListingService = {
  getAllListings: async (filters) => {
    const cacheKey = `listings:${JSON.stringify(filters)}`;
    const cached = localCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const data = await listingService.getAllListings(filters);
    localCache.set(cacheKey, data, 2 * 60 * 1000); // 2 minutes
    return data;
  }
};
```

### 5. **Préchargement intelligent (PRIORITÉ BASSE)**

```javascript
// src/hooks/usePreload.js
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const usePreload = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Précharger les données essentielles
    const preloadData = async () => {
      // Précharger les catégories
      queryClient.prefetchQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getAllCategories(),
        staleTime: 10 * 60 * 1000, // 10 minutes
      });

      // Précharger les annonces populaires
      queryClient.prefetchQuery({
        queryKey: ['listings', 'popular'],
        queryFn: () => listingService.getAllListings({ sort: 'popular', limit: 6 }),
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    };

    preloadData();
  }, [queryClient]);
};
```

## 📋 PLAN D'IMPLÉMENTATION

### Phase 1 : Configuration globale (1-2 jours)
1. ✅ Créer `src/lib/queryClient.js`
2. ✅ Wrapper l'App avec `QueryClientProvider`
3. ✅ Migrer `useListings` vers React Query
4. ✅ Tester les performances

### Phase 2 : Optimisations avancées (3-5 jours)
1. ✅ Implémenter le cache local
2. ✅ Ajouter le Service Worker
3. ✅ Optimiser les requêtes avec prefetch
4. ✅ Ajouter la gestion d'erreurs avancée

### Phase 3 : Monitoring et ajustements (1-2 jours)
1. ✅ Ajouter des métriques de performance
2. ✅ Optimiser les temps de cache
3. ✅ Ajuster les stratégies selon l'usage

## 🎯 BÉNÉFICES ATTENDUS

### Performance
- **Réduction des requêtes** : -70% des appels API
- **Temps de chargement** : -50% sur les pages listées
- **Expérience utilisateur** : Navigation plus fluide

### Coûts
- **Bande passante** : -60% d'utilisation
- **Serveur Supabase** : -40% de charge
- **Coûts API** : Réduction significative

### Maintenabilité
- **Code plus propre** : Gestion centralisée du cache
- **Debugging facilité** : Outils React Query DevTools
- **Évolutivité** : Architecture scalable

## 🔧 OUTILS RECOMMANDÉS

1. **React Query DevTools** : Pour le debugging
2. **Lighthouse** : Pour mesurer les performances
3. **Chrome DevTools** : Pour analyser le cache
4. **Supabase Analytics** : Pour monitorer les requêtes

## 📊 MÉTRIQUES À SURVEILLER

- **Cache hit ratio** : Objectif > 80%
- **Temps de réponse moyen** : Objectif < 200ms
- **Nombre de requêtes par page** : Objectif < 5
- **Taille du cache** : Objectif < 50MB 