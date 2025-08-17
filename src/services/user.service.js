import { supabase } from '@/lib/supabase';
import { quickExport } from '@/utils/exportUtils';

// ============================================================================
// SERVICE UTILISATEURS
// ============================================================================

export const userService = {
  // Recuperer le profil utilisateur
  getProfile: async (userId = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre a jour le profil utilisateur
  updateProfile: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Recuperer tous les utilisateurs (admin)
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Mettre a jour le statut d'un utilisateur (admin)
  updateUserStatus: async (userId, status) => {
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Recuperer un utilisateur par ID
  getUserById: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Rechercher des utilisateurs
  searchUsers: async (searchTerm, filters = {}) => {
    let query = supabase
      .from('users')
      .select('*')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);

    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Mettre a jour le role d'un utilisateur (admin)
  updateUserRole: async (userId, role) => {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un utilisateur (admin)
  deleteUser: async (userId) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  // Recuperer les statistiques des utilisateurs
  getUserStats: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('role, status, created_at');

    if (error) throw error;

    const stats = {
      total: data.length,
      byRole: {},
      byStatus: {},
      byMonth: {}
    };

    data.forEach(user => {
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      stats.byStatus[user.status] = (stats.byStatus[user.status] || 0) + 1;
      
      const month = new Date(user.created_at).toISOString().slice(0, 7);
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });

    return stats;
  },

  // Exporter les utilisateurs
  exportUsers: async (format = 'csv') => {
    const users = await userService.getAllUsers();
    
    const headers = [
      { key: 'id', label: 'ID', type: 'string' },
      { key: 'first_name', label: 'Prénom', type: 'string' },
      { key: 'last_name', label: 'Nom', type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'phone_number', label: 'Téléphone', type: 'string' },
      { key: 'role', label: 'Rôle', type: 'string' },
      { key: 'status', label: 'Statut', type: 'string' },
      { key: 'is_verified', label: 'Vérifié', type: 'boolean' },
      { key: 'created_at', label: 'Date de création', type: 'date' },
      { key: 'updated_at', label: 'Dernière modification', type: 'date' }
    ];

    return quickExport(users, headers, `utilisateurs-${new Date().toISOString().split('T')[0]}`, format);
  }
};

export default userService;
