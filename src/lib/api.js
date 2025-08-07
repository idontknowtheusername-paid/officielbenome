// ============================================================================
// NOUVEAU SERVICE API BASÉ SUR SUPABASE
// ============================================================================

import { 
  authService, 
  userService, 
  listingService, 
  categoryService, 
  favoriteService, 
  notificationService, 
  messageService, 
  searchService, 
  storageService 
} from '@/services/supabase.service';

// ============================================================================
// FONCTIONS D'AUTHENTIFICATION (Compatibilité)
// ============================================================================
export const registerUser = async (userData) => {
  const result = await authService.signUp(userData.email, userData.password, {
    first_name: userData.firstName,
    last_name: userData.lastName,
    phone_number: userData.phoneNumber,
  });
  
  return {
    user: result.user,
    token: result.session?.access_token
  };
};

export const loginUser = async (credentials) => {
  const result = await authService.signIn(credentials.email, credentials.password);
  
  return {
    user: result.user,
    token: result.session?.access_token
  };
};

export const logoutUser = async () => {
  return authService.signOut();
};

export const getCurrentUserProfile = async () => {
  return userService.getProfile();
};

export const updateUserProfile = async (userData) => {
  return userService.updateProfile(userData);
};

export const forgotPassword = async (email) => {
  return authService.resetPassword(email);
};

export const resetPassword = async (token, newPassword) => {
  return authService.updatePassword(newPassword);
};

// ============================================================================
// FONCTIONS POUR LES ANNONCES (Compatibilité)
// ============================================================================

export const getRealEstateListings = async (params = {}) => {
  const filters = {
    category: 'immobilier',
    ...params
  };
  return listingService.getAllListings(filters);
};

export const getRealEstateListing = async (id) => {
  return listingService.getListingById(id);
};

export const createRealEstateListing = async (listingData) => {
  return listingService.createListing({
    ...listingData,
    category_id: 'immobilier'
  });
};

export const getAutoListings = async (params = {}) => {
  const filters = {
    category: 'automobile',
    ...params
  };
  return listingService.getAllListings(filters);
};

export const getAutoListing = async (id) => {
  return listingService.getListingById(id);
};

export const createAutoListing = async (listingData) => {
  return listingService.createListing({
    ...listingData,
    category_id: 'automobile'
  });
};

export const getServices = async (params = {}) => {
  const filters = {
    category: 'services',
    ...params
  };
  return listingService.getAllListings(filters);
};

export const getService = async (id) => {
  return listingService.getListingById(id);
};

export const createService = async (serviceData) => {
  return listingService.createListing({
    ...serviceData,
    category_id: 'services'
  });
};

export const getMarketplaceListings = async (params = {}) => {
  const filters = {
    category: 'marketplace',
    ...params
  };
  return listingService.getAllListings(filters);
};

export const getMarketplaceListing = async (id) => {
  return listingService.getListingById(id);
};

export const createMarketplaceListing = async (listingData) => {
  return listingService.createListing({
    ...listingData,
    category_id: 'marketplace'
  });
};

// ============================================================================
// FONCTIONS POUR LES FAVORIS (Compatibilité)
// ============================================================================

export const getFavorites = async () => {
  return favoriteService.getUserFavorites();
};

export const addToFavorites = async (itemId, itemType) => {
  return favoriteService.addToFavorites(itemId);
};

export const removeFromFavorites = async (itemId) => {
  return favoriteService.removeFromFavorites(itemId);
};

// ============================================================================
// FONCTIONS POUR LES NOTIFICATIONS (Compatibilité)
// ============================================================================

export const getNotifications = async () => {
  return notificationService.getUserNotifications();
};

export const markNotificationAsRead = async (notificationId) => {
  return notificationService.markAsRead(notificationId);
};

// ============================================================================
// FONCTION DE RECHERCHE GLOBALE (Compatibilité)
// ============================================================================

export const searchAll = async (query, filters = {}) => {
  return searchService.searchListings(query, filters);
};

// ============================================================================
// FONCTIONS D'ADMINISTRATION (Compatibilité)
// ============================================================================

