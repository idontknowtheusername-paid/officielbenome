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
    if (isRememberMe) {
      console.log('🔒 Mode "Se souvenir" activé, pas de déconnexion automatique');
      return;
    }

    // Vérifier si la déconnexion automatique est activée dans les préférences
    const autoLogoutEnabled = preferences?.security_settings?.auto_logout ?? true; // Par défaut true
    if (!autoLogoutEnabled) {
      console.log('🔒 Déconnexion automatique désactivée dans les préférences');
      return;
    }

    const timeoutMinutes = preferences?.security_settings?.session_timeout ?? 30; // Par défaut 30 min
    const timeoutMs = timeoutMinutes * 60 * 1000;

    console.log(`⏰ Configuration du timer d'inactivité: ${timeoutMinutes} minutes`);

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

    console.log('🔍 Configuration des écouteurs d\'activité');

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
      console.log('🧹 Nettoyage des écouteurs d\'activité');
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
      console.log('🚪 Déconnexion détectée, nettoyage du timer');
      clearTimeout(inactivityTimerRef.current);
    }
  }, [session]);

  return {
    lastActivity: lastActivityRef.current,
    resetTimer: resetInactivityTimer
  };
};

export default useInactivityDetector;
