import { useState, useEffect } from 'react';
import { listingService, favoriteService } from '@/services/supabase.service';
import { useAuth } from '@/contexts/AuthContext';

export const useListings = (category = null, filters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  const ITEMS_PER_PAGE = 12;

  const fetchListings = async (pageNum = 0, append = false) => {
    // Éviter les appels multiples simultanés seulement pour les nouveaux appels
    if (loading && !append && pageNum === 0) {
      console.log('🔄 Fetch déjà en cours, ignoré');
      return;
    }

    try {
      console.log('🔄 Fetching listings...', { pageNum, append, category, filters });
      setLoading(true);
      setError(null);

      // Construire les filtres pour le service
      const serviceFilters = {
        status: 'approved',
        category,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        location: filters.location,
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        ...filters
      };

      console.log('📡 Service filters:', serviceFilters);
      console.log('📡 Appel de listingService.getAllListings...');
      
      // Ajouter un timeout pour éviter les requêtes bloquées
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Chargement trop long')), 15000);
      });

      const fetchPromise = listingService.getAllListings(serviceFilters);
      console.log('📡 Attente de la réponse...');
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      console.log('📡 Réponse reçue');
      
      console.log('✅ Data received:', result.data?.length || 0, 'listings');

      if (append) {
        setListings(prev => [...prev, ...result.data]);
      } else {
        setListings(result.data);
      }

      setHasMore(result.hasMore);
      setPage(pageNum);
      setIsInitialized(true);

    } catch (err) {
      console.error('❌ Error fetching listings:', err);
      setError(err.message);
      
      // En cas d'erreur, essayer de récupérer des données de cache ou afficher un message
      if (!isInitialized) {
        setListings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchListings(page + 1, true);
    }
  };

  const refresh = () => {
    fetchListings(0, false);
  };

  const createListing = async (listingData) => {
    try {
      if (!user) {
        throw new Error('Vous devez être connecté pour créer une annonce');
      }

      const data = await listingService.createListing({
        ...listingData,
        user_id: user.id,
        status: 'pending'
      });

      // Rafraîchir la liste
      refresh();

      return data;
    } catch (err) {
      console.error('Error creating listing:', err);
      throw err;
    }
  };

  const updateListing = async (id, updates) => {
    try {
      const data = await listingService.updateListing(id, updates);

      // Mettre à jour la liste locale
      setListings(prev => 
        prev.map(listing => 
          listing.id === id ? { ...listing, ...data } : listing
        )
      );

      return data;
    } catch (err) {
      console.error('Error updating listing:', err);
      throw err;
    }
  };

  const deleteListing = async (id) => {
    try {
      await listingService.deleteListing(id);

      // Mettre à jour la liste locale
      setListings(prev => prev.filter(listing => listing.id !== id));

    } catch (err) {
      console.error('Error deleting listing:', err);
      throw err;
    }
  };

  const toggleFavorite = async (listingId) => {
    try {
      if (!user) {
        throw new Error('Vous devez être connecté pour ajouter aux favoris');
      }

      const result = await favoriteService.toggleFavorite(listingId);

      // Mettre à jour la liste locale
      setListings(prev => 
        prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, is_favorite: result.is_favorite }
            : listing
        )
      );

    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  };

  // Charger les données au montage et quand les filtres changent
  useEffect(() => {
    // Réinitialiser l'état quand les filtres changent
    setListings([]);
    setPage(0);
    setHasMore(true);
    setIsInitialized(false);
    
    // Délai pour éviter les appels multiples rapides
    const timeoutId = setTimeout(() => {
      fetchListings(0, false);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [category, JSON.stringify(filters)]);

  return {
    listings,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    createListing,
    updateListing,
    deleteListing,
    toggleFavorite
  };
}; 