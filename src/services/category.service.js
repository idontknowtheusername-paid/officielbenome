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

  // Recuperer une categorie par ID
  getCategoryById: async (id) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
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
  },

  // Creer une nouvelle categorie
  createCategory: async (categoryData) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        ...categoryData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre a jour une categorie
  updateCategory: async (id, updates) => {
    const { data, error } = await supabase
      .from('categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une categorie
  deleteCategory: async (id) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  // Activer/desactiver une categorie
  toggleCategoryStatus: async (id, isActive) => {
    const { data, error } = await supabase
      .from('categories')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
