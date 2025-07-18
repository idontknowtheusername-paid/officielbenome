import api from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

const AuthService = {
  // Se connecter
  async login(credentials) {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
      const { token, refreshToken, user } = response.data;
      
      // Stocker les tokens dans le localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // S'inscrire
  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Se déconnecter
  async logout() {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Supprimer les tokens du localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  // Récupérer le profil utilisateur
  async getProfile() {
    try {
      const response = await api.get(API_ENDPOINTS.PROFILE);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Réinitialiser le mot de passe
  async forgotPassword(email) {
    try {
      const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Réinitialiser le mot de passe avec un token
  async resetPassword(token, password) {
    try {
      const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, { token, password });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
};

export default AuthService;
