import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useConversations, useRealtimeMessages, useDeleteConversation } from '@/hooks/useMessages';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Phone, 
  MoreVertical,
  User,
  Star,
  Archive,
  Trash2,
  Send,
  Paperclip,
  Smile,
  Plus,
  Camera,
  Mic,
  Edit3,
  Copy,
  Flag,
  Eye,
  ChevronLeft,
  Home,
  Car,
  Briefcase,
  ShoppingBag,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MobileMessagingNav, 
  MessagingSearch, 
  MessageInput,
  AudioCallInterface
} from '@/components/messaging';
import messageService from '@/services/message.service';
import { UserAvatar } from '@/components/ui';
import AssistantAvatar from '@/components/messaging/AssistantAvatar';

// Configuration du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Composant de navigation principale
const MainNavigation = ({ onClose }) => {
  const navigate = useNavigate();
  
  const navItems = [
    { name: 'Accueil', path: '/' },
    { name: 'Immobilier', path: '/immobilier' },
    { name: 'Automobile', path: '/automobile' },
    { name: 'Services', path: '/services' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Mon Compte', path: '/profile' },
  ];

  return (
    <div className="md:hidden bg-card border-b border-border p-4">
      <div className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            className="text-left px-4 py-2 hover:bg-accent rounded-md transition-colors"
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// Composant de bouton de thème
const ThemeToggleButton = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex-shrink-0"
      aria-label="Changer de thème"
    >
      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

// Composant principal de la page de messagerie
const MessagingPageContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: conversations, isLoading, error, refetch } = useConversations();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messagesPage, setMessagesPage] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isMessageSelectionMode, setIsMessageSelectionMode] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [audioCallTarget, setAudioCallTarget] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const messagesContainerRef = useRef(null);

  // Détecter si on est sur mobile - Optimisé avec useCallback
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Utiliser le hook de chat en temps réel
  useRealtimeMessages(selectedConversation?.id);

  // Mutation pour supprimer une conversation
  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId) => messageService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
      toast({
        title: "Conversation supprimée",
        description: "La conversation a été supprimée définitivement",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la conversation",
        variant: "destructive",
      });
    }
  });

  // Vérifier les paramètres d'URL pour ouvrir automatiquement une conversation
  useEffect(() => {
    if (!conversations || conversations.length === 0) return;

    const conversationId = searchParams.get('conversation');
    const listingId = searchParams.get('listing');

    if (conversationId && !selectedConversation) {
      // Trouver la conversation dans la liste
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        logger.log('🔍 Ouverture automatique de la conversation:', conversationId);
        setSelectedConversation(conversation);
        loadMessages(conversation.id);
      }
    } else if (listingId && !selectedConversation) {
      // Trouver une conversation liée à cette annonce
      const conversation = conversations.find(c => c.listing_id === listingId);
      if (conversation) {
        logger.log('🔍 Ouverture automatique de la conversation pour l\'annonce:', listingId);
        setSelectedConversation(conversation);
        loadMessages(conversation.id);
      }
    }
  }, [conversations, searchParams, selectedConversation]);

  // Subscription en temps réel pour les nouvelles conversations
  useEffect(() => {
    if (!user) return;

    logger.log('🔌 Initialisation subscription conversations');

    const channel = supabase
      .channel('conversations-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
        filter: `participant1_id=eq.${user.id} OR participant2_id=eq.${user.id}`
      }, (payload) => {
        logger.log('🆕 Nouvelle conversation reçue:', payload.new.id);
        // Rafraîchir immédiatement pour synchroniser les stats
        refetch();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `participant1_id=eq.${user.id} OR participant2_id=eq.${user.id}`
      }, (payload) => {
        logger.log('🔄 Conversation mise à jour:', payload.new.id);
        // Rafraîchir immédiatement pour synchroniser les stats
        refetch();
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'conversations',
        filter: `participant1_id=eq.${user.id} OR participant2_id=eq.${user.id}`
      }, (payload) => {
        logger.log('🗑️ Conversation supprimée:', payload.old.id);
        // Rafraîchir immédiatement pour synchroniser les stats
        refetch();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.log('✅ Subscription conversations active');
        }
      });

    return () => {
      logger.log('🔌 Désabonnement conversations');
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  // Rafraîchissement périodique pour garantir synchronisation 100%
  useEffect(() => {
    if (!user) return;

    logger.log('⏰ Activation rafraîchissement périodique (30s)');

    // Rafraîchir toutes les 30 secondes pour garantir la synchronisation
    const intervalId = setInterval(() => {
      logger.log('🔄 Rafraîchissement périodique des conversations');
      refetch();
    }, 30000); // 30 secondes

    return () => {
      logger.log('⏰ Désactivation rafraîchissement périodique');
      clearInterval(intervalId);
    };
  }, [user, refetch]);

  // Subscription globale pour les notifications (sans conflit avec useRealtimeMessages)
  useEffect(() => {
    if (!user) return;

    logger.log('🔌 Initialisation notifications globales');

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        logger.log('🔔 Nouveau message reçu:', payload.new.id);
        
        // Rafraîchir immédiatement pour synchroniser les stats
        setTimeout(() => {
          refetch();
        }, 100);
        
        // Notification toast pour les nouveaux messages (seulement si pas dans la conversation active)
        if (payload.new.sender_id !== user.id && 
            (!selectedConversation || payload.new.conversation_id !== selectedConversation.id)) {
          toast({
            title: "Nouveau message",
            description: "Vous avez reçu un nouveau message",
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        // Détecter si un message a été marqué comme lu
        if (payload.old.is_read === false && payload.new.is_read === true) {
          logger.log('✅ Message marqué comme lu:', payload.new.id);
          // Rafraîchir immédiatement pour synchroniser les stats
          setTimeout(() => {
            refetch();
          }, 100);
        }
      })
      .subscribe((status) => {
        logger.log('🔌 Statut notifications globales:', status);
        if (status === 'SUBSCRIBED') {
          logger.log('✅ Notifications globales actives - Stats synchronisées en temps réel');
        } else if (status === 'CHANNEL_ERROR') {
          logger.error('❌ Erreur notifications globales');
        }
      });

    return () => {
      logger.log('🔌 Désabonnement notifications globales');
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation, refetch, toast]);

  // Charger les messages d'une conversation avec pagination
  const loadMessages = useCallback(async (conversationId, page = 0, append = false) => {
    if (!conversationId) return;
    
    if (!append) {
      setIsLoadingMessages(true);
      setMessagesPage(0);
      setHasMoreMessages(true);
    } else {
      setIsLoadingMoreMessages(true);
    }

    try {
      const pageSize = 50;
      const data = await messageService.getConversationMessages(conversationId, {
        from: page * pageSize,
        to: (page + 1) * pageSize - 1
      });

      if (append) {
        setMessages(prev => [...data, ...prev]); // Ajouter au début
      } else {
        setMessages(data);
      }

      // Si moins de messages que la taille de page, on a tout chargé
      if (data.length < pageSize) {
        setHasMoreMessages(false);
      }

      setMessagesPage(page);
      
      // Marquer comme lus
      if (!append) {
        await messageService.markMessagesAsRead(conversationId);
      }
      
      // Rafraîchir les conversations pour mettre à jour les stats
      refetch();
    } catch (error) {
      logger.error('Erreur chargement messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
      setIsLoadingMoreMessages(false);
    }
  }, [refetch, toast]);

  // Charger plus de messages (scroll infini)
  const loadMoreMessages = useCallback(() => {
    if (!selectedConversation || isLoadingMoreMessages || !hasMoreMessages) return;

    logger.log('📜 Chargement de plus de messages, page:', messagesPage + 1);
    loadMessages(selectedConversation.id, messagesPage + 1, true);
  }, [selectedConversation, isLoadingMoreMessages, hasMoreMessages, messagesPage, loadMessages]);

  // Détecter le scroll vers le haut pour charger plus de messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop < 100 && hasMoreMessages && !isLoadingMoreMessages) {
        loadMoreMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMoreMessages, isLoadingMoreMessages, loadMoreMessages]);

  // Sélectionner une conversation - Optimisé avec useCallback
  const handleSelectConversation = useCallback(async (conversation) => {
    logger.log('📖 Ouverture de la conversation:', conversation.id);

    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    setShowMobileMenu(false); // Fermer le menu mobile

    // Marquer automatiquement les messages comme lus pour faire disparaître le badge
    try {
      await messageService.markMessagesAsRead(conversation.id);
      logger.log('✅ Messages marqués comme lus - Badge "Nouveau" va disparaître');

      // Rafraîchir les conversations pour mettre à jour le statut et retirer le badge
      await refetch();
    } catch (error) {
      logger.error('❌ Erreur lors du marquage des messages comme lus:', error);
    }
  }, [loadMessages, refetch]);

  // Envoyer un message avec retry automatique
  const handleSendMessage = useCallback(async (messageContent, retryCount = 0) => {
    if (!messageContent.trim() || !selectedConversation) {
      logger.log('❌ Envoi annulé - message vide ou pas de conversation');
      return;
    }

    const maxRetries = 2;

    try {
      logger.log('📤 Envoi du message:', messageContent.substring(0, 50));
      const newMessage = await messageService.sendMessage(selectedConversation.id, messageContent.trim());
      logger.log('✅ Message envoyé avec succès:', newMessage.id);
      
      // Ajouter le message localement pour une mise à jour immédiate
      setMessages(prev => [...prev, newMessage]);
      
      // Rafraîchir les conversations pour mettre à jour last_message_at
      refetch();
      
      return true; // Succès

    } catch (error) {
      logger.error('Erreur envoi message:', error, 'Tentative:', retryCount + 1);

      // Retry automatique pour erreurs réseau
      if (retryCount < maxRetries &&
        (error.message?.includes('network') ||
          error.message?.includes('timeout') ||
          error.code === 'ECONNABORTED')) {

        logger.log('🔄 Nouvelle tentative d\'envoi dans 2s...');

        toast({
          title: "Nouvelle tentative...",
          description: `Tentative ${retryCount + 2}/${maxRetries + 1}`,
        });

        setTimeout(() => {
          handleSendMessage(messageContent, retryCount + 1);
        }, 2000);

      } else {
        // Erreur finale avec message personnalisé
        const errorMessage = error.message?.includes('Session expirée')
          ? "Votre session a expiré. Veuillez vous reconnecter."
          : error.message?.includes('Permission')
            ? "Vous n'avez pas la permission d'envoyer ce message."
            : "Impossible d'envoyer le message. Vérifiez votre connexion.";

        toast({
          title: "Erreur d'envoi",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  }, [selectedConversation, refetch, toast]);

  // Gérer les pièces jointes - Optimisé avec useCallback
  const handleAttachment = useCallback((files) => {
    logger.log('Fichiers sélectionnés:', files);
    // Pas de notification toast pour les pièces jointes sélectionnées
  }, []);

  // Gérer les emojis - Optimisé avec useCallback
  const handleEmoji = useCallback(() => {
    // Pas de notification toast pour les emojis
  }, []);

  // Gérer l'appel audio - Optimisé avec useCallback
  const handleCall = useCallback(() => {
    if (!selectedConversation || !user) {
      toast({
        title: "Erreur",
        description: "Impossible de déterminer la conversation ou l'utilisateur",
        variant: "destructive",
      });
      return;
    }
    
    const otherParticipant = selectedConversation.participant1_id === user.id 
      ? selectedConversation.participant2 
      : selectedConversation.participant1;
    
    if (!otherParticipant || !otherParticipant.id) {
      toast({
        title: "Erreur",
        description: "Impossible de déterminer l'interlocuteur",
        variant: "destructive",
      });
      return;
    }
    
    logger.log('🔍 Initialisation appel avec:', {
      user: user.id,
      target: otherParticipant.id,
      targetName: otherParticipant.first_name || otherParticipant.last_name || 'Utilisateur'
    });
    
    setAudioCallTarget(otherParticipant);
    setShowAudioCall(true);
    
    toast({
      title: "Appel audio",
      description: `Initialisation de l'appel avec ${otherParticipant.first_name || otherParticipant.last_name || 'l\'utilisateur'}`,
    });
  }, [selectedConversation, user, toast]);

  // Fermer l'interface d'appel - Optimisé avec useCallback
  const handleCloseAudioCall = useCallback(() => {
    setShowAudioCall(false);
    setAudioCallTarget(null);
  }, []);

  // Filtrer les conversations - Optimisé avec useMemo et SYNCHRONISÉ 100%
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];

    const filtered = conversations.filter(conv => {
      if (filterType === 'unread') {
        // CORRECTION: Utiliser receiver_id pour filtrer les messages NON LUS REÇUS
        return conv.messages?.some(msg => !msg.is_read && msg.receiver_id === user?.id);
      }
      if (filterType === 'starred') {
        return conv.starred === true;
      }
      if (filterType === 'archived') {
        return conv.is_archived === true;
      }
      // 'all' - retourner toutes les conversations NON archivées
      return !conv.is_archived;
    });

    logger.log(`🔍 Filtre "${filterType}": ${filtered.length} conversation(s)`);
    return filtered;
  }, [conversations, filterType, user?.id]);

  // Rechercher dans les conversations - Optimisé avec useMemo
  const searchedConversations = useMemo(() => {
    return filteredConversations.filter(conv => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      
      // Rechercher dans le nom des participants
      const participant1Name = `${conv.participant1?.first_name || ''} ${conv.participant1?.last_name || ''}`.toLowerCase();
      const participant2Name = `${conv.participant2?.first_name || ''} ${conv.participant2?.last_name || ''}`.toLowerCase();
      
      if (participant1Name.includes(searchLower) || participant2Name.includes(searchLower)) {
        return true;
      }
      
      // Rechercher dans le titre de l'annonce
      if (conv.listing?.title?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Rechercher dans le contenu des messages
      if (conv.messages?.some(msg => msg.content?.toLowerCase().includes(searchLower))) {
        return true;
      }
      
      return false;
    });
  }, [filteredConversations, searchTerm]);

  // Trier les conversations par date du dernier message - Optimisé avec useMemo
  const sortedConversations = useMemo(() => {
    return [...searchedConversations].sort((a, b) => {
      const aLastMessage = a.messages?.[a.messages.length - 1]?.created_at || a.created_at;
      const bLastMessage = b.messages?.[b.messages.length - 1]?.created_at || b.created_at;
      
      if (!aLastMessage && !bLastMessage) return 0;
      if (!aLastMessage) return 1;
      if (!bLastMessage) return -1;
      
      return new Date(bLastMessage) - new Date(aLastMessage);
    });
  }, [searchedConversations]);

  // Log pour déboguer l'ordre des conversations
  logger.log('🔍 Conversations triées:', sortedConversations.map(conv => ({
    id: conv.id,
    title: conv.listing?.title || 'Sans titre',
    lastMessage: conv.messages?.[conv.messages.length - 1]?.created_at || conv.created_at,
    hasUnread: conv.messages?.some(msg => !msg.is_read && msg.sender_id !== user?.id)
  })));

  // Calculer les statistiques - Optimisé avec useMemo et SYNCHRONISÉ 100%
  const stats = useMemo(() => {
    if (!conversations || !user?.id) {
      return { total: 0, unread: 0, starred: 0, archived: 0 };
    }

    // CORRECTION: Utiliser receiver_id pour compter les messages NON LUS REÇUS
    const unreadConversations = conversations.filter(conv =>
      conv.messages?.some(msg => !msg.is_read && msg.receiver_id === user.id)
    );

    const starredConversations = conversations.filter(conv => conv.starred);
    const archivedConversations = conversations.filter(conv => conv.is_archived);

    const stats = {
      total: conversations.length,
      unread: unreadConversations.length,
      starred: starredConversations.length,
      archived: archivedConversations.length
    };

    logger.log('📊 Stats synchronisées:', stats);
    return stats;
  }, [conversations, user?.id]);

  // Actions sur les conversations - Optimisées avec useCallback
  const handleMarkAsRead = useCallback(async (conversation) => {
    try {
      await messageService.markMessagesAsRead(conversation.id);
      refetch();
      // Pas de notification toast pour le marquage automatique des messages comme lus
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer les messages comme lus",
        variant: "destructive",
      });
    }
  }, [refetch, toast]);

  const handleToggleStar = useCallback(async (conversation) => {
    try {
      const newStarredState = !conversation.starred;
      await messageService.toggleConversationStar(conversation.id, newStarredState);
      refetch();
      // Pas de notification toast pour les changements de favoris (interface mise à jour visuellement)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut favori",
        variant: "destructive",
      });
    }
  }, [refetch, toast]);

  const handleArchive = useCallback(async (conversation) => {
    try {
      await messageService.archiveConversation(conversation.id);
      refetch();
      // Pas de notification toast pour l'archivage (interface mise à jour visuellement)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver la conversation",
        variant: "destructive",
      });
    }
  }, [refetch, toast]);

  // Supprimer une conversation
  const handleDeleteConversation = (conversation) => {
    // Si c'était la conversation sélectionnée, la désélectionner
    if (selectedConversation?.id === conversation.id) {
      setSelectedConversation(null);
      setMessages([]);
    }
    
    // Utiliser la mutation pour supprimer
    deleteConversationMutation.mutate(conversation.id);
  };

  // Confirmer la suppression d'une conversation
  const confirmDeleteConversation = (conversation) => {
    setConversationToDelete(conversation);
    setShowDeleteConfirm(true);
  };

  // Gestion de la sélection multiple de messages
  const handleMessageLongPress = (messageId) => {
    setIsMessageSelectionMode(true);
    setSelectedMessages(new Set([messageId]));
  };

  const handleMessagePress = (messageId) => {
    if (isMessageSelectionMode) {
      setSelectedMessages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(messageId)) {
          newSet.delete(messageId);
        } else {
          newSet.add(messageId);
        }
        return newSet;
      });
    }
  };

  const handleMessageSelection = (messageId) => {
    if (isMessageSelectionMode) {
      handleMessagePress(messageId);
    }
  };

  const clearMessageSelection = () => {
    setSelectedMessages(new Set());
    setIsMessageSelectionMode(false);
  };

  const selectAllMessages = () => {
    const allMessageIds = messages.map(msg => msg.id);
    setSelectedMessages(new Set(allMessageIds));
  };

  const selectOwnMessages = () => {
    const ownMessageIds = messages.filter(msg => msg.sender_id === user?.id).map(msg => msg.id);
    setSelectedMessages(new Set(ownMessageIds));
  };

  // Supprimer les messages sélectionnés
  const handleDeleteSelectedMessages = async () => {
    if (selectedMessages.size === 0) return;

    try {
      // Supprimer chaque message sélectionné
      const deletePromises = Array.from(selectedMessages).map(messageId => 
        messageService.deleteMessage(messageId)
      );
      
      await Promise.all(deletePromises);
      
      // Mettre à jour l'interface
      setMessages(prev => prev.filter(msg => !selectedMessages.has(msg.id)));
      clearMessageSelection();
      
      toast({
        title: "Messages supprimés",
        description: `${selectedMessages.size} message(s) supprimé(s) avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer certains messages",
        variant: "destructive",
      });
    }
  };

  // Confirmer la suppression des messages sélectionnés
  const confirmDeleteSelectedMessages = () => {
    if (selectedMessages.size === 0) return;
    // La modal de confirmation s'affichera automatiquement
  };

  // Gestion des erreurs avec messages personnalisés
  if (error) {
    const isAuthError = error.message?.includes('Session expirée') ||
      error.message?.includes('Utilisateur non connecté');
    const isNetworkError = error.message?.includes('network') ||
      error.message?.includes('Failed to fetch');
    const isPermissionError = error.message?.includes('Permission') ||
      error.message?.includes('RLS');

    let errorTitle = "Erreur de chargement";
    let errorDescription = error.message || "Impossible de charger les conversations";
    let actionButton = "Réessayer";

    if (isAuthError) {
      errorTitle = "Session expirée";
      errorDescription = "Votre session a expiré. Veuillez vous reconnecter.";
      actionButton = "Se reconnecter";
    } else if (isNetworkError) {
      errorTitle = "Problème de connexion";
      errorDescription = "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
    } else if (isPermissionError) {
      errorTitle = "Accès refusé";
      errorDescription = "Vous n'avez pas les permissions nécessaires pour accéder à la messagerie.";
    }

    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md mx-auto p-6">
          <MessageSquare className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            {errorTitle}
          </h3>
          <p className="text-muted-foreground mb-4">
            {errorDescription}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => isAuthError ? navigate('/login') : refetch()}
              className="bg-primary hover:bg-primary/90"
            >
              {actionButton}
            </Button>
            {!isAuthError && (
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                Retour à l'accueil
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden max-h-screen">
        {/* Header Mobile - Afficher seulement si pas de conversation sélectionnée */}
        {!selectedConversation && (
          <MobileMessagingNav
            selectedConversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
            onMenuToggle={() => setShowNavigation(!showNavigation)}
            onMore={() => setShowNavigation(!showNavigation)}
            onCall={handleCall}
            onVideo={() => {
              logger.log('Video');
            }}
            unreadCount={stats.unread}
          />
        )}

        {/* Header Desktop - Responsive amélioré */}
        {!selectedConversation && (
          <div className="bg-card border-b border-border px-4 sm:px-6 py-4 hidden sm:block flex-shrink-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Messages</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-card-foreground">Centre de Messages</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Gérez vos conversations et échangez avec d'autres utilisateurs
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                {/* Navigation vers les autres parties du site - Responsive amélioré */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2 mr-0 sm:mr-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="text-xs flex-shrink-0"
                  >
                    <Home className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Accueil</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/immobilier')}
                    className="text-xs flex-shrink-0"
                  >
                    <Home className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Immobilier</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/automobile')}
                    className="text-xs flex-shrink-0"
                  >
                    <Car className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Auto</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/marketplace')}
                    className="text-xs flex-shrink-0"
                  >
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Marketplace</span>
                  </Button>
                </div>
                <ThemeToggleButton />
                <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nouvelle Conversation</span>
                  <span className="sm:hidden">Nouveau</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation mobile */}
        {showNavigation && (
          <MainNavigation onClose={() => setShowNavigation(false)} />
        )}

      {/* Contenu Principal */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar des conversations - Responsive amélioré avec breakpoints */}
        <div className={`
          ${selectedConversation ? 'hidden sm:block' : 'block'} 
          w-full sm:w-64 md:w-80 lg:w-96 xl:w-[28rem] 2xl:w-[32rem]
          bg-card border-r border-border 
          flex flex-col
        `}>
          {/* Barre de recherche et filtres */}
          <MessagingSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterType={filterType}
            onFilterChange={setFilterType}
            onClear={() => setSearchTerm('')}
            totalCount={stats.total}
            unreadCount={stats.unread}
            starredCount={stats.starred}
            archivedCount={stats.archived}
          />

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                  </div>
                  </div>
                ))}
                  </div>
            ) : sortedConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">
                  Aucune conversation
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Aucune conversation trouvée pour votre recherche' : 'Commencez une nouvelle conversation'}
                </p>
                </div>
            ) : (
              <div className="space-y-1">
                {sortedConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversation?.id === conversation.id}
                    onSelect={() => handleSelectConversation(conversation)}
                    onMarkAsRead={() => handleMarkAsRead(conversation)}
                    onToggleStar={() => handleToggleStar(conversation)}
                    onArchive={() => handleArchive(conversation)}
                    onDelete={() => confirmDeleteConversation(conversation)}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone de conversation active */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-card min-h-0">
            {/* Header de la conversation */}
            <div className="border-b border-border p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Bouton retour - Responsive amélioré */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 -ml-2 sm:hidden"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <UserAvatar 
                    user={selectedConversation.participant1_id === user?.id 
                      ? selectedConversation.participant2 
                      : selectedConversation.participant1
                    } 
                    size="default"
                  />
                  <div>
                    <h3 className="font-medium">
                      {(() => {
                        const otherParticipant = selectedConversation.participant1_id === user?.id 
                          ? selectedConversation.participant2 
                          : selectedConversation.participant1;
                        return otherParticipant 
                          ? `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() || 'Utilisateur'
                          : 'Utilisateur';
                      })()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.listing?.title || 'Conversation'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={handleCall}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleToggleStar(selectedConversation)}>
                        <Star className="h-4 w-4 mr-2" />
                        {selectedConversation.starred ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(selectedConversation)}>
                        <Archive className="h-4 w-4 mr-2" />
                        {selectedConversation.is_archived ? 'Désarchiver' : 'Archiver'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => confirmDeleteConversation(selectedConversation)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer la conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {/* Indicateur de chargement de plus de messages */}
                {isLoadingMoreMessages && (
                  <div className="flex justify-center py-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Chargement des messages précédents...</span>
                    </div>
                  </div>
                )}

                {/* Indicateur qu'il n'y a plus de messages */}
                {!hasMoreMessages && messages.length > 50 && (
                  <div className="text-center py-2 text-xs text-muted-foreground">
                    📜 Début de la conversation
                  </div>
                )}
              {/* Barre d'actions pour la sélection multiple */}
              {isMessageSelectionMode && (
                <div className="sticky top-0 bg-card border border-border rounded-lg p-3 mb-4 shadow-sm z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-foreground">
                        {selectedMessages.size} message(s) sélectionné(s)
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAllMessages}
                          className="text-xs"
                        >
                          Tout sélectionner
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectOwnMessages}
                          className="text-xs"
                        >
                          Mes messages
                        </Button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearMessageSelection}
                        className="text-xs"
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={confirmDeleteSelectedMessages}
                        className="text-xs"
                        disabled={selectedMessages.size === 0}
                      >
                        Supprimer ({selectedMessages.size})
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Instruction pour l'appui long */}
              {!isMessageSelectionMode && messages.length > 0 && (
                <div className="text-center text-xs text-muted-foreground mb-4 p-2 bg-muted/30 rounded-lg">
                  💡 <strong>Appui long</strong> sur un message pour activer la sélection multiple
                </div>
              )}

              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <p>Aucun message dans cette conversation</p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.sender_id === user?.id}
                    participant1={selectedConversation.participant1}
                    participant2={selectedConversation.participant2}
                    currentUserId={user?.id}
                    onLongPress={() => handleMessageLongPress(message.id)}
                    onPress={() => handleMessageSelection(message.id)}
                    isSelected={selectedMessages.has(message.id)}
                    isSelectionMode={isMessageSelectionMode}
                  />
                ))
              )}
              </div>

              {/* Zone de saisie */}
            <div className="flex-shrink-0 relative z-10">
                <MessageInput
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onSend={async (content) => {
                    await handleSendMessage(content);
                    setNewMessage('');
                  }}
                  onAttachment={handleAttachment}
                  onEmoji={handleEmoji}
                  onVoice={() => logger.log('Voice message')}
                  onCamera={() => logger.log('Camera')}
                  placeholder="Tapez votre message..."
                  disabled={isLoadingMessages}
              />
            </div>
          </div>
        ) : (
          /* Écran d'accueil - Responsive amélioré */
          <div className="hidden sm:flex flex-1 items-center justify-center bg-muted/50">
            <div className="text-center">
                              <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium text-card-foreground mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-muted-foreground">
                Choisissez une conversation dans la liste pour commencer à échanger
              </p>
          </div>
        </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && conversationToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir supprimer définitivement cette conversation ? 
              Cette action ne peut pas être annulée.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteConversation(conversationToDelete);
                  setShowDeleteConfirm(false);
                  setConversationToDelete(null);
                }}
                className="flex-1"
                disabled={deleteConversationMutation.isLoading}
              >
                {deleteConversationMutation.isLoading ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression des messages */}
      {isMessageSelectionMode && selectedMessages.size > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir supprimer définitivement {selectedMessages.size} message(s) ? 
              Cette action ne peut pas être annulée.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={clearMessageSelection}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSelectedMessages}
                className="flex-1"
              >
                Supprimer ({selectedMessages.size})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Interface d'appel audio */}
      {showAudioCall && audioCallTarget && (
        <AudioCallInterface
          isOpen={showAudioCall}
          onClose={handleCloseAudioCall}
          targetUser={audioCallTarget}
          currentUser={user}
          roomId={`call-${user?.id}-${audioCallTarget.id}`}
        />
      )}
    </div>
  );
};

