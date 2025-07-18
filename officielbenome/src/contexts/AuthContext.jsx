
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, getCurrentUserProfile, logoutUser } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await getCurrentUserProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      console.log('AuthContext login response:', response); // Debug log
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur MaxiMarket !",
      });
      navigate('/');
      return true;
    } catch (error) {
      console.error('Login error:', error); // Debug log
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      console.log('AuthContext register response:', response); // Debug log
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      toast({
        title: "Inscription réussie",
        description: "Bienvenue sur MaxiMarket !",
      });
      navigate('/');
      return true;
    } catch (error) {
      console.error('Register error:', error); // Debug log
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('authToken');
      setUser(null);
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Vérifie si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    if (!user) return false;
    // Si l'utilisateur a un tableau de rôles, vérifie s'il contient le rôle demandé
    if (Array.isArray(user.roles)) {
      return user.roles.includes(role);
    }
    // Si l'utilisateur a un seul rôle (string)
    return user.role === role || user.roles === role;
  };

  // Vérifie si l'utilisateur a l'un des rôles spécifiés
  const hasAnyRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.some(role => hasRole(role));
    }
    return hasRole(roles);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
