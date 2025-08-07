import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useListings = (category = null, filters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { user } = useAuth();

  const ITEMS_PER_PAGE = 12;

  const fetchListings = async (pageNum = 0, append = false) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('listings')
        .select(`
          *,
          users!listings_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone_number
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

      // Filtrer par catégorie si spécifiée
      if (category) {
        query = query.eq('category', category);
      }

      // Appliquer les filtres supplémentaires
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.location) {
        query = query.ilike('location->city', `%${filters.location}%`);
      }

      if (filters.type && category === 'real_estate') {
        query = query.eq('real_estate_details->type', filters.type);
      }

      if (filters.brand && category === 'automobile') {
        query = query.eq('automobile_details->brand', filters.brand);
      }

      if (filters.serviceType && category === 'services') {
        query = query.eq('service_details->type', filters.serviceType);
      }

      if (filters.year && category === 'automobile') {
        query = query.eq('automobile_details->year', filters.year);
      }

      if (filters.fuel && category === 'automobile') {
        query = query.eq('automobile_details->fuel', filters.fuel);
      }

      if (filters.condition && category === 'marketplace') {
        query = query.eq('product_details->condition', filters.condition);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (append) {
        setListings(prev => [...prev, ...data]);
      } else {
        setListings(data);
      }

      setHasMore(data.length === ITEMS_PER_PAGE);
      setPage(pageNum);

    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err.message);
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

      const { data, error } = await supabase
        .from('listings')
        .insert([{
          ...listingData,
          user_id: user.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

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
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

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
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

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

      // Vérifier si déjà en favori
      const { data: existingFavorite } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .single();

      if (existingFavorite) {
        // Retirer des favoris
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);
      } else {
        // Ajouter aux favoris
        await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            listing_id: listingId
          }]);
      }

      // Mettre à jour la liste locale
      setListings(prev => 
        prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, is_favorite: !existingFavorite }
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
    fetchListings(0, false);
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