import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Bell, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const RealtimeNotification = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('realtime-notifications');
    
    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        const newMessage = payload.new;
        
        // Créer une notification
        const notification = {
          id: `notification-${Date.now()}`,
          type: 'new_message',
          title: 'Nouveau message',
          message: newMessage.content,
          sender: newMessage.sender_id,
          conversationId: newMessage.conversation_id,
          timestamp: new Date(),
          isRead: false
        };

        // Ajouter la notification
        setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Garder max 5 notifications

        // Jouer un son si pas en mode silencieux
        if (!isMuted) {
          playNotificationSound();
        }

        // Afficher une notification toast si supporté
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: 'maximarket-message',
            requireInteraction: false
          });
        }

        // Auto-supprimer après 5 secondes
        setTimeout(() => {
          removeNotification(notification.id);
        }, 5000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isMuted]);

  // Jouer un son de notification
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3'); // Vous devrez ajouter ce fichier
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback si le son ne peut pas être joué
        console.log('Son de notification non disponible');
      });
    } catch (error) {
      console.log('Erreur lecture son notification:', error);
    }
  };

  // Supprimer une notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Marquer comme lue
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  // Basculer le mode silencieux
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Masquer/Afficher les notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  if (!showNotifications || notifications.length === 0) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleNotifications}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Afficher les notifications"
        >
          <Bell size={20} />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Boutons de contrôle */}
      <div className="flex justify-end space-x-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className={`p-2 rounded-full shadow-lg transition-colors ${
            isMuted 
              ? 'bg-gray-600 text-white hover:bg-gray-700' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          title={isMuted ? 'Activer le son' : 'Désactiver le son'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleNotifications}
          className="p-2 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Masquer les notifications"
        >
          <X size={16} />
        </motion.button>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 200,
              delay: index * 0.1 
            }}
            className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              {/* Icône */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare size={16} className="text-blue-600" />
                </div>
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {notification.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  
                  {!notification.isRead && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Marquer lu
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RealtimeNotification; 