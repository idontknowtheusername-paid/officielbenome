import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE CATÉGORIES
// ============================================================================

export const categoryService = {
  // Recuperer toutes les categories
  getAllCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Recuperer une categorie par slug
  getCategoryBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Recuperer les categories par type
  getCategoriesByType: async (type) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('name');

    if (error) throw error;
    return data;
  }
};
