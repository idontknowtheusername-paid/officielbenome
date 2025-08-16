import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE RECHERCHE
// ============================================================================

export const searchService = {
  // Rechercher dans les annonces
  searchListings: async (query, filters = {}) => {
    let searchQuery = supabase
      .from('listings')
      .select(`
        *,
        users!listings_user_id_fkey (
          id,
          first_name,
          last_name
        ),
        categories!listings_category_id_fkey (
          id,
          name,
          slug
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    // Appliquer les filtres supplementaires
    if (filters.category_id) {
      searchQuery = searchQuery.eq('category_id', filters.category_id);
    }
    if (filters.min_price) {
      searchQuery = searchQuery.gte('price', filters.min_price);
    }
    if (filters.max_price) {
      searchQuery = searchQuery.lte('price', filters.max_price);
    }

    const { data, error } = await searchQuery;
    if (error) throw error;
    return data;
  },

  // Sauvegarder une recherche
  saveSearch: async (query, filters = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('search_history')
      .insert([{
        user_id: user.id,
        query,
        filters: filters
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
