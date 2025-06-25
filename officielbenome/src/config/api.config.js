const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://officielbenome-backend.onrender.com/api';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  PROFILE: `${API_BASE_URL}/users/profile`,
  
  // Real Estate
  REAL_ESTATE_LISTINGS: `${API_BASE_URL}/real-estate/listings`,
  
  // Auto
  AUTO_LISTINGS: `${API_BASE_URL}/auto/listings`,
  
  // Services
  SERVICES: `${API_BASE_URL}/services`,
  
  // Marketplace
  MARKETPLACE_LISTINGS: `${API_BASE_URL}/marketplace/listings`,
  
  // Blog
  BLOG_POSTS: `${API_BASE_URL}/blog/posts`,
  
  // Contact
  CONTACT: `${API_BASE_URL}/contact`,
  
  // Favorites
  FAVORITES: `${API_BASE_URL}/favorites`,
  
  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  
  // Search
  SEARCH: `${API_BASE_URL}/search`
};

export default API_ENDPOINTS;
