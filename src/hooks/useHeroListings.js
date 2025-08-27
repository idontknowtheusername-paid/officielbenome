import { useState, useEffect, useCallback } from 'react';
import { localCache } from '@/lib/localCache';
import { listingService } from '@/services';

// Configuration du cache
const CACHE_KEYS = {
  HERO_LISTINGS: 'hero-listings',
  HERO_INFO: 'hero-info',
  LAST_UPDATE: 'hero-last-update'
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 heure en millisecondes (pour rafraîchir l'heure)

export const useHeroListings = (limit = 6) => {
  const [heroListings, setHeroListings] = useState([]);
  const [heroInfo, setHeroInfo] = useState({ category: '', hour: 0, timeSlot: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Vérifier si le cache est valide
  const isCacheValid = useCallback(() => {
    const cachedLastUpdate = localCache.get(CACHE_KEYS.LAST_UPDATE);
    if (!cachedLastUpdate) return false;
    
    const timeSinceUpdate = Date.now() - cachedLastUpdate;
    return timeSinceUpdate < CACHE_DURATION;
  }, []);

  // Charger depuis le cache
  const loadFromCache = useCallback(() => {
    try {
      const cachedListings = localCache.get(CACHE_KEYS.HERO_LISTINGS);
      const cachedInfo = localCache.get(CACHE_KEYS.HERO_INFO);
      const cachedLastUpdate = localCache.get(CACHE_KEYS.LAST_UPDATE);

      if (cachedListings && cachedInfo && cachedLastUpdate) {
        setHeroListings(cachedListings);
        setHeroInfo(cachedInfo);
        setLastUpdate(cachedLastUpdate);
        console.log('✅ Données hero chargées depuis le cache');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors du chargement du cache:', error);
      return false;
    }
  }, []);

  // Sauvegarder dans le cache
  const saveToCache = useCallback((listings, info) => {
    try {
      const now = Date.now();
      localCache.set(CACHE_KEYS.HERO_LISTINGS, listings, CACHE_DURATION);
      localCache.set(CACHE_KEYS.HERO_INFO, info, CACHE_DURATION);
      localCache.set(CACHE_KEYS.LAST_UPDATE, now, CACHE_DURATION);
      
      setLastUpdate(now);
      console.log('💾 Données hero sauvegardées en cache pour 24h');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde en cache:', error);
    }
  }, []);

  // Charger depuis l'API
  const loadFromAPI = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des annonces hero depuis l\'API...');
      const data = await listingService.getHeroListings(limit);
      
      const listings = data?.data || [];
      const info = {
        category: data?.category || '',
        hour: data?.hour || 0,
        timeSlot: data?.rotationInfo?.timeSlot || ''
      };

      setHeroListings(listings);
      setHeroInfo(info);
      
      // Sauvegarder en cache
      saveToCache(listings, info);
      
      console.log('✅ Annonces hero chargées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des annonces hero:', error);
      setError(error?.message || 'Erreur lors du chargement des annonces hero');
    } finally {
      setLoading(false);
    }
  }, [limit, saveToCache]);

  // Charger les données (cache ou API)
  const loadData = useCallback(async () => {
    // Essayer d'abord le cache
    if (isCacheValid() && loadFromCache()) {
      setLoading(false);
      return;
    }

    // Si pas de cache valide, charger depuis l'API
    await loadFromAPI();
  }, [isCacheValid, loadFromCache, loadFromAPI]);

  // Forcer le rechargement (ignorer le cache)
  const forceRefresh = useCallback(async () => {
    console.log('🔄 Forçage du rechargement des annonces hero...');
    await loadFromAPI();
  }, [loadFromAPI]);

  // Initialisation
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Rafraîchissement automatique toutes les heures (pour l'heure intelligente)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Vérification horaire du système intelligent...');
      if (!isCacheValid()) {
        console.log('⏰ Cache expiré, rechargement automatique...');
        loadFromAPI();
      }
    }, 60 * 60 * 1000); // Vérifier toutes les heures

    return () => clearInterval(interval);
  }, [isCacheValid, loadFromAPI]);

  // Retourner les données et fonctions
  return {
    heroListings,
    heroInfo,
    loading,
    error,
    lastUpdate,
    forceRefresh,
    isCacheValid: isCacheValid(),
    cacheStats: localCache.getStats()
  };
};
