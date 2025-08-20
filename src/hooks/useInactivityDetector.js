import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import usePreferences from '@/hooks/usePreferences';

const useInactivityDetector = () => {
  const { session, logout, isRememberMe } = useAuth();
  const { preferences } = usePreferences();
  const inactivityTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Réinitialiser le timer d'inactivité
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Ne pas configurer le timer si l'utilisateur n'est pas connecté
    if (!session) return;

    // Ne pas configurer le timer si "Se souvenir de moi" est activé
    if (isRememberMe) return;

    // Ne pas configurer le timer si la déconnexion automatique est désactivée
    if (!preferences?.security_settings?.auto_logout) return;

    const timeoutMinutes = preferences.security_settings.session_timeout || 30;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    inactivityTimerRef.current = setTimeout(() => {
      console.log('🕐 Inactivité détectée, déconnexion automatique');
      logout();
    }, timeoutMs);
  }, [session, isRememberMe, preferences, logout]);

  // Gérer les événements d'activité
  const handleActivity = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Configurer les écouteurs d'événements
  useEffect(() => {
    if (!session) return;

    // Événements qui indiquent une activité utilisateur
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'focus',
      'input',
      'change'
    ];

    // Ajouter les écouteurs d'événements
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialiser le timer
    resetInactivityTimer();

    // Nettoyer les écouteurs et le timer
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [session, handleActivity, resetInactivityTimer]);

  // Nettoyer le timer lors de la déconnexion
  useEffect(() => {
    if (!session && inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, [session]);

  return {
    lastActivity: lastActivityRef.current,
    resetTimer: resetInactivityTimer
  };
};

export default useInactivityDetector;
