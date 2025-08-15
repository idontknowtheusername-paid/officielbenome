import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Vérifier le support des notifications push
  useEffect(() => {
    const checkSupport = () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasPushManager = 'PushManager' in window;
      const hasNotifications = 'Notification' in window;
      
      setIsSupported(hasServiceWorker && hasPushManager && hasNotifications);
      
      if (hasNotifications) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Demander la permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Notifications push non supportées par ce navigateur');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Demander l'inscription automatiquement
        await subscribeToPush();
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Convertir la clé VAPID en Uint8Array
  const urlBase64ToUint8Array = useCallback((base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }, []);

  // S'inscrire aux notifications push
  const subscribeToPush = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      throw new Error('Permissions insuffisantes pour les notifications push');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Enregistrer le service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Attendre que le service worker soit actif
      await navigator.serviceWorker.ready;

      // Vérifier s'il y a déjà une subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);
        return existingSubscription;
      }

      // Créer une nouvelle subscription
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        throw new Error('Clé VAPID publique non configurée');
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setSubscription(newSubscription);

      // Envoyer la subscription au serveur (à implémenter)
      await saveSubscriptionToServer(newSubscription);

      return newSubscription;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, urlBase64ToUint8Array]);

  // Se désinscrire des notifications push
  const unsubscribeFromPush = useCallback(async () => {
    if (!subscription) return;

    setIsLoading(true);
    setError(null);

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Supprimer la subscription du serveur (à implémenter)
      await removeSubscriptionFromServer(subscription);

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  // Sauvegarder la subscription sur le serveur
  const saveSubscriptionToServer = async (subscription) => {
    if (!user) return;

    try {
      // Ici vous devriez envoyer la subscription à votre API
      // const response = await fetch('/api/push-subscriptions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     userId: user.id,
      //     subscription: subscription.toJSON()
      //   })
      // });
      
      console.log('Subscription sauvegardée:', subscription.toJSON());
    } catch (error) {
      console.error('Erreur sauvegarde subscription:', error);
    }
  };

  // Supprimer la subscription du serveur
  const removeSubscriptionFromServer = async (subscription) => {
    if (!user) return;

    try {
      // Ici vous devriez supprimer la subscription de votre API
      // const response = await fetch(`/api/push-subscriptions/${user.id}`, {
      //   method: 'DELETE'
      // });
      
      console.log('Subscription supprimée du serveur');
    } catch (error) {
      console.error('Erreur suppression subscription:', error);
    }
  };

  // Tester les notifications push
  const testNotification = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      throw new Error('Notifications non autorisées');
    }

    try {
      const testNotification = new Notification('Test MaxiMarket', {
        body: 'Ceci est une notification de test !',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false
      });

      // Auto-fermer après 3 secondes
      setTimeout(() => {
        testNotification.close();
      }, 3000);

      return testNotification;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [isSupported, permission]);

  // Écouter les clics sur les notifications
  useEffect(() => {
    const handleNotificationClick = (event) => {
      event.notification.close();
      
      // Ici vous pouvez ajouter la logique pour naviguer vers la page appropriée
      // Par exemple, ouvrir la conversation si c'est un message
      console.log('Notification cliquée:', event.notification);
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          handleNotificationClick(event.data);
        }
      });
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleNotificationClick);
      }
    };
  }, []);

  return {
    // État
    permission,
    subscription,
    isSupported,
    isLoading,
    error,
    
    // Actions
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    testNotification,
    
    // Utilitaires
    canRequestPermission: isSupported && permission === 'default',
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isSubscribed: !!subscription,
    
    // Réinitialiser l'erreur
    clearError: () => setError(null)
  };
}; 