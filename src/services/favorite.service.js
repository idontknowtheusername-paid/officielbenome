import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE FAVORIS
// ============================================================================

export const favoriteService = {
  // Recuperer les favoris d'un utilisateur
  getUserFavorites: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        listings!favorites_listing_id_fkey (
          *,
          users!listings_user_id_fkey (
            id,
            first_name,
            last_name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Ajouter aux favoris
  addToFavorites: async (listingId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: user.id,
        listing_id: listingId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Retirer des favoris
  removeFromFavorites: async (listingId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId);

    if (error) throw error;
  },

  // Verifier si une annonce est en favori
  isFavorite: async (listingId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  // NOUVELLE FONCTION : Basculer les favoris (ajouter/retirer)
  toggleFavorite: async (listingId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      // Vérifier si c'est déjà en favori
      const isCurrentlyFavorite = await favoriteService.isFavorite(listingId);
      
      if (isCurrentlyFavorite) {
        // Retirer des favoris
        await favoriteService.removeFromFavorites(listingId);
        return { is_favorite: false, action: 'removed' };
      } else {
        // Ajouter aux favoris
        await favoriteService.addToFavorites(listingId);
        return { is_favorite: true, action: 'added' };
      }
    } catch (error) {
      console.error('Erreur lors du basculement des favoris:', error);
      throw new Error('Impossible de modifier les favoris');
    }
  },

  // NOUVELLE FONCTION : Récupérer tous les favoris d'un utilisateur avec statut
  getUserFavoritesWithStatus: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      // Récupérer tous les favoris de l'utilisateur
      const { data: favorites, error } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', user.id);

      if (error) throw error;

      // Créer un Set pour une recherche rapide
      const favoriteIds = new Set(favorites.map(fav => fav.listing_id));
      
      return favoriteIds;
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
      return new Set();
    }
  }
};
