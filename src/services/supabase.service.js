import { supabase } from '@/lib/supabase';

// ============================================================================
// SERVICE AUTHENTIFICATION
// ============================================================================

export const authService = {
  // Connexion
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Inscription
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    if (error) throw error;
    return data;
  },

  // Déconnexion
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Réinitialisation mot de passe
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  // Mise à jour mot de passe
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  },

  // Récupérer la session actuelle
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  // Écouter les changements d'authentification
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================================================
// SERVICE UTILISATEURS
// ============================================================================

export const userService = {
  // Récupérer le profil utilisateur
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

  // Mettre à jour le profil utilisateur
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

  // Récupérer tous les utilisateurs (admin)
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Mettre à jour le statut d'un utilisateur (admin)
  updateUserStatus: async (userId, status) => {
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// SERVICE ANNONCES
// ============================================================================

export const listingService = {
  // Récupérer toutes les annonces
  getAllListings: async (filters = {}) => {
    console.log('🔍 listingService.getAllListings called with filters:', filters);
    
    let query = supabase
      .from('listings')
      .select(`
        *,
        users!listings_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        categories!listings_category_id_fkey (
          id,
          name,
          slug,
          description,
          icon,
          color
        )
      `)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters.category) {
      // Si category est un slug, on doit d'abord récupérer l'ID de la catégorie
      if (typeof filters.category === 'string' && !filters.category.includes('-')) {
        // C'est un slug, récupérer l'ID de la catégorie
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      } else {
        // C'est un ID UUID, on filtre directement
        query = query.eq('category_id', filters.category);
      }
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    console.log('🔍 Executing query with filters:', filters);
    const { data, error } = await query;
    console.log('🔍 listingService.getAllListings result:', { data: data?.length || 0, error });
    if (error) throw error;
    return data;
  },

  // Récupérer les annonces d'un utilisateur
  getUserListings: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        categories!listings_category_id_fkey (
          id,
          name,
          slug,
          description,
          icon,
          color
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Récupérer une annonce par ID
  getListingById: async (id) => {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        users!listings_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone_number
        ),
        categories!listings_category_id_fkey (
          id,
          name,
          slug,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une nouvelle annonce
  createListing: async (listingData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

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
    return data;
  },

  // Mettre à jour une annonce
  updateListing: async (id, updates) => {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une annonce
  deleteListing: async (id) => {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Approuver/Rejeter une annonce (admin)
  updateListingStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// SERVICE CATÉGORIES
// ============================================================================

export const categoryService = {
  // Récupérer toutes les catégories
  getAllCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Récupérer une catégorie par slug
  getCategoryBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Récupérer les catégories par type
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

// ============================================================================
// SERVICE FAVORIS
// ============================================================================

export const favoriteService = {
  // Récupérer les favoris d'un utilisateur
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

  // Vérifier si une annonce est en favori
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

// ============================================================================
// SERVICE NOTIFICATIONS
// ============================================================================

export const notificationService = {
  // Récupérer les notifications d'un utilisateur
  getUserNotifications: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une notification
  createNotification: async (notificationData) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// SERVICE MESSAGES
// ============================================================================

export const messageService = {
  // Récupérer les conversations d'un utilisateur
  getUserConversations: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey (
          id,
          first_name,
          last_name
        ),
        receiver:users!messages_receiver_id_fkey (
          id,
          first_name,
          last_name
        )
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Envoyer un message
  sendMessage: async (receiverId, content) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: user.id,
        receiver_id: receiverId,
        content
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

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

    // Appliquer les filtres supplémentaires
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

// ============================================================================
// SERVICE STORAGE (IMAGES)
// ============================================================================

export const storageService = {
  // Uploader une image
  uploadImage: async (file, folder = 'listings') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${folder}/${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) throw error;

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Supprimer une image
  deleteImage: async (filePath) => {
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) throw error;
  }
};

// ============================================================================
// SERVICE TRANSACTIONS
// ============================================================================

export const transactionService = {
  // Récupérer toutes les transactions
  getAllTransactions: async (filters = {}) => {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        users!transactions_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        listings!transactions_listing_id_fkey (
          id,
          title,
          price
        )
      `)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.type) {
      query = query.eq('transaction_type', filters.type);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Récupérer une transaction par ID
  getTransactionById: async (id) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        users!transactions_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        listings!transactions_listing_id_fkey (
          id,
          title,
          price,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une nouvelle transaction
  createTransaction: async (transactionData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transactionData,
        user_id: user.id,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour le statut d'une transaction
  updateTransactionStatus: async (id, status, reason = null) => {
    const updateData = { status };
    if (reason) updateData.reason = reason;

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Rembourser une transaction
  refundTransaction: async (id, amount, reason) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        status: 'refunded',
        refund_amount: amount,
        refund_reason: reason,
        refunded_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// SERVICE RAPPORTS/MODÉRATION
// ============================================================================

export const reportService = {
  // Récupérer tous les rapports
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

  // Créer un nouveau rapport
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

  // Modérer un rapport
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

// ============================================================================
// SERVICE ANALYTICS
// ============================================================================

export const analyticsService = {
  // Obtenir les statistiques générales
  getDashboardStats: async () => {
    const [users, listings, transactions] = await Promise.all([
      userService.getAllUsers(),
      listingService.getAllListings(),
      transactionService.getAllTransactions()
    ]);

    const activeUsers = users.filter(u => u.status === 'active').length;
    const pendingListings = listings.filter(l => l.status === 'pending').length;
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      users: {
        total: users.length,
        active: activeUsers,
        inactive: users.length - activeUsers
      },
      listings: {
        total: listings.length,
        approved: listings.filter(l => l.status === 'approved').length,
        pending: pendingListings,
        rejected: listings.filter(l => l.status === 'rejected').length
      },
      transactions: {
        total: transactions.length,
        completed: completedTransactions.length,
        pending: transactions.filter(t => t.status === 'pending').length,
        revenue: totalRevenue
      }
    };
  },

  // Obtenir les données de croissance utilisateurs
  getUserGrowthData: async (days = 30) => {
    const users = await userService.getAllUsers();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentUsers = users.filter(user => 
      new Date(user.created_at) >= cutoffDate
    );

    // Grouper par jour
    const dailyData = {};
    recentUsers.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + 1;
    });

    return Object.entries(dailyData).map(([date, count]) => ({
      date,
      users: count
    }));
  },

  // Obtenir les données de revenus
  getRevenueData: async (days = 30) => {
    const transactions = await transactionService.getAllTransactions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentTransactions = transactions.filter(transaction => 
      transaction.status === 'completed' && 
      new Date(transaction.created_at) >= cutoffDate
    );

    // Grouper par jour
    const dailyData = {};
    recentTransactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, count: 0 };
      }
      dailyData[date].revenue += transaction.amount || 0;
      dailyData[date].count += 1;
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      transactions: data.count
    }));
  }
};

// Export par défaut mis à jour
export default {
  auth: authService,
  users: userService,
  listings: listingService,
  categories: categoryService,
  favorites: favoriteService,
  notifications: notificationService,
  messages: messageService,
  search: searchService,
  storage: storageService,
  transactions: transactionService,
  reports: reportService,
  analytics: analyticsService
}; 