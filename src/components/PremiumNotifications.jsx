import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  Star,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const PremiumNotifications = ({ userId, className = '' }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Simuler des notifications premium
    const mockNotifications = [
      {
        id: 1,
        type: 'boost_success',
        title: 'Boost activé avec succès !',
        message: 'Votre annonce "Appartement moderne" est maintenant boostée pour 7 jours.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
        read: false,
        priority: 'high'
      },
      {
        id: 2,
        type: 'boost_expiring',
        title: 'Boost expirant bientôt',
        message: 'Votre boost expire dans 2 jours. Renouvelez-le pour maintenir la visibilité.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h ago
        read: false,
        priority: 'medium'
      },
      {
        id: 3,
        type: 'payment_success',
        title: 'Paiement confirmé',
        message: 'Votre paiement de 12 000 FCFA a été confirmé. Merci !',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1j ago
        read: true,
        priority: 'low'
      },
      {
        id: 4,
        type: 'performance_insight',
        title: 'Nouveau record !',
        message: 'Votre annonce boostée a généré 45 vues aujourd\'hui (+120%).',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2j ago
        read: true,
        priority: 'medium'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [userId]);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const deleted = notifications.find(n => n.id === notificationId);
      return deleted && !deleted.read ? Math.max(0, prev - 1) : prev;
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'boost_success':
        return <Zap className="h-5 w-5 text-green-500" />;
      case 'boost_expiring':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'payment_success':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'performance_insight':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-4 border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `Il y a ${minutes} min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else {
      return `Il y a ${days}j`;
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Notifications Premium</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
            >
              Tout marquer comme lu
            </Button>
          )}
          
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="ghost"
            size="sm"
          >
            {showAll ? 'Voir moins' : 'Voir tout'}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {displayedNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${getNotificationColor(notification.priority)} ${
              !notification.read ? 'ring-2 ring-primary/20' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={`font-medium text-sm ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {notification.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              Important
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => deleteNotification(notification.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* État vide */}
      {notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="text-gray-400 text-4xl mb-2">🔔</div>
          <p className="text-gray-500">Aucune notification pour le moment</p>
        </motion.div>
      )}

      {/* Bouton pour voir plus */}
      {notifications.length > 3 && !showAll && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Button
            onClick={() => setShowAll(true)}
            variant="outline"
            size="sm"
          >
            Voir {notifications.length - 3} notification(s) de plus
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default PremiumNotifications;