// Composant pour afficher un élément de conversation - Optimisé avec React.memo
const ConversationItem = memo(({ 
  conversation, 
  isSelected, 
  onSelect, 
  onMarkAsRead, 
  onToggleStar, 
  onArchive,
  onDelete,
  currentUserId 
}) => {
  const lastMessage = conversation.messages?.[conversation.messages.length - 1];

  // CORRECTION: Badge "Nouveau" n'apparaît que pour les messages NON LUS reçus (pas envoyés)
  const hasUnreadMessages = conversation.messages?.some(msg =>
    !msg.is_read && msg.receiver_id === currentUserId
  );

  // Compter le nombre de messages non lus
  const unreadCount = conversation.messages?.filter(msg =>
    !msg.is_read && msg.receiver_id === currentUserId
  ).length || 0;
  
  // Déterminer l'autre participant
  const otherParticipant = conversation.participant1_id === currentUserId 
    ? conversation.participant2 
    : conversation.participant1;

  // Détecter si c'est la conversation de l'assistant
  const isAssistantConversation = conversation.participant1_id === '00000000-0000-0000-0000-000000000000' ||
                                 conversation.participant2_id === '00000000-0000-0000-0000-000000000000';

  const formatTime = (dateString) => {
    if (!dateString) return 'À l\'instant';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffInHours < 1) return 'À l\'instant';
      if (diffInHours < 24) return `Il y a ${diffInHours}h`;
      if (diffInDays < 7) return `Il y a ${diffInDays}j`;
      
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch (error) {
      return 'À l\'instant';
    }
  };

  // Gestion du clic sur le menu trois points
  const handleMenuClick = (e) => {
    e.stopPropagation(); // Empêcher l'ouverture de la conversation
  };

  // Gestion des actions du menu avec propagation arrêtée
  const handleMarkAsReadClick = (e) => {
    e.stopPropagation();
    onMarkAsRead?.(conversation);
  };

  const handleToggleStarClick = (e) => {
    e.stopPropagation();
    onToggleStar?.(conversation);
  };

  const handleArchiveClick = (e) => {
    e.stopPropagation();
    onArchive?.(conversation);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(conversation);
  };

  return (
    <div
      className={`
        group p-4 cursor-pointer transition-all duration-200 hover:bg-accent relative
        border-b border-border last:border-b-0
        ${isSelected ? 'bg-primary/10 border-l-4 border-primary' : ''}
        ${hasUnreadMessages && !isSelected ? 'bg-primary/5' : ''}
        ${isAssistantConversation ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary' : ''}
      `}
      onClick={onSelect}
    >
      {/* Badge spécial pour l'assistant */}
      {isAssistantConversation && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium shadow-sm">
            🤖 Assistant
          </div>
        </div>
      )}

      <div className="flex items-start space-x-3">
        <div className="relative flex-shrink-0">
          {/* Avatar avec indicateur de non lu */}
          {isAssistantConversation ? (
            <AssistantAvatar size="default" />
          ) : (
              <UserAvatar user={otherParticipant} size="default" />
          )}
          {hasUnreadMessages && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full border-2 border-background flex items-center justify-center">
              <span className="text-destructive-foreground text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-medium text-sm truncate ${hasUnreadMessages ? 'font-bold text-foreground' : 'text-foreground'}`}>
              {isAssistantConversation 
                ? 'AIDA' 
                : (otherParticipant ? `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() || 'Utilisateur' : 'Utilisateur')
              }
            </h4>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
              {conversation.starred && (
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
              )}
              <span className={`text-xs whitespace-nowrap ${hasUnreadMessages ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                {lastMessage?.created_at ? formatTime(lastMessage.created_at) : 'À l\'instant'}
              </span>
            </div>
          </div>
          
          <p className={`text-sm truncate mb-1.5 ${hasUnreadMessages ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
            {lastMessage?.content || 'Aucun message'}
          </p>
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground truncate flex-1">
              {isAssistantConversation ? 'Support et assistance' : (conversation.listing?.title || 'Conversation')}
            </span>
            {hasUnreadMessages && (
              <Badge variant="destructive" className="h-5 px-2 text-xs font-bold flex-shrink-0 animate-pulse">
                Nouveau
              </Badge>
            )}
          </div>
        </div>

        {/* Menu contextuel des actions - visible au hover */}
        <div className="flex-shrink-0" onClick={handleMenuClick}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity hover:bg-accent"
                onClick={handleMenuClick}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {hasUnreadMessages && (
                <>
                  <DropdownMenuItem onClick={handleMarkAsReadClick}>
                    <Eye className="h-4 w-4 mr-2" />
                    Marquer comme lu
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleToggleStarClick}>
                <Star className={`h-4 w-4 mr-2 ${conversation.starred ? 'fill-current text-yellow-500' : ''}`} />
                {conversation.starred ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchiveClick}>
                <Archive className="h-4 w-4 mr-2" />
                {conversation.is_archived ? 'Désarchiver' : 'Archiver'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});

// Composant pour afficher une bulle de message - Optimisé avec React.memo
const MessageBubble = memo(({ 
  message, 
  isOwn, 
  participant1, 
  participant2, 
  currentUserId,
  onLongPress,
  onPress,
  isSelected = false,
  isSelectionMode = false
}) => {
  const [longPressTimer, setLongPressTimer] = useState(null);

  // Détecter si c'est un message de l'assistant
  const isAssistantMessage = message.sender_id === '00000000-0000-0000-0000-000000000000';

  const formatTime = (dateString) => {
    if (!dateString) return 'À l\'instant';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'À l\'instant';
    }
  };

  // Déterminer l'expéditeur du message
  const messageSender = message.sender_id === participant1?.id ? participant1 : participant2;

  // Gestion des événements tactiles
  const handleTouchStart = () => {
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
      }, 500); // 500ms pour l'appui long
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleClick = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} space-x-2`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {/* Avatar de l'expéditeur (seulement pour les messages des autres) */}
      {!isOwn && (
        isAssistantMessage ? (
          <AssistantAvatar size="sm" className="flex-shrink-0 mt-1" />
        ) : (
          <UserAvatar 
            user={messageSender} 
            size="sm"
            className="flex-shrink-0 mt-1"
          />
        )
      )}
      
      <div className={`
        relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg cursor-pointer
        transition-all duration-200
        ${isOwn 
          ? 'bg-primary text-primary-foreground' 
          : isAssistantMessage
          ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-foreground border border-primary/30'
            : 'bg-muted text-muted-foreground'
        }
        ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
        ${isSelectionMode ? 'hover:ring-2 hover:ring-primary/50' : ''}
      `}>
        {/* Indicateur de sélection */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-xs">✓</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 mb-1">
          {!isOwn && isAssistantMessage && (
            <span className="text-xs font-medium text-primary">
              🤖 AIDA
            </span>
          )}
          <span className="text-xs opacity-75">
            {formatTime(message.created_at)}
          </span>
        </div>
        <p className="text-sm">{message.content}</p>
      </div>
      
      {/* Avatar de l'utilisateur actuel (seulement pour ses propres messages) */}
      {isOwn && (
        <UserAvatar 
          user={{ first_name: 'Moi', last_name: '' }} 
          size="sm"
          className="flex-shrink-0 mt-1"
        />
      )}
    </div>
  );
});

// Composant principal avec QueryClient
const MessagingPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MessagingPageContent />
    </QueryClientProvider>
  );
};

export default MessagingPage;