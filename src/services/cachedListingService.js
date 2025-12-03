import { listingService } from './index.js';
import { localCache } from '@/lib/localCache';

// Configuration des TTL par type de données (optimisée)
const CACHE_TTL = {
  listings: 10 * 60 * 1000, // 10 minutes
  categories: 60 * 60 * 1000, // 1 heure
  userListings: 5 * 60 * 1000, // 5 minutes
  searchResults: 15 * 60 * 1000, // 15 minutes
  heroListings: 30 * 60 * 1000, // 30 minutes pour les hero listings
  popularListings: 10 * 60 * 1000, // 10 minutes pour les populaires
  premiumListings: 5 * 60 * 1000, // 5 minutes pour les premium (réduit pour voir rapidement les nouveaux boosts)
};

export const cachedListingService = {
  /**
   * Récupère tous les listings avec cache intelligent
   */
  async getAllListings(filters = {}) {
    const cacheKey = `listings:${JSON.stringify(filters)}`;
    
    // Essayer le cache local d'abord
    const cached = localCache.get(cacheKey);
    if (cached) {
      console.log('📦 Données récupérées du cache local:', cacheKey);
      return cached;
    }

    try {
      // Appel API si pas en cache
      console.log('🌐 Appel API pour récupérer les listings');
      const data = await listingService.getAllListings(filters);
      
      // Mettre en cache
      localCache.set(cacheKey, data, CACHE_TTL.listings);
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des listings:', error);
      throw error;
    }
  },

  /**
   * Récupère un listing par ID avec cache
   */
  async getListingById(id) {
    const cacheKey = `listing:${id}`;
    
    // Essayer le cache local d'abord
    const cached = localCache.get(cacheKey);
    if (cached) {
      console.log('📦 Listing récupéré du cache local:', id);
      return cached;
    }

    try {
      // Appel API si pas en cache
      console.log('🌐 Appel API pour récupérer le listing:', id);
      const data = await listingService.getListingById(id);
      
      // Mettre en cache
      localCache.set(cacheKey, data, CACHE_TTL.listings);
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du listing:', error);
      throw error;
    }
  },

  /**
   * Crée un listing et invalide le cache
   */
  async createListing(listingData) {
    try {
      const data = await listingService.createListing(listingData);
      
      // Invalider le cache des listings
      this._invalidateListingsCache();
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la création du listing:', error);
      throw error;
    }
  },

  /**
   * Met à jour un listing et invalide le cache
   */
  async updateListing(id, updates) {
    try {
      const data = await listingService.updateListing(id, updates);
      
      // Invalider le cache spécifique et général
      localCache.delete(`listing:${id}`);
      this._invalidateListingsCache();
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du listing:', error);
      throw error;
    }
  },

  /**
   * Supprime un listing et invalide le cache
   */
  async deleteListing(id) {
    try {
      await listingService.deleteListing(id);
      
      // Invalider le cache spécifique et général
      localCache.delete(`listing:${id}`);
      this._invalidateListingsCache();
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du listing:', error);
      throw error;
    }
  },

  /**
   * Recherche de listings avec cache
   */
  async searchListings(query, filters = {}) {
    const cacheKey = `search:${query}:${JSON.stringify(filters)}`;
    
    // Essayer le cache local d'abord
    const cached = localCache.get(cacheKey);
    if (cached) {
      console.log('📦 Résultats de recherche récupérés du cache local');
      return cached;
    }

    try {
      // Appel API si pas en cache
      console.log('🌐 Appel API pour la recherche:', query);
      const data = await listingService.searchListings(query, filters);
      
      // Mettre en cache avec TTL plus court pour les recherches
      localCache.set(cacheKey, data, CACHE_TTL.searchResults);
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      throw error;
    }
  },

  /**
   * Récupère les listings d'un utilisateur avec cache
   */
  async getUserListings(userId) {
    const cacheKey = `userListings:${userId}`;
    
    // Essayer le cache local d'abord
    const cached = localCache.get(cacheKey);
    if (cached) {
      console.log('📦 Listings utilisateur récupérés du cache local');
      return cached;
    }

    try {
      // Appel API si pas en cache
      console.log('🌐 Appel API pour les listings utilisateur:', userId);
      const data = await listingService.getUserListings(userId);
      
      // Mettre en cache avec TTL court pour les données utilisateur
      localCache.set(cacheKey, data, CACHE_TTL.userListings);
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des listings utilisateur:', error);
      throw error;
    }
  },

  /**
   * Récupère les catégories avec cache long
   */
  async getCategories() {
    const cacheKey = 'categories';
    
    // Essayer le cache local d'abord
    const cached = localCache.get(cacheKey);
    if (cached) {
      console.log('📦 Catégories récupérées du cache local');
      return cached;
    }

    try {
      // Appel API si pas en cache
      console.log('🌐 Appel API pour récupérer les catégories');
      const data = await listingService.getCategories();
      
      // Mettre en cache avec TTL long pour les catégories
      localCache.set(cacheKey, data, CACHE_TTL.categories);
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  },

  /**
   * Invalide le cache des listings
   */
  _invalidateListingsCache() {
    try {
      const keys = Object.keys(localStorage);
      const listingKeys = keys.filter(key => 
        key.startsWith('benome:listings:') || 
        key.startsWith('benome:search:') ||
        key.startsWith('benome:userListings:')
      );
      
      listingKeys.forEach(key => {
        const actualKey = key.replace('benome:', '');
        localCache.delete(actualKey);
      });
      
      console.log('🗑️ Cache des listings invalidé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'invalidation du cache:', error);
    }
  },

  /**
   * Nettoie tout le cache
   */
  clearCache() {
    localCache.clear();
    console.log('🗑️ Cache complètement vidé');
  },

  /**
   * Récupère les hero listings avec cache optimisé
   */
  async getHeroListings(limit = 6) {
    const cacheKey = `hero-listings:${limit}`;
    
    const cached = localCache.get(cacheKey);
    if (cached) {
      console.log('📦 Hero listings récupérés du cache local');
      return cached;
    }

    try {
      console.log('🌐 Appel API pour récupérer les hero listings');
      const data = await listingService.getHeroListings(limit);
      
      localCache.set(cacheKey, data, CACHE_TTL.heroListings);
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des hero listings:', error);
      throw error;
    }
  },

  /**
   * Récupère les listings populaires avec cache optimisé
   */
  async getTopViewedListings(limit = 10) {
    const cacheKey = `popular-listings:${limit}`;
    
    const cached = localCache.get(cacheKey);
    if (cached) {
      console.log('📦 Listings populaires récupérés du cache local');
      return cached;
    }

    try {
      console.log('🌐 Appel API pour récupérer les listings populaires');
      const data = await listingService.getTopViewedListings(limit);
      
      localCache.set(cacheKey, data, CACHE_TTL.popularListings);
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des listings populaires:', error);
      throw error;
    }
  },

  /**
   * Récupère les listings premium avec cache optimisé
   */
  async getPremiumListings(limit = 10) {
    const cacheKey = `premium-listings:${limit}`;
    
    const cached = localCache.get(cacheKey);
    if (cached) {
      console.log('📦 Listings premium récupérés du cache local');
      return cached;
    }

    try {
      console.log('🌐 Appel API pour récupérer les listings premium');
      const data = await listingService.getPremiumListings(limit);
      
      localCache.set(cacheKey, data, CACHE_TTL.premiumListings);
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des listings premium:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques du cache
   */
  getCacheStats() {
    return localCache.getStats();
  }
}; 