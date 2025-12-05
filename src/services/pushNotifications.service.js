import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/lib/supabase';

export const initializePushNotifications = async () => {
  // Ne rien faire si on n'est pas sur une plateforme native
  if (!Capacitor.isNativePlatform()) {
    console.log('🔔 Push notifications: Skipping - not on native platform');
    return;
  }

  try {
    console.log('🔔 Initializing push notifications...');
    
    // Demander les permissions
    const permission = await PushNotifications.requestPermissions();
    console.log('📱 Push permission status:', permission.receive);
    
    if (permission.receive === 'granted') {
      // Enregistrer pour les notifications
      await PushNotifications.register();
      console.log('✅ Push notifications registered');
      
      // Écouter l'enregistrement
      PushNotifications.addListener('registration', async (token) => {
        console.log('🎯 Push registration success: ', token.value);
        
        // Sauvegarder le token dans Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('user_push_tokens')
              .upsert({
                user_id: user.id,
                token: token.value,
                platform: 'mobile',
                created_at: new Date().toISOString()
              });
            console.log('💾 Push token saved to Supabase');
          }
        } catch (error) {
          console.error('❌ Error saving push token:', error);
        }
      });
      
      // Écouter les notifications reçues
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📨 Push received: ', notification);
        
        // Afficher une notification locale si l'app est ouverte
        if (notification.data) {
          // Vous pouvez ajouter ici la logique pour afficher une notification locale
          console.log('📱 Local notification data:', notification.data);
        }
      });
      
      // Écouter les clics sur notifications
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('👆 Push action performed: ', notification);
        
        // Navigation basée sur l'action de la notification
        if (notification.notification.data?.action) {
          handleNotificationAction(notification.notification.data.action);
        }
      });
      
      console.log('✅ Push notifications initialized successfully');
    } else {
      console.log('❌ Push notifications permission denied');
    }
  } catch (error) {
    console.error('❌ Push notifications error:', error);
  }
};

// Fonction pour gérer les actions des notifications
const handleNotificationAction = (action) => {
  console.log('🎯 Handling notification action:', action);
  
  // Navigation basée sur l'action
  switch (action) {
    case 'new_message':
      // Naviguer vers les messages
      window.location.href = '/messages';
      break;
    case 'new_listing':
      // Naviguer vers les nouvelles annonces
      window.location.href = '/marketplace';
      break;
    case 'boost_expired':
      // Naviguer vers les boosts
      window.location.href = '/boosts';
      break;
    default:
      console.log('Unknown notification action:', action);
  }
};

// Fonction pour envoyer une notification de test
export const sendTestNotification = async () => {
  try {
    console.log('🧪 Sending test notification...');
    
    // Cette fonction serait normalement appelée depuis votre backend
    // Pour le test, on simule juste l'enregistrement
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('✅ Test notification would be sent to user:', user.id);
    }
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
  }
};

// Fonction pour désactiver les notifications
export const disablePushNotifications = async () => {
  // Ne rien faire si on n'est pas sur une plateforme native
  if (!Capacitor.isNativePlatform()) {
    console.log('🔕 Push notifications: Skipping disable - not on native platform');
    return;
  }

  try {
    console.log('🔕 Disabling push notifications...');
    
    // Supprimer le token de la base de données
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_push_tokens')
        .delete()
        .eq('user_id', user.id);
      console.log('✅ Push token removed from database');
    }
    
    // Désenregistrer les notifications
    await PushNotifications.removeAllListeners();
    console.log('✅ Push notifications disabled');
  } catch (error) {
    console.error('❌ Error disabling push notifications:', error);
  }
};
