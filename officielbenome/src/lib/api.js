import API_ENDPOINTS from '@/config/api.config';

const API_BASE_URL = "https://officielbenome-backend.onrender.com/api";

// Fonction utilitaire pour les appels API
const fetchData = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Important pour les cookies d'authentification
    });

    // Si la réponse est 204 No Content, on ne tente pas de parser le JSON
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Une erreur est survenue');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Fonctions d'authentification
export const registerUser = async (userData) => {
  const response = await fetchData(API_ENDPOINTS.REGISTER, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  
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
  return fetchData(`/real-estate/listings${queryString ? `?${queryString}` : ''}`);
};

export const getRealEstateListing = async (id) => {
  return fetchData(`/real-estate/listings/${id}`);
};

export const createRealEstateListing = async (listingData) => {
  return fetchData('/real-estate/listings', {
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
  return fetchData('/contact', {
    method: 'POST',
    body: JSON.stringify(messageData),
  });
};

// Fonctions pour les favoris
export const getFavorites = async () => {
  return fetchData('/favorites');
};

export const addToFavorites = async (itemId, itemType) => {
  return fetchData('/favorites', {
    method: 'POST',
    body: JSON.stringify({ itemId, itemType }),
  });
};

export const removeFromFavorites = async (itemId) => {
  return fetchData(`/favorites/${itemId}`, {
    method: 'DELETE',
  });
};

// Fonctions pour les notifications
export const getNotifications = async () => {
  return fetchData('/notifications');
};

export const markNotificationAsRead = async (notificationId) => {
  return fetchData(`/notifications/${notificationId}/read`, {
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

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getRealEstateListings,
  getRealEstateListing,
  createRealEstateListing,
  getAutoListings,
  getAutoListing,
  createAutoListing,
  getServices,
  getService,
  createService,
  getMarketplaceListings,
  getMarketplaceListing,
  createMarketplaceListing,
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  sendContactMessage,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getNotifications,
  markNotificationAsRead,
  searchAll,
};
