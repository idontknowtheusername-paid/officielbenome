import { useState, useEffect, useCallback } from 'react';
import { cachedListingService } from '@/services/cachedListingService';
import { localCache } from '@/lib/localCache';
import { useHeroImagePreloader } from '@/hooks/useImagePreloader';

// Configuration du cache pour la HomePage
const CACHE_KEYS = {
  HERO_LISTINGS: 'homepage-hero-listings',
  POPULAR_LISTINGS: 'homepage-popular-listings',
  PREMIUM_LISTINGS: 'homepage-premium-listings',
  LAST_UPDATE: 'homepage-last-update'
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const useHomePageData = () => {
  const [heroListings, setHeroListings] = useState([]);
  const [popularListings, setPopularListings] = useState([]);
  const [premiumListings, setPremiumListings] = useState([]);
  
  const [loading, setLoading] = useState({
    hero: true,
    popular: false,
    premium: false
  });
  
  const [error, setError] = useState({
    hero: null,
    popular: null,
    premium: null
  });

  // Préchargement des images hero
  const heroImagePreloader = useHeroImagePreloader(heroListings);

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
      const cachedHero = localCache.get(CACHE_KEYS.HERO_LISTINGS);
      const cachedPopular = localCache.get(CACHE_KEYS.POPULAR_LISTINGS);
      const cachedPremium = localCache.get(CACHE_KEYS.PREMIUM_LISTINGS);

      if (cachedHero && cachedPopular && cachedPremium) {
        setHeroListings(cachedHero);
        setPopularListings(cachedPopular);
        setPremiumListings(cachedPremium);
        console.log('✅ Données HomePage chargées depuis le cache');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors du chargement du cache:', error);
      return false;
    }
  }, []);

  // Sauvegarder dans le cache
  const saveToCache = useCallback((hero, popular, premium) => {
    try {
      const now = Date.now();
      localCache.set(CACHE_KEYS.HERO_LISTINGS, hero, CACHE_DURATION);
      localCache.set(CACHE_KEYS.POPULAR_LISTINGS, popular, CACHE_DURATION);
      localCache.set(CACHE_KEYS.PREMIUM_LISTINGS, premium, CACHE_DURATION);
      localCache.set(CACHE_KEYS.LAST_UPDATE, now, CACHE_DURATION);
      
      console.log('💾 Données HomePage sauvegardées en cache');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde en cache:', error);
    }
  }, []);

  // Charger les annonces hero (priorité haute)
  const loadHeroListings = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, hero: true }));
      setError(prev => ({ ...prev, hero: null }));
      
      console.log('🔄 Chargement des annonces hero...');
      const data = await cachedListingService.getHeroListings(6);
      const listings = data?.data || [];
      
      setHeroListings(listings);
      console.log('✅ Annonces hero chargées');
      
      return listings;
    } catch (error) {
      console.error('❌ Erreur lors du chargement des annonces hero:', error);
      const errorMessage = typeof error === 'string' ? error : 
                          error?.message || 
                          error?.error?.message ||
                          'Erreur lors du chargement des annonces hero';
      setError(prev => ({ ...prev, hero: errorMessage }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, hero: false }));
    }
  }, []);

  // Charger les annonces populaires (priorité moyenne)
  const loadPopularListings = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, popular: true }));
      setError(prev => ({ ...prev, popular: null }));
      
      console.log('🔄 Chargement des annonces populaires...');
      const data = await cachedListingService.getTopViewedListings(6);
      
      setPopularListings(data || []);
      console.log('✅ Annonces populaires chargées');
      
      return data || [];
    } catch (error) {
      console.error('❌ Erreur lors du chargement des annonces populaires:', error);
      const errorMessage = typeof error === 'string' ? error : 
                          error?.message || 
                          error?.error?.message ||
                          'Erreur lors du chargement des annonces populaires';
      setError(prev => ({ ...prev, popular: errorMessage }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, popular: false }));
    }
  }, []);

  // Charger les annonces premium (priorité basse)
  const loadPremiumListings = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, premium: true }));
      setError(prev => ({ ...prev, premium: null }));
      
      console.log('🔄 Chargement des annonces premium...');
      const data = await cachedListingService.getPremiumListings(10);
      
      setPremiumListings(data?.data || []);
      console.log('✅ Annonces premium chargées');
      
      return data?.data || [];
    } catch (error) {
      console.error('❌ Erreur lors du chargement des annonces premium:', error);
      const errorMessage = typeof error === 'string' ? error : 
                          error?.message || 
                          error?.error?.message ||
                          'Erreur lors du chargement des annonces premium';
      setError(prev => ({ ...prev, premium: errorMessage }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, premium: false }));
    }
  }, []);

  // Chargement progressif optimisé
  const loadData = useCallback(async () => {
    // Essayer d'abord le cache
    if (isCacheValid() && loadFromCache()) {
      setLoading({ hero: false, popular: false, premium: false });
      return;
    }

    console.log('🔄 Début du chargement progressif de la HomePage...');
    
    // 1. Charger d'abord les hero listings (priorité haute)
    const heroData = await loadHeroListings();
    
    // 2. Charger les populaires en parallèle avec les premium (après hero)
    const [popularData, premiumData] = await Promise.allSettled([
      loadPopularListings(),
      loadPremiumListings()
    ]);
    
    // Sauvegarder en cache
    saveToCache(heroData, popularData.value || [], premiumData.value || []);
    
    console.log('✅ Chargement progressif de la HomePage terminé');
  }, [isCacheValid, loadFromCache, loadHeroListings, loadPopularListings, loadPremiumListings, saveToCache]);

  // Forcer le rechargement (ignorer le cache)
  const forceRefresh = useCallback(async () => {
    console.log('🔄 Forçage du rechargement de la HomePage...');
    
    // Nettoyer le cache
    localCache.delete(CACHE_KEYS.HERO_LISTINGS);
    localCache.delete(CACHE_KEYS.POPULAR_LISTINGS);
    localCache.delete(CACHE_KEYS.PREMIUM_LISTINGS);
    localCache.delete(CACHE_KEYS.LAST_UPDATE);
    
    await loadData();
  }, [loadData]);

  // Initialisation
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Rafraîchissement automatique toutes les 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Vérification du cache HomePage...');
      if (!isCacheValid()) {
        console.log('⏰ Cache expiré, rechargement automatique...');
        loadData();
      }
    }, 10 * 60 * 1000); // Vérifier toutes les 10 minutes

    return () => clearInterval(interval);
  }, [isCacheValid, loadData]);

  return {
    // Données
    heroListings,
    popularListings,
    premiumListings,
    
    // États de chargement
    loading,
    error,
    
    // Fonctions
    forceRefresh,
    loadData,
    
    // Statistiques
    isCacheValid: isCacheValid(),
    cacheStats: localCache.getStats(),
    
    // Préchargement des images
    imagePreloader: heroImagePreloader
  };
};
