
const API_BASE_URL = "https://benome4ubackend.onrender.com/api";

// Fonction utilitaire pour les appels API
const fetchData = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue');
  }

  return data;
};

// Fonctions d'authentification
export const registerUser = async (userData) => {
  return fetchData('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (credentials) => {
  return fetchData('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const logoutUser = async () => {
  return fetchData('/auth/logout', {
    method: 'POST',
  });
};

export const getCurrentUserProfile = async () => {
  return fetchData('/auth/profile');
};

export const updateUserProfile = async (userData) => {
  return fetchData('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const forgotPassword = async (email) => {
  return fetchData('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (token, newPassword) => {
  return fetchData('/auth/reset-password', {
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
  const queryString = new URLSearchParams({
    q: query,
    ...filters,
  }).toString();
  return fetchData(`/search?${queryString}`);
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
