import API_ENDPOINTS, { API_BASE_URL } from '@/config/api.config';

// const API_BASE_URL = "https://officielbenome-backend.onrender.com/api"; // supprimé, centralisé

// Fonction utilitaire pour les appels API
const fetchData = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  console.log('🔍 API Call:', {
    endpoint,
    method: options.method || 'GET',
    headers: defaultHeaders,
    body: options.body
  });

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Important pour les cookies d'authentification
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    // Si la réponse est 204 No Content, on ne tente pas de parser le JSON
    if (response.status === 204) {
      return null;
    }

    // Si le backend n'est pas accessible (502, 503, etc.)
    if (response.status >= 500) {
      console.error('Backend inaccessible:', response.status, response.statusText);
      throw new Error('Le serveur backend n\'est pas accessible. Veuillez réessayer plus tard.');
    }

    const data = await response.json();
    console.log('📡 Response data:', data);

    if (!response.ok) {
      const error = new Error(data.message || 'Une erreur est survenue');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    console.error('❌ Endpoint:', endpoint);
    console.error('❌ Options:', options);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      data: error.data
    });
    
    // Si c'est une erreur de réseau ou de connexion
    if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      console.error('Network error detected. Backend might be down or unreachable.');
      throw new Error('Impossible de se connecter au serveur. Le backend pourrait être indisponible.');
    }
    
    // Si c'est une erreur CORS
    if (error.message.includes('CORS')) {
      throw new Error('Erreur de configuration CORS. Contactez l\'administrateur.');
    }
    
    throw error;
  }
};

