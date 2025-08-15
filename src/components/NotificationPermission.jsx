import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, CheckCircle, XCircle, AlertTriangle, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useToast } from './ui/use-toast';

const NotificationPermission = ({ className = '' }) => {
  const { toast } = useToast();
  const {
    permission,
    isSupported,
    isLoading,
    error,
    requestPermission,
    testNotification,
    clearError
  } = usePushNotifications();

  const [showDetails, setShowDetails] = useState(false);

  // Gérer la demande de permission
  const handleRequestPermission = async () => {
    try {
      await requestPermission();
      toast({
        title: "Notifications activées !",
        description: "Vous recevrez maintenant des notifications pour les nouveaux messages.",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Erreur d'activation",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Tester les notifications
  const handleTestNotification = async () => {
    try {
      await testNotification();
      toast({
        title: "Notification de test envoyée !",
        description: "Vérifiez que vous avez bien reçu la notification.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erreur de test",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Si les notifications ne sont pas supportées
  if (!isSupported) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Notifications non supportées
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Votre navigateur ne supporte pas les notifications push. 
              Mettez à jour votre navigateur ou utilisez un navigateur moderne.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Si la permission est accordée
  if (permission === 'granted') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Notifications activées
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Vous recevrez des notifications pour les nouveaux messages et activités.
            </p>
            <div className="mt-3 flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleTestNotification}
                disabled={isLoading}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                Tester les notifications
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="text-green-600 hover:text-green-800"
              >
                <Settings className="h-4 w-4 mr-1" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>

        {/* Détails des paramètres */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-green-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Son des notifications</span>
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Activé</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Notifications au démarrage</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Activé</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Mode silencieux</span>
                  <div className="flex items-center space-x-2">
                    <BellOff className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Désactivé</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Si la permission est refusée
  if (permission === 'denied') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-start space-x-3">
          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Notifications désactivées
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Vous avez refusé les notifications. Pour les réactiver, allez dans les paramètres de votre navigateur.
            </p>
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Ouvrir les paramètres du navigateur
                  if (navigator.userAgent.includes('Chrome')) {
                    window.open('chrome://settings/content/notifications', '_blank');
                  } else if (navigator.userAgent.includes('Firefox')) {
                    window.open('about:preferences#privacy', '_blank');
                  } else {
                    // Instructions générales
                    toast({
                      title: "Réactiver les notifications",
                      description: "Allez dans les paramètres de votre navigateur > Confidentialité > Notifications et autorisez MaxiMarket.",
                      duration: 8000,
                    });
                  }
                }}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                Ouvrir les paramètres
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Si la permission n'est pas encore demandée
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Activer les notifications
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Recevez des notifications en temps réel pour les nouveaux messages et activités importantes.
          </p>
          <div className="mt-3 flex space-x-2">
            <Button
              size="sm"
              onClick={handleRequestPermission}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Activation...' : 'Activer les notifications'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800"
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </div>

      {/* Détails sur les notifications */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-blue-200"
          >
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <span className="text-sm text-blue-700">
                  Nouveaux messages de la part d'autres utilisateurs
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <span className="text-sm text-blue-700">
                  Réponses à vos annonces
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <span className="text-sm text-blue-700">
                  Mises à jour importantes de votre compte
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <span className="text-sm text-blue-700">
                  Offres et promotions exclusives
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotificationPermission; 