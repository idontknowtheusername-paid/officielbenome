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
  }
};
