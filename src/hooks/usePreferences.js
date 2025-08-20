import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { preferencesService } from '@/services/preferences.service';

const usePreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les préférences
  const loadPreferences = async () => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userPrefs = await preferencesService.getUserPreferences(user.id);
      setPreferences(userPrefs);
    } catch (err) {
      console.error('Erreur lors du chargement des préférences:', err);
      setError(err.message);
      // Utiliser les préférences par défaut en cas d'erreur
      const defaultPrefs = await preferencesService.getDefaultPreferences();
      setPreferences(defaultPrefs);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une préférence
  const updatePreference = async (key, value) => {
    if (!user || !preferences) return;

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

      // Sauvegarder sur le serveur
      await preferencesService.updateUserPreferences(user.id, newPreferences);
    } catch (err) {
      console.error('Erreur lors de la mise à jour des préférences:', err);
      setError(err.message);
      
      // Recharger les préférences en cas d'erreur
      await loadPreferences();
    }
  };

  // Mettre à jour plusieurs préférences
  const updateMultiplePreferences = async (updates) => {
    if (!user || !preferences) return;

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
      await preferencesService.updateUserPreferences(user.id, newPreferences);
    } catch (err) {
      console.error('Erreur lors de la mise à jour des préférences:', err);
      setError(err.message);
      await loadPreferences();
    }
  };

  // Réinitialiser les préférences
  const resetPreferences = async () => {
    if (!user) return;

    try {
      const defaultPrefs = await preferencesService.getDefaultPreferences();
      setPreferences(defaultPrefs);
      await preferencesService.updateUserPreferences(user.id, defaultPrefs);
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
