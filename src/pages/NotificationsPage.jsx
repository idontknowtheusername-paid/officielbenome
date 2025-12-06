import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  MessageCircle, 
  ShoppingBag, 
  AlertCircle,
  Megaphone,
  Clock,
  ChevronRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notification.service';
import MobilePageLayout from '@/layouts/MobilePageLayout';
import useAppMode from '@/hooks/useAppMode';
import { cn } from '@/lib/utils';

// 1. IMPORT DU PULL-TO-REFRESH
import PullToRefresh from 'react-simple-pull-to-refresh';

// Icône selon le type de notification
const getNotificationIcon = (type) => {
  switch (type) {
    case 'message':
    case 'new_message':
      return <MessageCircle className="h-5 w-5 text-blue-500" />;
    case 'listing_approved':
      return <Check className="h-5 w-5 text-green-500" />;
    case 'listing_rejected':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'listing_sold':
      return <ShoppingBag className="h-5 w-5 text-purple-500" />;
    case 'boost':
    case 'boost_expired':
      return <Megaphone className="h-5 w-5 text-orange-500" />;
    case 'boost_activated':
      return <TrendingUp className="h-5 w-5 text-yellow-500" />;
    case 'new_listing':
      return <Sparkles className="h-5 w-5 text-indigo-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

// Formater la date relative
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAppMode } = useAppMode();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'personal', 'global'

  // 2. FONCTION DE RAFRAÎCHISSEMENT
  const handleRefresh = async () => {
    await loadNotifications();
  };

  // Charger les notifications
  useEffect(() => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // getUserNotifications récupère déjà les notifications personnelles ET globales
      const data = await notificationService.getUserNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Marquer toutes comme lues
  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues"
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer les notifications",
        variant: "destructive"
      });
    } finally {
      setMarkingAll(false);
    }
  };

  // Supprimer une notification
  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast({
        title: "Supprimée",
        description: "Notification supprimée"
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer",
        variant: "destructive"
      });
    }
  };

  // Clic sur une notification
  const handleNotificationClick = async (notification) => {
    // Marquer comme lue
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    
    // Rediriger selon le type
    const data = notification.data ? JSON.parse(notification.data) : {};
    switch (notification.type) {
      case 'message':
      case 'new_message':
        if (data.conversationId) {
          navigate(`/messages/${data.conversationId}`);
        } else {
          navigate('/messages');
        }
        break;
      case 'listing_approved':
      case 'listing_rejected':
      case 'listing_sold':
        if (data.listingId) navigate(`/annonce/${data.listingId}`);
        break;
      case 'boost':
      case 'boost_expired':
        if (data.listingId) navigate(`/annonce/${data.listingId}`);
        else navigate('/boost');
        break;
      case 'boost_activated':
      case 'new_listing':
        if (data.listingId) navigate(`/annonce/${data.listingId}`);
        break;
      default:
        break;
    }
  };

  // Filtrer les notifications selon l'onglet actif
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'personal') return !n.is_global;
    if (activeTab === 'global') return n.is_global;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const personalCount = notifications.filter(n => !n.is_global).length;
  const globalCount = notifications.filter(n => n.is_global).length;

  const content = (
    // 3. ENVELOPPE PULL TO REFRESH
    <PullToRefresh onRefresh={handleRefresh} pullingContent=''>
    <div className="min-h-screen bg-background">
      {/* Header avec actions */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span className="font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Tout marquer lu
            </Button>
          )}
        </div>

        {/* Onglets de filtrage */}
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'all'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Toutes
            {notifications.length > 0 && (
              <span className="ml-1.5 text-xs">({notifications.length})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'personal'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Mes notifications
            {personalCount > 0 && (
              <span className="ml-1.5 text-xs">({personalCount})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'global'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Actualités
            {globalCount > 0 && (
              <span className="ml-1.5 text-xs">({globalCount})</span>
            )}
          </button>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="divide-y divide-border">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : filteredNotifications.length === 0 ? (
          // État vide
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-1">
              {activeTab === 'personal' ? 'Aucune notification personnelle' : 
               activeTab === 'global' ? 'Aucune actualité' : 
               'Aucune notification'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {activeTab === 'personal' 
                ? 'Vous recevrez ici les alertes sur vos annonces et messages' 
                : activeTab === 'global'
                ? 'Les nouvelles annonces et boosts apparaîtront ici'
                : 'Vous recevrez ici toutes vos notifications'}
            </p>
          </div>
        ) : (
          // Liste
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "p-4 flex gap-3 cursor-pointer hover:bg-muted/50 transition-colors relative",
                !notification.read && "bg-primary/5"
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              {/* Badge "Global" pour les notifications globales */}
              {notification.is_global && (
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">
                    Actualité
                  </span>
                </div>
              )}

              {/* Icône */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                notification.read ? "bg-muted" : "bg-primary/10"
              )}>
                {getNotificationIcon(notification.type)}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm line-clamp-2",
                  !notification.read && "font-medium"
                )}>
                  {notification.title || notification.body}
                </p>
                {notification.body && notification.title && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {notification.body}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(notification.created_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
                {!notification.is_global && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </PullToRefresh>
  );

  // Utiliser MobilePageLayout en mode app
  if (isAppMode) {
    return (
      <MobilePageLayout title="Notifications" showBackButton>
        {content}
      </MobilePageLayout>
    );
  }

  return content;
};

export default NotificationsPage;