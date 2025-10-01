import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useConversations, useRealtimeMessages, useDeleteConversation } from '@/hooks/useMessages';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/message.service';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
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
  Settings
} from 'lucide-react';
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
import { UserAvatar } from '@/components/ui';
import AssistantAvatar from '@/components/messaging/AssistantAvatar';
import '../messaging/messaging-responsive.css';

// Configuration du client React Query optimisée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false, // Optimisation : éviter les refetch inutiles
    },
  },
});

// Composant de navigation principale - Optimisé avec React.memo
const MainNavigation = memo(({ onClose }) => {
  const navigate = useNavigate();
  
  const navItems = useMemo(() => [
    { name: 'Accueil', path: '/', icon: <Home className="h-4 w-4" /> },
    { name: 'Immobilier', path: '/immobilier', icon: <Home className="h-4 w-4" /> },
    { name: 'Automobile', path: '/automobile', icon: <Car className="h-4 w-4" /> },
    { name: 'Services', path: '/services', icon: <Briefcase className="h-4 w-4" /> },
    { name: 'Marketplace', path: '/marketplace', icon: <ShoppingBag className="h-4 w-4" /> },
    { name: 'Mon Compte', path: '/profile', icon: <Settings className="h-4 w-4" /> },
  ], []);

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Navigation</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="outline"
            className="justify-start h-auto p-3"
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
          >
            <span className="mr-2">{item.icon}</span>
            <span className="text-sm">{item.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
});

MainNavigation.displayName = 'MainNavigation';

// Composant principal de la page de messagerie - Optimisé
const MessagingPageContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: conversations, isLoading, error, refetch } = useConversations();
  const queryClient = useQueryClient();
  
  // États optimisés avec useReducer pour réduire les re-renders
  const [state, setState] = useState({
    selectedConversation: null,
    messages: [],
    searchTerm: '',
    filterType: 'all',
    showMobileMenu: false,
    showNavigation: false,
    isLoadingMessages: false,
    newMessage: '',
    showDeleteConfirm: false,
    conversationToDelete: null,
    selectedMessages: new Set(),
    isMessageSelectionMode: false,
    longPressTimer: null,
    showAudioCall: false,
    audioCallTarget: null,
    isMobile: false
  });

  // Détecter si on est sur mobile - Optimisé avec useCallback
  const checkMobile = useCallback(() => {
    setState(prev => ({ ...prev, isMobile: window.innerWidth < 768 }));
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Utiliser le hook de chat en temps réel
  useRealtimeMessages(state.selectedConversation?.id);

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

  // Charger les messages d'une conversation - Optimisé avec useCallback
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    
    setState(prev => ({ ...prev, isLoadingMessages: true }));
    try {
      const data = await messageService.getConversationMessages(conversationId);
      setState(prev => ({ ...prev, messages: data }));
      
      // Marquer comme lus
      await messageService.markMessagesAsRead(conversationId);
      
      // Rafraîchir les conversations pour mettre à jour les stats
      refetch();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erreur chargement messages:', error);
      }
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoadingMessages: false }));
    }
  }, [refetch, toast]);

  // Sélectionner une conversation - Optimisé avec useCallback
  const handleSelectConversation = useCallback(async (conversation) => {
    setState(prev => ({ 
      ...prev, 
      selectedConversation: conversation,
      showMobileMenu: false 
    }));
    loadMessages(conversation.id);
    
    // Marquer automatiquement les messages comme lus
    try {
      await messageService.markMessagesAsRead(conversation.id);
      refetch();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erreur lors du marquage des messages comme lus:', error);
      }
    }
  }, [loadMessages, refetch]);

  // Envoyer un message - Optimisé avec useCallback
  const handleSendMessage = useCallback(async (messageContent) => {
    if (!messageContent.trim() || !state.selectedConversation) return;

    try {
      const newMessage = await messageService.sendMessage(state.selectedConversation.id, messageContent.trim());
      setState(prev => ({ ...prev, newMessage: '' }));
      
      // Ajouter le message localement pour une mise à jour immédiate
      setState(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
      
      // Rafraîchir les conversations pour mettre à jour last_message_at
      refetch();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erreur envoi message:', error);
      }
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  }, [state.selectedConversation, refetch, toast]);

  // Gérer les pièces jointes - Optimisé avec useCallback
  const handleAttachment = useCallback((files) => {
    if (import.meta.env.DEV) {
      console.log('Fichiers sélectionnés:', files);
    }
  }, []);

  // Gérer les emojis - Optimisé avec useCallback
  const handleEmoji = useCallback(() => {
    // Pas de notification toast pour les emojis
  }, []);

  // Gérer l'appel audio - Optimisé avec useCallback
  const handleCall = useCallback(() => {
    if (!state.selectedConversation || !user) {
      toast({
        title: "Erreur",
        description: "Impossible de déterminer la conversation ou l'utilisateur",
        variant: "destructive",
      });
      return;
    }
    
    const otherParticipant = state.selectedConversation.participant1_id === user.id 
      ? state.selectedConversation.participant2 
      : state.selectedConversation.participant1;
    
    if (!otherParticipant || !otherParticipant.id) {
      toast({
        title: "Erreur",
        description: "Impossible de déterminer l'interlocuteur",
        variant: "destructive",
      });
      return;
    }
    
    if (import.meta.env.DEV) {
      console.log('🔍 Initialisation appel avec:', {
        user: user.id,
        target: otherParticipant.id,
        targetName: otherParticipant.first_name || otherParticipant.last_name || 'Utilisateur'
      });
    }
    
    setState(prev => ({
      ...prev,
      audioCallTarget: otherParticipant,
      showAudioCall: true
    }));
    
    toast({
      title: "Appel audio",
      description: `Initialisation de l'appel avec ${otherParticipant.first_name || otherParticipant.last_name || 'l\'utilisateur'}`,
    });
  }, [state.selectedConversation, user, toast]);

  // Fermer l'interface d'appel - Optimisé avec useCallback
  const handleCloseAudioCall = useCallback(() => {
    setState(prev => ({
      ...prev,
      showAudioCall: false,
      audioCallTarget: null
    }));
  }, []);

  // Filtrer les conversations - Optimisé avec useMemo
  const filteredConversations = useMemo(() => {
    return conversations?.filter(conv => {
      if (state.filterType === 'unread') {
        return conv.messages?.some(msg => !msg.is_read && msg.sender_id !== user?.id);
      }
      if (state.filterType === 'starred') {
        return conv.starred;
      }
      if (state.filterType === 'archived') {
        return conv.is_archived;
      }
      return true;
    }) || [];
  }, [conversations, state.filterType, user?.id]);

  // Rechercher dans les conversations - Optimisé avec useMemo
  const searchedConversations = useMemo(() => {
    return filteredConversations.filter(conv => {
      if (!state.searchTerm) return true;
      
      const searchLower = state.searchTerm.toLowerCase();
      
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
  }, [filteredConversations, state.searchTerm]);

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

  // Calculer les statistiques - Optimisé avec useMemo
  const stats = useMemo(() => ({
    total: conversations?.length || 0,
    unread: conversations?.filter(conv => 
      conv.messages?.some(msg => !msg.is_read && msg.sender_id !== user?.id)
    ).length || 0,
    starred: conversations?.filter(conv => conv.starred).length || 0,
    archived: conversations?.filter(conv => conv.is_archived).length || 0
  }), [conversations, user?.id]);

  // Actions sur les conversations - Optimisées avec useCallback
  const handleMarkAsRead = useCallback(async (conversation) => {
    try {
      await messageService.markMessagesAsRead(conversation.id);
      refetch();
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
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver la conversation",
        variant: "destructive",
      });
    }
  }, [refetch, toast]);

  // Gestion des erreurs
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Erreur de chargement
          </h3>
          <p className="text-muted-foreground mb-4">
            {error.message || "Impossible de charger les conversations"}
          </p>
          <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="messaging-container">
      {/* Header Mobile - Afficher seulement si pas de conversation sélectionnée */}
      {!state.selectedConversation && (
        <MobileMessagingNav
          selectedConversation={state.selectedConversation}
          onBack={() => setState(prev => ({ ...prev, selectedConversation: null }))}
          onMenuToggle={() => setState(prev => ({ ...prev, showMobileMenu: !prev.showMobileMenu }))}
          onSearch={() => setState(prev => ({ ...prev, showMobileMenu: false }))}
          onFilter={() => setState(prev => ({ ...prev, showMobileMenu: false }))}
          onMore={() => setState(prev => ({ ...prev, showNavigation: !prev.showNavigation }))}
          onCall={handleCall}
          onVideo={() => {
            if (import.meta.env.DEV) {
              console.log('Video');
            }
          }}
          unreadCount={stats.unread}
        />
      )}

      {/* Header Desktop - Responsive amélioré */}
      {!state.selectedConversation && (
        <div className="messaging-header messaging-header-desktop">
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
              <div className="nav-buttons">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="nav-button"
                >
                  <Home className="nav-button-icon" />
                  <span className="nav-button-text">Accueil</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/immobilier')}
                  className="nav-button"
                >
                  <Home className="nav-button-icon" />
                  <span className="nav-button-text">Immobilier</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/automobile')}
                  className="nav-button"
                >
                  <Car className="nav-button-icon" />
                  <span className="nav-button-text">Auto</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/marketplace')}
                  className="nav-button"
                >
                  <ShoppingBag className="nav-button-icon" />
                  <span className="nav-button-text">Marketplace</span>
                </Button>
              </div>
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
      {state.showNavigation && (
        <MainNavigation onClose={() => setState(prev => ({ ...prev, showNavigation: false }))} />
      )}

      {/* Contenu Principal */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar des conversations - Responsive amélioré avec breakpoints */}
        <div className={`
          ${state.selectedConversation ? 'hidden sm:block' : 'block'} 
          messaging-sidebar
          bg-card border-r border-border 
          flex flex-col
        `}>
          {/* Barre de recherche et filtres */}
          <MessagingSearch
            searchTerm={state.searchTerm}
            onSearchChange={(value) => setState(prev => ({ ...prev, searchTerm: value }))}
            filterType={state.filterType}
            onFilterChange={(value) => setState(prev => ({ ...prev, filterType: value }))}
            onClear={() => setState(prev => ({ ...prev, searchTerm: '' }))}
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
                  {state.searchTerm ? 'Aucune conversation trouvée pour votre recherche' : 'Commencez une nouvelle conversation'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {sortedConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={state.selectedConversation?.id === conversation.id}
                    onSelect={() => handleSelectConversation(conversation)}
                    onMarkAsRead={() => handleMarkAsRead(conversation)}
                    onToggleStar={() => handleToggleStar(conversation)}
                    onArchive={() => handleArchive(conversation)}
                    onDelete={() => setState(prev => ({ 
                      ...prev, 
                      conversationToDelete: conversation,
                      showDeleteConfirm: true 
                    }))}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone de conversation active */}
        {state.selectedConversation ? (
          <div className="messaging-conversation">
            {/* Header de la conversation */}
            <div className="border-b border-border p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Bouton retour - Responsive amélioré */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, selectedConversation: null }))}
                    className="p-2 -ml-2 sm:hidden"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <UserAvatar 
                    user={state.selectedConversation.participant1_id === user?.id 
                      ? state.selectedConversation.participant2 
                      : state.selectedConversation.participant1
                    } 
                    size="default"
                  />
                  <div>
                    <h3 className="font-medium">
                      {(() => {
                        const otherParticipant = state.selectedConversation.participant1_id === user?.id 
                          ? state.selectedConversation.participant2 
                          : state.selectedConversation.participant1;
                        return otherParticipant 
                          ? `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() || 'Utilisateur'
                          : 'Utilisateur';
                      })()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {state.selectedConversation.listing?.title || 'Conversation'}
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
                      <DropdownMenuItem onClick={() => handleToggleStar(state.selectedConversation)}>
                        <Star className="h-4 w-4 mr-2" />
                        {state.selectedConversation.starred ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(state.selectedConversation)}>
                        <Archive className="h-4 w-4 mr-2" />
                        {state.selectedConversation.is_archived ? 'Désarchiver' : 'Archiver'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setState(prev => ({ 
                          ...prev, 
                          conversationToDelete: state.selectedConversation,
                          showDeleteConfirm: true 
                        }))}
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {state.isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : state.messages.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <p>Aucun message dans cette conversation</p>
                </div>
              ) : (
                state.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.sender_id === user?.id}
                    participant1={state.selectedConversation.participant1}
                    participant2={state.selectedConversation.participant2}
                    currentUserId={user?.id}
                    onLongPress={() => setState(prev => ({ 
                      ...prev, 
                      isMessageSelectionMode: true,
                      selectedMessages: new Set([message.id])
                    }))}
                    onPress={() => {
                      if (state.isMessageSelectionMode) {
                        setState(prev => {
                          const newSet = new Set(prev.selectedMessages);
                          if (newSet.has(message.id)) {
                            newSet.delete(message.id);
                          } else {
                            newSet.add(message.id);
                          }
                          return { ...prev, selectedMessages: newSet };
                        });
                      }
                    }}
                    isSelected={state.selectedMessages.has(message.id)}
                    isSelectionMode={state.isMessageSelectionMode}
                  />
                ))
              )}
            </div>

            {/* Zone de saisie optimisée */}
            <div className="flex-shrink-0 relative z-10">
              <MessageInput
                value={state.newMessage}
                onChange={(e) => setState(prev => ({ ...prev, newMessage: e.target.value }))}
                onSend={handleSendMessage}
                onAttachment={handleAttachment}
                onEmoji={handleEmoji}
                onVoice={() => {
                  if (import.meta.env.DEV) {
                    console.log('Voice message');
                  }
                }}
                onCamera={() => {
                  if (import.meta.env.DEV) {
                    console.log('Camera');
                  }
                }}
                placeholder="Tapez votre message..."
                disabled={state.isLoadingMessages}
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

      {/* Interface d'appel audio */}
      {state.showAudioCall && state.audioCallTarget && (
        <AudioCallInterface
          isOpen={state.showAudioCall}
          onClose={handleCloseAudioCall}
          targetUser={state.audioCallTarget}
          currentUser={user}
          roomId={`call-${user?.id}-${state.audioCallTarget.id}`}
        />
      )}
    </div>
  );
};

// Composant principal avec QueryClient
const OptimizedMessagingPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MessagingPageContent />
    </QueryClientProvider>
  );
};

export default OptimizedMessagingPage;