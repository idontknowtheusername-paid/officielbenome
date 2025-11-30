import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook pour détecter l'inactivité de l'utilisateur
 * @param {number} timeout - Délai d'inactivité en millisecondes
 * @param {number} warningTime - Temps d'avertissement avant déconnexion en millisecondes
 * @param {function} onIdle - Callback appelé quand l'utilisateur est inactif
 * @param {function} onWarning - Callback appelé pour avertir l'utilisateur
 * @param {boolean} enabled - Active/désactive le timer
 */
export const useIdleTimer = ({
  timeout = 60 * 60 * 1000, // 1 heure par défaut
  warningTime = 2 * 60 * 1000, // 2 minutes d'avertissement
  onIdle,
  onWarning,
  enabled = true
}) => {
  const [isIdle, setIsIdle] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const idleTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Réinitialiser les timers
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();
    setIsIdle(false);
    setShowWarning(false);
    setTimeLeft(0);

    // Nettoyer les timers existants
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Timer pour l'avertissement
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(warningTime);
      
      if (onWarning) onWarning();

      // Démarrer le compte à rebours
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }, timeout - warningTime);

    // Timer pour la déconnexion
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      setShowWarning(false);
      if (onIdle) onIdle();
    }, timeout);
  }, [enabled, timeout, warningTime, onIdle, onWarning]);

  // Événements à surveiller pour détecter l'activité
  const events = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'wheel'
  ];

  // Gestionnaire d'événements avec throttle
  const handleActivity = useCallback(() => {
    const now = Date.now();
    // Throttle: ignorer les événements trop rapprochés (< 1 seconde)
    if (now - lastActivityRef.current < 1000) return;
    
    resetTimer();
  }, [resetTimer]);

  // Fonction pour continuer la session (appelée depuis le modal)
  const continueSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Fonction pour obtenir le temps restant avant déconnexion
  const getTimeUntilIdle = useCallback(() => {
    if (!enabled) return 0;
    const elapsed = Date.now() - lastActivityRef.current;
    return Math.max(0, timeout - elapsed);
  }, [enabled, timeout]);

  useEffect(() => {
    if (!enabled) {
      // Nettoyer tous les timers si désactivé
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    // Initialiser le timer
    resetTimer();

    // Ajouter les listeners d'événements
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Nettoyer à la destruction
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [enabled, handleActivity, resetTimer]);

  return {
    isIdle,
    showWarning,
    timeLeft,
    continueSession,
    getTimeUntilIdle,
    resetTimer
  };
};