// Fonctions d'authentification
export const registerUser = async (userData) => {
  const response = await fetchData(API_ENDPOINTS.REGISTER, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  
  console.log('Register response:', response); // Debug log
  
  // Le backend retourne { success: true, data: { user: {...}, tokens: {...} } }
  // On retourne { user: {...}, token: "..." } pour le frontend
  return {
    user: response.data.user,
    token: response.data.tokens.accessToken
  };
};

export const loginUser = async (credentials) => {
  const response = await fetchData(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  console.log('Login response:', response); // Debug log
  
  // Le backend retourne { success: true, data: { user: {...}, tokens: {...} } }
  // On retourne { user: {...}, token: "..." } pour le frontend
  return {
    user: response.data.user,
    token: response.data.tokens.accessToken
  };
};

export const logoutUser = async () => {
  return fetchData(API_ENDPOINTS.LOGOUT, {
    method: 'POST',
  });
};

export const getCurrentUserProfile = async () => {
  const response = await fetchData(API_ENDPOINTS.PROFILE);
  
  // Le backend retourne { success: true, data: { user: {...} } }
  // On retourne directement l'objet user pour le frontend
  return response.data.user;
};

export const updateUserProfile = async (userData) => {
  const response = await fetchData(API_ENDPOINTS.PROFILE, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
  
  // Le backend retourne { success: true, data: { user: {...} } }
  // On retourne directement l'objet user pour le frontend
  return response.data.user;
};

export const forgotPassword = async (email) => {
  return fetchData(API_ENDPOINTS.FORGOT_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (token, newPassword) => {
  return fetchData(API_ENDPOINTS.RESET_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
};

// Fonctions pour les annonces immobilières
export const getRealEstateListings = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return fetchData(`${API_ENDPOINTS.REAL_ESTATE_LISTINGS}${queryString ? `?${queryString}` : ''}`);
};

export const getRealEstateListing = async (id) => {
  return fetchData(`${API_ENDPOINTS.REAL_ESTATE_LISTINGS}/${id}`);
};

export const createRealEstateListing = async (listingData) => {
  return fetchData(API_ENDPOINTS.REAL_ESTATE_LISTINGS, {
    method: 'POST',
    body: JSON.stringify(listingData),
  });
};

// Fonctions pour les annonces automobiles
export const getAutoListings = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return fetchData(`/auto/listings${queryString ? `?${queryString}` : ''}`);
};

export const getAutoListing = async (id) => {
  return fetchData(`/auto/listings/${id}`);
};

export const createAutoListing = async (listingData) => {
  return fetchData('/auto/listings', {
    method: 'POST',
    body: JSON.stringify(listingData),
  });
};

// Fonctions pour les services
export const getServices = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return fetchData(`/services${queryString ? `?${queryString}` : ''}`);
};

export const getService = async (id) => {
  return fetchData(`/services/${id}`);
};

export const createService = async (serviceData) => {
  return fetchData('/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  });
};

// Fonctions pour la marketplace générale
export const getMarketplaceListings = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return fetchData(`/marketplace/listings${queryString ? `?${queryString}` : ''}`);
};

export const getMarketplaceListing = async (id) => {
  return fetchData(`/marketplace/listings/${id}`);
};

export const createMarketplaceListing = async (listingData) => {
  return fetchData('/marketplace/listings', {
    method: 'POST',
    body: JSON.stringify(listingData),
  });
};

// Fonctions pour le blog
export const getBlogPosts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return fetchData(`/blog/posts${queryString ? `?${queryString}` : ''}`);
};

export const getBlogPost = async (id) => {
  return fetchData(`/blog/posts/${id}`);
};

export const createBlogPost = async (postData) => {
  return fetchData('/blog/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

// Fonctions pour les messages de contact
export const sendContactMessage = async (messageData) => {
  return fetchData(API_ENDPOINTS.CONTACT, {
    method: 'POST',
    body: JSON.stringify(messageData),
  });
};

// Fonctions pour les favoris
export const getFavorites = async () => {
  return fetchData(API_ENDPOINTS.FAVORITES);
};

export const addToFavorites = async (itemId, itemType) => {
  return fetchData(API_ENDPOINTS.FAVORITES, {
    method: 'POST',
    body: JSON.stringify({ itemId, itemType }),
  });
};

export const removeFromFavorites = async (itemId) => {
  return fetchData(`${API_ENDPOINTS.FAVORITES}/${itemId}`, {
    method: 'DELETE',
  });
};

// Fonctions pour les notifications
export const getNotifications = async () => {
  return fetchData(API_ENDPOINTS.NOTIFICATIONS);
};

export const markNotificationAsRead = async (notificationId) => {
  return fetchData(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`, {
    method: 'PUT',
  });
};

// Fonction de recherche globale
export const searchAll = async (query, filters = {}) => {
  const queryParams = new URLSearchParams({ q: query, ...filters }).toString();
  return fetchData(`${API_ENDPOINTS.SEARCH}?${queryParams}`);
};

// Fonctions d'administration
export const getDashboardStats = async () => {
  return fetchData(API_ENDPOINTS.ADMIN_DASHBOARD);
};

export const getAdminUsers = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`${API_ENDPOINTS.ADMIN_USERS}?${queryParams}`);
};

export const updateUserStatus = async (userId, statusData) => {
  return fetchData(API_ENDPOINTS.USER_STATUS(userId), {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  });
};

export const getAdminListings = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`${API_ENDPOINTS.ADMIN_LISTINGS}?${queryParams}`);
};

export const approveListing = async (listingId) => {
  return fetchData(API_ENDPOINTS.ADMIN_APPROVE_LISTING(listingId), {
    method: 'PATCH',
  });
};

export const rejectListing = async (listingId, reason) => {
  return fetchData(API_ENDPOINTS.ADMIN_REJECT_LISTING(listingId), {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
};

export const getAdminTransactions = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`${API_ENDPOINTS.ADMIN_TRANSACTIONS}?${queryParams}`);
};

// Fonctions de modération
export const getReportedContent = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`/admin/moderation/reports${queryParams ? `?${queryParams}` : ''}`);
};

export const moderateContent = async (reportId, actionData) => {
  return fetchData(`/admin/moderation/reports/${reportId}/moderate`, {
    method: 'POST',
    body: JSON.stringify(actionData),
  });
};

export const getModerationStats = async () => {
  return fetchData('/admin/moderation/stats');
};

export const getModerationLogs = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`/admin/moderation/logs${queryParams ? `?${queryParams}` : ''}`);
};

// Fonctions utilisateur supplémentaires
export const deleteUser = async (userId) => {
  return fetchData(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
};

export const updateUserRole = async (userId, roleData) => {
  return fetchData(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify(roleData),
  });
};

// Fonctions de listing supplémentaires
export const featureListing = async (listingId) => {
  return fetchData(`/admin/listings/${listingId}/feature`, {
    method: 'PATCH',
  });
};

// Fonctions d'analytics
export const getAnalyticsData = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`/admin/analytics${queryParams ? `?${queryParams}` : ''}`);
};

export const getUserGrowthData = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`/admin/analytics/users${queryParams ? `?${queryParams}` : ''}`);
};

export const getRevenueData = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`/admin/analytics/revenue${queryParams ? `?${queryParams}` : ''}`);
};

export const getListingsByCategory = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`/admin/analytics/listings-by-category${queryParams ? `?${queryParams}` : ''}`);
};

export const getSalesByCategory = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`/admin/analytics/sales-by-category${queryParams ? `?${queryParams}` : ''}`);
};

export const deleteListing = async (listingId) => {
  return fetchData(`/admin/listings/${listingId}`, {
    method: 'DELETE',
  });
};
export const getTrafficSources = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`/admin/analytics/traffic-sources${queryParams ? `?${queryParams}` : ''}`);
};

// Fonctions analytics supplémentaires
export const getUserAcquisitionData = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`/admin/analytics/user-acquisition${queryParams ? `?${queryParams}` : ''}`);
};

export const getTopProducts = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchData(`/admin/analytics/top-products${queryParams ? `?${queryParams}` : ''}`);
};