import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api.config';

// Création d'une instance axios avec une configuration de base
const api = axios.create({
  baseURL: API_BASE_URL, // Correction ici : utiliser la vraie base URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important pour les cookies d'authentification
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses d'erreur
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 (non autorisé) et que ce n'est pas une tentative de rafraîchissement
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Essayer de rafraîchir le token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data;
          
          // Mettre à jour les tokens
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Mettre à jour le header d'autorisation
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Renvoyer la requête originale avec le nouveau token
          return api(originalRequest);
        }
      } catch (error) {
        // En cas d'échec de rafraîchissement, déconnecter l'utilisateur
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
