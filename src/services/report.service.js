import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE RAPPORTS/MODÉRATION
// ============================================================================

export const reportService = {
  // Recuperer tous les rapports
  getAllReports: async (filters = {}) => {
    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:users!reports_reporter_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        listing:listings!reports_listing_id_fkey (
          id,
          title,
          description
        )
      `)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Creer un nouveau rapport
  createReport: async (reportData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('reports')
      .insert([{
        ...reportData,
        reporter_id: user.id,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Moderer un rapport
  moderateReport: async (id, action, reason = null) => {
    const updateData = {
      status: action,
      moderated_at: new Date().toISOString(),
      moderator_reason: reason
    };

    const { data, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
