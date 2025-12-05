import { listingService } from './index.js';
import { localCache } from '@/lib/localCache';

// Configuration des durées de vie du cache (TTL)
const CACHE_TTL = {
  listings: 10 * 60 * 1000,       // 10 minutes
  categories: 60 * 60 * 1000,     // 1 heure
  userListings: 5 * 60 * 1000,    // 5 minutes
  searchResults: 15 * 60 * 1000,  // 15 minutes
  heroListings: 30 * 60 * 1000,   // 30 minutes
  popularListings: 10 * 60 * 1000,// 10 minutes
  premiumListings: 5 * 60 * 1000, // 5 minutes
};

/**
 * Génère une clé de cache stable indépendante de l'ordre des propriétés de l'objet
 */
const generateCacheKey = (prefix, obj = {}) => {
  if (!obj) return `${prefix}:all`;
  // Trie les clés pour garantir que {a:1, b:2} donne la même clé que {b:2, a:1}
  const sortedStr = JSON.stringify(
    Object.keys(obj).sort().reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {})
  );
  return `${prefix}:${sortedStr}`;
};

export const cachedListingService = {
  /**
   * Récupère tous les listings avec cache intelligent
   */
  async getAllListings(filters = {}) {
    const cacheKey = generateCacheKey('listings', filters);
    
    const cached = localCache.get(cacheKey);
    if (cached) {
      console.log('📦 Listings (Cache Hit):', cacheKey);
      return cached;
    }

    try {
      console.log('🌐 Listings (API Call)');
      const data = await listingService.getAllListings(filters);
      localCache.set(cacheKey, data, CACHE_TTL.listings);
      return data;
    } catch (error) {
      console.error('❌ Erreur getAllListings:', error);
      throw error;
    }
  },

  /**
   * Récupère un listing par ID
   */
  async getListingById(id) {
    const cacheKey = `listing:${id}`;
    
    const cached = localCache.get(cacheKey);
    if (cached) {
      console.log('📦 Listing ID (Cache Hit):', id);
      return cached;
    }

    try {
      console.log('🌐 Listing ID (API Call):', id);
      const data = await listingService.getListingById(id);
      localCache.set(cacheKey, data, CACHE_TTL.listings);
      return data;
    } catch (error) {
      console.error('❌ Erreur getListingById:', error);
      throw error;
    }
  },

  /**
   * Crée un listing et invalide les caches
   */
  async createListing(listingData) {
    try {
      const data = await listingService.createListing(listingData);
      this._invalidateAllLists(); // On vide toutes les listes car une nouvelle annonce est arrivée
      return data;
    } catch (error) {
      console.error('❌ Erreur createListing:', error);
      throw error;
    }
  },

  /**
   * Met à jour un listing et invalide TOUT ce qui est concerné
   */
  async updateListing(id, updates) {
    try {
      const data = await listingService.updateListing(id, updates);
      
      // 1. Supprimer le cache de cet item spécifique
      localCache.delete(`listing:${id}`);
      
      // 2. Vider les listes (Hero, Search, etc.) car les données (prix, image) ont changé
      this._invalidateAllLists();
      
      return data;
    } catch (error) {
      console.error('❌ Erreur updateListing:', error);
      throw error;
    }
  },

  /**
   * Supprime un listing
   */
  async deleteListing(id) {
    try {
      await listingService.deleteListing(id);
      
      localCache.delete(`listing:${id}`);
      this._invalidateAllLists();
      
      return true;
    } catch (error) {
      console.error('❌ Erreur deleteListing:', error);
      throw error;
    }
  },

  /**
   * Recherche
   */
  async searchListings(query, filters = {}) {
    const cacheKey = `search:${query}:${generateCacheKey('', filters)}`;
    
    const cached = localCache.get(cacheKey);
    if (cached) {
      console.log('📦 Search (Cache Hit)');
      return cached;
    }

    try {
      console.log('🌐 Search (API Call):', query);
      const data = await listingService.searchListings(query, filters);
      localCache.set(cacheKey, data, CACHE_TTL.searchResults);
      return data;
    } catch (error) {
      console.error('❌ Erreur searchListings:', error);
      throw error;
    }
  },

  /**
   * Listings Utilisateur
   */
  async getUserListings(userId) {
    const cacheKey = `userListings:${userId}`;
    
    const cached = localCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const data = await listingService.getUserListings(userId);
      localCache.set(cacheKey, data, CACHE_TTL.userListings);
      return data;
    } catch (error) {
      console.error('❌ Erreur getUserListings:', error);
      throw error;
    }
  },

  /**
   * Catégories (Rarement modifiées, cache long)
   */
  async getCategories() {
    const cacheKey = 'categories';
    const cached = localCache.get(cacheKey);
    if (cached) return cached;

    try {
      const data = await listingService.getCategories();
      localCache.set(cacheKey, data, CACHE_TTL.categories);
      return data;
    } catch (error) {
      console.error('❌ Erreur getCategories:', error);
      throw error;
    }
  },

  // --- SECTIONS SPÉCIALES (Hero, Popular, Premium) ---

  async getHeroListings(limit = 6) {
    const cacheKey = `hero-listings:${limit}`;
    const cached = localCache.get(cacheKey);
    if (cached) return cached;

    try {
      const data = await listingService.getHeroListings(limit);
      localCache.set(cacheKey, data, CACHE_TTL.heroListings);
      return data;
    } catch (error) { throw error; }
  },

  async getTopViewedListings(limit = 10) {
    const cacheKey = `popular-listings:${limit}`;
    const cached = localCache.get(cacheKey);
    if (cached) return cached;

    try {
      const data = await listingService.getTopViewedListings(limit);
      localCache.set(cacheKey, data, CACHE_TTL.popularListings);
      return data;
    } catch (error) { throw error; }
  },

  async getPremiumListings(limit = 10) {
    const cacheKey = `premium-listings:${limit}`;
    const cached = localCache.get(cacheKey);
    if (cached) return cached;

    try {
      const data = await listingService.getPremiumListings(limit);
      localCache.set(cacheKey, data, CACHE_TTL.premiumListings);
      return data;
    } catch (error) { throw error; }
  },

  /**
   * Invalide tous les caches de listes (utilisé après create/update/delete)
   * Nettoie : Listings globaux, recherches, listings user, et sections accueil
   */
  _invalidateAllLists() {
    try {
      console.log('🧹 Invalidation de toutes les listes...');
      
      // On demande au localCache de supprimer par motif (pattern)
      // Note: Cela suppose que localCache.deleteByPattern existe (on l'ajoutera juste après)
      if (typeof localCache.deleteByPattern === 'function') {
        localCache.deleteByPattern('listings:');
        localCache.deleteByPattern('search:');
        localCache.deleteByPattern('userListings:');
        localCache.deleteByPattern('hero-listings');
        localCache.deleteByPattern('popular-listings');
        localCache.deleteByPattern('premium-listings');
      } else {
        // Fallback si la méthode n'existe pas encore
        console.warn('⚠️ localCache.deleteByPattern manquant, nettoyage partiel.');
        localCache.clear(); // Solution radicale de secours
      }
    } catch (error) {
      console.error('❌ Erreur invalidation cache:', error);
    }
  },

  getCacheStats() {
    return localCache.getStats();
  },

  clearCache() {
    localCache.clear();
    console.log('🗑️ Cache vidé manuellement');
  }
};