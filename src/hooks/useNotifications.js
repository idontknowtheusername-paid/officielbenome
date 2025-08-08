import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notification.service';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les notifications
  const loadNotifications = useCallback(async (filters = {}) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await notificationService.getUserNotifications(user.id, filters);
      setNotifications(data);
      
      // Mettre à jour le compteur de non lues
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      setError(err.message);
      console.error('Erreur chargement notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Marquer comme lue
  const markAsRead = useCallback(async (notificationId) => {
    if (!user) return;

    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
      console.error('Erreur marquage lu:', err);
    }
  }, [user]);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
      console.error('Erreur marquage toutes lues:', err);
    }
  }, [user]);

  // Supprimer une notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!user) return;

    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Vérifier si c'était une notification non lue
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err.message);
      console.error('Erreur suppression notification:', err);
    }
  }, [user, notifications]);

  // Ajouter une nouvelle notification (pour les tests ou notifications locales)
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Écouter les nouvelles notifications en temps réel
  useEffect(() => {
    if (!user) return;

    // Charger les notifications initiales
    loadNotifications();

    // S'abonner aux nouvelles notifications
    notificationService.subscribeToNotifications(user.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      if (!newNotification.is_read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      notificationService.unsubscribeFromNotifications();
    };
  }, [user, loadNotifications]);

  // Fonctions utilitaires
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.is_read);
  }, [notifications]);

  const getReadNotifications = useCallback(() => {
    return notifications.filter(n => n.is_read);
  }, [notifications]);

  const searchNotifications = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return notifications;
    
    return notifications.filter(n => 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notifications]);

  // Statistiques
  const getStats = useCallback(() => {
    const stats = {
      total: notifications.length,
      unread: unreadCount,
      read: notifications.length - unreadCount,
      byType: {}
    };

    notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });

    return stats;
  }, [notifications, unreadCount]);

  return {
    // État
    notifications,
    unreadCount,
    isLoading,
    error,
    
    // Actions
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    
    // Fonctions utilitaires
    getNotificationsByType,
    getUnreadNotifications,
    getReadNotifications,
    searchNotifications,
    getStats,
    
    // État dérivé
    hasUnread: unreadCount > 0,
    totalCount: notifications.length
  };
};

// Hook pour les notifications temps réel uniquement
export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const [latestNotification, setLatestNotification] = useState(null);

  useEffect(() => {
    if (!user) return;

    notificationService.subscribeToNotifications(user.id, (newNotification) => {
      setLatestNotification(newNotification);
      
      // Afficher une notification toast si supporté
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico'
        });
      }
    });

    return () => {
      notificationService.unsubscribeFromNotifications();
    };
  }, [user]);

  return {
    latestNotification,
    clearLatest: () => setLatestNotification(null)
  };
};

// Hook pour les préférences de notification
export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { preferencesService } = await import('../services/preferences.service');
      const data = await preferencesService.getUserPreferences(user.id);
      setPreferences(data);
    } catch (error) {
      console.error('Erreur chargement préférences notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updatePreference = useCallback(async (type, channel, enabled) => {
    if (!user) return;

    try {
      const { preferencesService } = await import('../services/preferences.service');
      await preferencesService.updateNotificationPreferences(user.id, `${channel}_notifications`, {
        [type]: enabled
      });
      
      // Recharger les préférences
      await loadPreferences();
    } catch (error) {
      console.error('Erreur mise à jour préférence notification:', error);
    }
  }, [user, loadPreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    isLoading,
    updatePreference,
    reload: loadPreferences
  };
}; 