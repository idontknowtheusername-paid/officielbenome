import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useConversations, useRealtimeMessages, useDeleteConversation } from '@/hooks/useMessages';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/message.service';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useMessagingState } from '@/hooks/useMessagingState';
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
  MessagingSearch, 
  MessageInput,
  AudioCallInterface
} from '@/components/messaging';
import SimplifiedMobileNav from '@/components/messaging/SimplifiedMobileNav';
import SimplifiedMainNavigation from '@/components/messaging/SimplifiedMainNavigation';
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
      refetchOnWindowFocus: false,
    },
  },
});

// ========================================
// COMPOSANT PRINCIPAL OPTIMISÉ
// ========================================
const MessagingPageContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: conversations, isLoading, error, refetch } = useConversations();
  const queryClient = useQueryClient();
  
  // ========================================
  // ÉTAT CENTRALISÉ - useReducer
  // ========================================
  const {
    state,
    // Navigation
    setView,
    toggleMobileMenu,
    toggleNavigation,
    navigateToConversation,
    navigateBackToList,
    
    // Conversation
    selectConversation,
    clearSelectedConversation,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    
    // Search & Filter
    setSearchTerm,
    setFilterType,
    clearSearch,
    
    // UI
    setLoadingMessages,
    setNewMessage,
    clearNewMessage,
    
    // Message Selection
    setMessageSelectionMode,
    selectMessage,
    deselectMessage,
    selectAllMessages,
    clearMessageSelection,
    toggleMessageSelection,
    startMessageSelection,
    
    // Modals
    showDeleteConfirm,
    hideDeleteConfirm,
    
    // Audio Call
    showAudioCall,
    hideAudioCall,
    setAudioCallTarget,
    
    // Mobile
    setMobile
  } = useMessagingState();

  // ========================================
  // DÉTECTION MOBILE - Optimisée
  // ========================================
  const checkMobile = useCallback(() => {
    setMobile(window.innerWidth < 768);
  }, [setMobile]);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // ========================================
  // HOOKS TEMPS RÉEL
  // ========================================
  useRealtimeMessages(state.selectedConversation?.id);

  // ========================================
  // MUTATIONS
  // ========================================
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

  // ========================================
  // FONCTIONS OPTIMISÉES
  // ========================================
  
  // Charger les messages
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    
    setLoadingMessages(true);
    try {
      const data = await messageService.getConversationMessages(conversationId);
      setMessages(data);
      
      await messageService.markMessagesAsRead(conversationId);
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
      setLoadingMessages(false);
    }
  }, [setLoadingMessages, setMessages, refetch, toast]);

  // Sélectionner une conversation
  const handleSelectConversation = useCallback(async (conversation) => {
    navigateToConversation(conversation);
    loadMessages(conversation.id);
    
    try {
      await messageService.markMessagesAsRead(conversation.id);
      refetch();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erreur lors du marquage des messages comme lus:', error);
      }
    }
  }, [navigateToConversation, loadMessages, refetch]);

  // Envoyer un message
  const handleSendMessage = useCallback(async (messageContent) => {
    if (!messageContent.trim() || !state.selectedConversation) return;

    try {
      const newMessage = await messageService.sendMessage(state.selectedConversation.id, messageContent.trim());
      clearNewMessage();
      addMessage(newMessage);
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
  }, [state.selectedConversation, clearNewMessage, addMessage, refetch, toast]);

  // Gérer les pièces jointes
  const handleAttachment = useCallback((files) => {
    if (import.meta.env.DEV) {
      console.log('Fichiers sélectionnés:', files);
    }
  }, []);

  // Gérer les emojis
  const handleEmoji = useCallback(() => {
    // Pas de notification toast pour les emojis
  }, []);

  // Gérer l'appel audio
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
    
    showAudioCall(otherParticipant);
    
    toast({
      title: "Appel audio",
      description: `Initialisation de l'appel avec ${otherParticipant.first_name || otherParticipant.last_name || 'l\'utilisateur'}`,
    });
  }, [state.selectedConversation, user, toast, showAudioCall]);

  // ========================================
  // CALCULS MÉMORISÉS
  // ========================================
  
  // Filtrer les conversations
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

  // Rechercher dans les conversations
  const searchedConversations = useMemo(() => {
    return filteredConversations.filter(conv => {
      if (!state.searchTerm) return true;
      
      const searchLower = state.searchTerm.toLowerCase();
      
      const participant1Name = `${conv.participant1?.first_name || ''} ${conv.participant1?.last_name || ''}`.toLowerCase();
      const participant2Name = `${conv.participant2?.first_name || ''} ${conv.participant2?.last_name || ''}`.toLowerCase();
      
      if (participant1Name.includes(searchLower) || participant2Name.includes(searchLower)) {
        return true;
      }
      
      if (conv.listing?.title?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      if (conv.messages?.some(msg => msg.content?.toLowerCase().includes(searchLower))) {
        return true;
      }
      
      return false;
    });
  }, [filteredConversations, state.searchTerm]);

  // Trier les conversations
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

  // Calculer les statistiques
  const stats = useMemo(() => ({
    total: conversations?.length || 0,
    unread: conversations?.filter(conv => 
      conv.messages?.some(msg => !msg.is_read && msg.sender_id !== user?.id)
    ).length || 0,
    starred: conversations?.filter(conv => conv.starred).length || 0,
    archived: conversations?.filter(conv => conv.is_archived).length || 0
  }), [conversations, user?.id]);

  // ========================================
  // ACTIONS SUR LES CONVERSATIONS
  // ========================================
  
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

  // ========================================
  // HANDLERS NAVIGATION SIMPLIFIÉS
  // ========================================
  
  const handleNavigateBack = useCallback(() => {
    navigateBackToList();
  }, [navigateBackToList]);
  
  const handleToggleSearch = useCallback(() => {
    // Logique de recherche simplifiée
    if (import.meta.env.DEV) {
      console.log('Toggle search');
    }
  }, []);
  
  const handleToggleFilter = useCallback(() => {
    // Logique de filtre simplifiée
    if (import.meta.env.DEV) {
      console.log('Toggle filter');
    }
  }, []);
  
  const handleToggleMore = useCallback(() => {
    toggleNavigation();
  }, [toggleNavigation]);
  
  const handleVideo = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log('Video call');
    }
  }, []);

  // ========================================
  // RENDER CONDITIONS
  // ========================================
  
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

  // ========================================
  // RENDER PRINCIPAL
  // ========================================
  
  return (
    <div className="messaging-container">
      {/* Navigation Mobile Simplifiée */}
      <SimplifiedMobileNav
        view={state.currentView}
        onNavigateBack={handleNavigateBack}
        onToggleMenu={toggleMobileMenu}
        onToggleSearch={handleToggleSearch}
        onToggleFilter={handleToggleFilter}
        onToggleMore={handleToggleMore}
        onCall={handleCall}
        onVideo={handleVideo}
        unreadCount={stats.unread}
        conversationTitle={state.selectedConversation?.listing?.title || 'Conversation'}
        participantName={(() => {
          if (!state.selectedConversation) return '';
          const otherParticipant = state.selectedConversation.participant1_id === user?.id 
            ? state.selectedConversation.participant2 
            : state.selectedConversation.participant1;
          return otherParticipant 
            ? `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() || 'Utilisateur'
            : 'Utilisateur';
        })()}
      />

      {/* Navigation Principale */}
      {state.showNavigation && (
        <SimplifiedMainNavigation onClose={() => toggleNavigation()} />
      )}

      {/* Contenu Principal */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar des conversations */}
        <div className={`
          ${state.currentView === 'conversation' ? 'hidden sm:block' : 'block'} 
          messaging-sidebar
          bg-card border-r border-border 
          flex flex-col
        `}>
          {/* Barre de recherche et filtres */}
          <MessagingSearch
            searchTerm={state.searchTerm}
            onSearchChange={setSearchTerm}
            filterType={state.filterType}
            onFilterChange={setFilterType}
            onClear={clearSearch}
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
                    onDelete={() => showDeleteConfirm(conversation)}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone de conversation active */}
        {state.currentView === 'conversation' && state.selectedConversation ? (
          <div className="messaging-conversation">
            {/* Header de la conversation */}
            <div className="border-b border-border p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNavigateBack}
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
                        onClick={() => showDeleteConfirm(state.selectedConversation)}
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
                    onLongPress={() => startMessageSelection(message.id)}
                    onPress={() => toggleMessageSelection(message.id)}
                    isSelected={state.selectedMessages.has(message.id)}
                    isSelectionMode={state.isMessageSelectionMode}
                  />
                ))
              )}
            </div>

            {/* Zone de saisie */}
            <div className="flex-shrink-0 relative z-10">
              <MessageInput
                value={state.newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
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
          /* Écran d'accueil */
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
          onClose={hideAudioCall}
          targetUser={state.audioCallTarget}
          currentUser={user}
          roomId={`call-${user?.id}-${state.audioCallTarget.id}`}
        />
      )}
    </div>
  );
};

// ========================================
// COMPOSANTS OPTIMISÉS (réutilisés)
// ========================================

// ConversationItem et MessageBubble restent les mêmes qu'avant
// mais sont maintenant utilisés avec l'état centralisé

// Composant principal avec QueryClient
const OptimizedMessagingPageV2 = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MessagingPageContent />
    </QueryClientProvider>
  );
};

export default OptimizedMessagingPageV2;