export const getDashboardStats = async () => {
  try {
    // Récupérer les statistiques depuis Supabase
    const [users, listings, categories] = await Promise.all([
      userService.getAllUsers(),
      listingService.getAllListings(),
      categoryService.getAllCategories()
    ]);

    // Calculer les statistiques
    const activeUsers = users.filter(u => u.status === 'active').length;
    const pendingListings = listings.filter(l => l.status === 'pending').length;
    const totalRevenue = 0; // À implémenter avec la table payments

    return {
      success: true,
      data: {
        users: {
          total: users.length,
          active: activeUsers
        },
        listings: {
          total: listings.length,
          pending: pendingListings
        },
        revenue: totalRevenue,
        recentActivities: [] // À implémenter
      }
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    throw error;
  }
};

export const getAdminUsers = async (params = {}) => {
  try {
    const users = await userService.getAllUsers();
    return {
      success: true,
      data: users
    };
  } catch (error) {
    console.error('Admin users error:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId, statusData) => {
  try {
    const user = await userService.updateUserStatus(userId, statusData.status);
    return {
      success: true,
      data: user
    };
  } catch (error) {
    console.error('Update user status error:', error);
    throw error;
  }
};

export const getAdminListings = async (params = {}) => {
  try {
    const listings = await listingService.getAllListings(params);
    return {
      success: true,
      data: listings
    };
  } catch (error) {
    console.error('Admin listings error:', error);
    throw error;
  }
};

export const approveListing = async (listingId) => {
  try {
    const listing = await listingService.updateListingStatus(listingId, 'approved');
    return {
      success: true,
      data: listing
    };
  } catch (error) {
    console.error('Approve listing error:', error);
    throw error;
  }
};

export const rejectListing = async (listingId, reason) => {
  try {
    const listing = await listingService.updateListingStatus(listingId, 'rejected');
    return {
      success: true,
      data: listing
    };
  } catch (error) {
    console.error('Reject listing error:', error);
    throw error;
  }
};

export const getAdminTransactions = async (params = {}) => {
  try {
    // À implémenter avec la table payments
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Admin transactions error:', error);
    throw error;
  }
};

// ============================================================================
// FONCTIONS DE MODÉRATION (Compatibilité)
// ============================================================================

export const getReportedContent = async (params = {}) => {
  try {
    // À implémenter avec la table reports
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Reported content error:', error);
    throw error;
  }
};

export const moderateContent = async (reportId, actionData) => {
  try {
    // À implémenter avec la table reports
    return {
      success: true,
      data: { id: reportId, action: actionData }
    };
  } catch (error) {
    console.error('Moderate content error:', error);
    throw error;
  }
};

export const getModerationStats = async () => {
  try {
    // À implémenter avec la table reports
    return {
      success: true,
      data: {
        total: 0,
        pending: 0,
        resolved: 0
      }
    };
  } catch (error) {
    console.error('Moderation stats error:', error);
    throw error;
  }
};

export const getModerationLogs = async (params = {}) => {
  try {
    // À implémenter avec la table reports
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Moderation logs error:', error);
    throw error;
  }
};

// ============================================================================
// FONCTIONS UTILISATEUR SUPPLÉMENTAIRES (Compatibilité)
// ============================================================================

export const deleteUser = async (userId) => {
  try {
    // À implémenter avec Supabase
    return {
      success: true,
      data: { id: userId }
    };
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, roleData) => {
  try {
    const user = await userService.updateUserStatus(userId, roleData.role);
    return {
      success: true,
      data: user
    };
  } catch (error) {
    console.error('Update user role error:', error);
    throw error;
  }
};

// ============================================================================
// FONCTIONS DE LISTING SUPPLÉMENTAIRES (Compatibilité)
// ============================================================================

export const featureListing = async (listingId) => {
  try {
    const listing = await listingService.updateListing(listingId, { featured: true });
    return {
      success: true,
      data: listing
    };
  } catch (error) {
    console.error('Feature listing error:', error);
    throw error;
  }
};

export const deleteListing = async (listingId) => {
  try {
    await listingService.deleteListing(listingId);
    return {
      success: true,
      data: { id: listingId }
    };
  } catch (error) {
    console.error('Delete listing error:', error);
    throw error;
  }
};

// ============================================================================
// FONCTIONS D'ANALYTICS (Compatibilité)
// ============================================================================

export const getAnalyticsData = async (params = {}) => {
  try {
    // À implémenter avec les données Supabase
    return {
      success: true,
      data: {}
    };
  } catch (error) {
    console.error('Analytics data error:', error);
    throw error;
  }
};

export const getUserGrowthData = async (params = {}) => {
  try {
    // À implémenter avec les données Supabase
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('User growth data error:', error);
    throw error;
  }
};

export const getRevenueData = async (params = {}) => {
  try {
    // À implémenter avec la table payments
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Revenue data error:', error);
    throw error;
  }
};

export const getListingsByCategory = async (params = {}) => {
  try {
    const listings = await listingService.getAllListings();
    const categories = await categoryService.getAllCategories();
    
    const listingsByCategory = categories.map(category => ({
      category: category.name,
      count: listings.filter(l => l.category_id === category.id).length
    }));

    return {
      success: true,
      data: listingsByCategory
    };
  } catch (error) {
    console.error('Listings by category error:', error);
    throw error;
  }
};

export const getSalesByCategory = async (params = {}) => {
  try {
    // À implémenter avec la table payments
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Sales by category error:', error);
    throw error;
  }
};

export const getTrafficSources = async (params = {}) => {
  try {
    // À implémenter avec les données Supabase
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Traffic sources error:', error);
    throw error;
  }
};

export const getUserAcquisitionData = async (params = {}) => {
  try {
    // À implémenter avec les données Supabase
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('User acquisition data error:', error);
    throw error;
  }
};

export const getTopProducts = async (params = {}) => {
  try {
    // À implémenter avec les données Supabase
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Top products error:', error);
    throw error;
  }
};

// ============================================================================
// FONCTIONS SUPPLÉMENTAIRES (Compatibilité)
// ============================================================================

export const getBlogPosts = async (params = {}) => {
  try {
    // À implémenter avec une table blog_posts
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Blog posts error:', error);
    throw error;
  }
};

export const getBlogPost = async (id) => {
  try {
    // À implémenter avec une table blog_posts
    return {
      success: true,
      data: null
    };
  } catch (error) {
    console.error('Blog post error:', error);
    throw error;
  }
};

export const createBlogPost = async (postData) => {
  try {
    // À implémenter avec une table blog_posts
    return {
      success: true,
      data: postData
    };
  } catch (error) {
    console.error('Create blog post error:', error);
    throw error;
  }
};

export const sendContactMessage = async (messageData) => {
  try {
    // À implémenter avec une table contact_messages
    return {
      success: true,
      data: messageData
    };
  } catch (error) {
    console.error('Send contact message error:', error);
    throw error;
  }
};

// ============================================================================
// EXPORT PAR DÉFAUT (Compatibilité)
// ============================================================================

export default {
  auth: authService,
  users: userService,
  listings: listingService,
  categories: categoryService,
  favorites: favoriteService,
  notifications: notificationService,
  messages: messageService,
  search: searchService,
  storage: storageService
};