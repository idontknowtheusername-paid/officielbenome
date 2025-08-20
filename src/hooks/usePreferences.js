import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Préférences par défaut
const DEFAULT_PREFERENCES = {
  theme: 'light',
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  privacy: {
    profile_visibility: 'public',
    show_online_status: true,
    allow_messages: true
  },
  security_settings: {
    two_factor_auth: false,
    login_notifications: true,
    session_timeout: 30,
    require_password_change: false,
    remember_me_enabled: true,
    auto_logout: true,
    max_session_age: 7
  },
  customization: {
    primary_color: '#3B82F6',
    accent_color: '#10B981',
    font_size: 'medium',
    animations_enabled: true
  }
};

const usePreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les préférences depuis localStorage
  const loadPreferences = async () => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Charger depuis localStorage
      const storedPrefs = localStorage.getItem(`maximarket-preferences-${user.id}`);
      if (storedPrefs) {
        const parsedPrefs = JSON.parse(storedPrefs);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsedPrefs });
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des préférences:', err);
      setError(err.message);
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une préférence
  const updatePreference = async (key, value) => {
    if (!user) return;

    try {
      // Mettre à jour localement d'abord
      const newPreferences = { ...preferences };
      const keys = key.split('.');
      let current = newPreferences;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      setPreferences(newPreferences);

      // Sauvegarder dans localStorage
      localStorage.setItem(`maximarket-preferences-${user.id}`, JSON.stringify(newPreferences));
    } catch (err) {
      console.error('Erreur lors de la mise à jour des préférences:', err);
      setError(err.message);
    }
  };

  // Mettre à jour plusieurs préférences
  const updateMultiplePreferences = async (updates) => {
    if (!user) return;

    try {
      const newPreferences = { ...preferences };
      
      Object.entries(updates).forEach(([key, value]) => {
        const keys = key.split('.');
        let current = newPreferences;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
      });

      setPreferences(newPreferences);
      localStorage.setItem(`maximarket-preferences-${user.id}`, JSON.stringify(newPreferences));
    } catch (err) {
      console.error('Erreur lors de la mise à jour des préférences:', err);
      setError(err.message);
    }
  };

  // Réinitialiser les préférences
  const resetPreferences = async () => {
    if (!user) return;

    try {
      setPreferences(DEFAULT_PREFERENCES);
      localStorage.removeItem(`maximarket-preferences-${user.id}`);
    } catch (err) {
      console.error('Erreur lors de la réinitialisation des préférences:', err);
      setError(err.message);
    }
  };

  // Charger les préférences au changement d'utilisateur
  useEffect(() => {
    loadPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    error,
    updatePreference,
    updateMultiplePreferences,
    resetPreferences,
    reloadPreferences: loadPreferences
  };
};

export default usePreferences;
