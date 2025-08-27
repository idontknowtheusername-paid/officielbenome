import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  ChevronLeft
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

// Composant principal de la page de messagerie
const MessagingPageContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { data: conversations, isLoading, error, refetch } = useConversations();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isMessageSelectionMode, setIsMessageSelectionMode] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [audioCallTarget, setAudioCallTarget] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        console.log('🔍 Ouverture automatique de la conversation:', conversationId);
        setSelectedConversation(conversation);
        loadMessages(conversation.id);
      }
    } else if (listingId && !selectedConversation) {
      // Trouver une conversation liée à cette annonce
      const conversation = conversations.find(c => c.listing_id === listingId);
      if (conversation) {
        console.log('🔍 Ouverture automatique de la conversation pour l\'annonce:', listingId);
        setSelectedConversation(conversation);
        loadMessages(conversation.id);
      }
    }
  }, [conversations, searchParams, selectedConversation]);

  // Subscription en temps réel pour les nouvelles conversations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
        filter: `participant1_id=eq.${user.id} OR participant2_id=eq.${user.id}`
      }, (payload) => {
        console.log('🆕 Nouvelle conversation reçue:', payload);
        // Rafraîchir les conversations
        refetch();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `participant1_id=eq.${user.id} OR participant2_id=eq.${user.id}`
      }, (payload) => {
        console.log('🔄 Conversation mise à jour:', payload);
        // Rafraîchir les conversations
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  // Subscription en temps réel pour les nouveaux messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        console.log('💬 Nouveau message reçu:', payload);
        
        // Si c'est dans la conversation active, l'ajouter
        if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
          setMessages(prev => [...prev, payload.new]);
        }
        
        // Rafraîchir les conversations pour mettre à jour last_message_at
        refetch();
        
        // Notification toast pour les nouveaux messages
        if (payload.new.sender_id !== user.id) {
          toast({
            title: "Nouveau message",
            description: "Vous avez reçu un nouveau message",
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation, refetch, toast]);

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    
    setIsLoadingMessages(true);
    try {
      const data = await messageService.getConversationMessages(conversationId);
      setMessages(data);
      
      // Marquer comme lus
      await messageService.markMessagesAsRead(conversationId);
      
      // Rafraîchir les conversations pour mettre à jour les stats
      refetch();
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Sélectionner une conversation
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    setShowMobileMenu(false); // Fermer le menu mobile
    
    // Marquer automatiquement les messages comme lus
    try {
      await messageService.markMessagesAsRead(conversation.id);
      // Rafraîchir les conversations pour mettre à jour le statut
      refetch();
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
    }
  };

  // Envoyer un message
  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim() || !selectedConversation) return;

    try {
      const newMessage = await messageService.sendMessage(selectedConversation.id, messageContent.trim());
      setNewMessage('');
      
      // Ajouter le message localement pour une mise à jour immédiate
      setMessages(prev => [...prev, newMessage]);
      
      // Rafraîchir les conversations pour mettre à jour last_message_at
      refetch();
      
      // Pas de notification toast pour les messages envoyés par l'utilisateur
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  };

  // Gérer les pièces jointes
  const handleAttachment = (files) => {
    console.log('Fichiers sélectionnés:', files);
    // Pas de notification toast pour les pièces jointes sélectionnées
  };

  // Gérer les emojis
  const handleEmoji = () => {
    // Pas de notification toast pour les emojis
  };

  // Gérer l'appel audio
  const handleCall = () => {
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
    
    console.log('🔍 Initialisation appel avec:', {
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
  };

  // Fermer l'interface d'appel
  const handleCloseAudioCall = () => {
    setShowAudioCall(false);
    setAudioCallTarget(null);
  };

  // Filtrer les conversations
  const filteredConversations = conversations?.filter(conv => {
    if (filterType === 'unread') {
      return conv.messages?.some(msg => !msg.is_read && msg.sender_id !== user?.id);
    }
    if (filterType === 'starred') {
      return conv.starred;
    }
    if (filterType === 'archived') {
      return conv.is_archived;
    }
    return true;
  }) || [];

  // Rechercher dans les conversations
  const searchedConversations = filteredConversations.filter(conv => {
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

  // Trier les conversations par date du dernier message (plus récent en premier)
  const sortedConversations = [...searchedConversations].sort((a, b) => {
    const aLastMessage = a.messages?.[a.messages.length - 1]?.created_at || a.created_at;
    const bLastMessage = b.messages?.[b.messages.length - 1]?.created_at || b.created_at;
    
    if (!aLastMessage && !bLastMessage) return 0;
    if (!aLastMessage) return 1;
    if (!bLastMessage) return -1;
    
    return new Date(bLastMessage) - new Date(aLastMessage);
  });

  // Log pour déboguer l'ordre des conversations
  console.log('🔍 Conversations triées:', sortedConversations.map(conv => ({
    id: conv.id,
    title: conv.listing?.title || 'Sans titre',
    lastMessage: conv.messages?.[conv.messages.length - 1]?.created_at || conv.created_at,
    hasUnread: conv.messages?.some(msg => !msg.is_read && msg.sender_id !== user?.id)
  })));

  // Calculer les statistiques
  const stats = {
    total: conversations?.length || 0,
    unread: conversations?.filter(conv => 
      conv.messages?.some(msg => !msg.is_read && msg.sender_id !== user?.id)
    ).length || 0,
    starred: conversations?.filter(conv => conv.starred).length || 0,
    archived: conversations?.filter(conv => conv.is_archived).length || 0
  };

  // Actions sur les conversations
  const handleMarkAsRead = async (conversation) => {
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
  };

  const handleToggleStar = async (conversation) => {
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
  };

  const handleArchive = async (conversation) => {
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
  };

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
      <div className="h-screen bg-background flex flex-col overflow-hidden max-h-screen">
        {/* Header Mobile - Afficher seulement si pas de conversation sélectionnée */}
        {!selectedConversation && (
          <MobileMessagingNav
            selectedConversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
            onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            onSearch={() => setShowMobileMenu(false)}
            onFilter={() => setShowMobileMenu(false)}
            onMore={() => console.log('Plus d\'options')}
            onCall={handleCall}
            onVideo={() => console.log('Video')}
            unreadCount={stats.unread}
          />
        )}

        {/* Header Desktop - Afficher seulement si pas de conversation sélectionnée ET sur desktop */}
        {!selectedConversation && (
          <div className="bg-card border-b border-border px-6 py-4 hidden md:block flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Centre de Messages</h1>
                <p className="text-muted-foreground">
                  Gérez vos conversations et échangez avec d'autres utilisateurs
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Conversation
                </Button>
              </div>
            </div>
          </div>
        )}

      {/* Contenu Principal */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar des conversations - cachée sur mobile si conversation sélectionnée */}
        <div className={`
          ${selectedConversation ? 'hidden md:block' : 'block'} 
          w-full md:w-80 lg:w-96 
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
                  {/* Bouton retour - visible seulement sur mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 -ml-2 md:hidden"
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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

            {/* Zone de saisie optimisée */}
            <div className="flex-shrink-0">
              <MessageInput
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onSend={handleSendMessage}
                onAttachment={handleAttachment}
                onEmoji={handleEmoji}
                onVoice={() => console.log('Voice message')}
                onCamera={() => console.log('Camera')}
                placeholder="Tapez votre message..."
                disabled={isLoadingMessages}
              />
            </div>
          </div>
        ) : (
          /* Écran d'accueil quand aucune conversation n'est sélectionnée */
          <div className="hidden md:flex flex-1 items-center justify-center bg-muted/50">
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

// Composant pour afficher un élément de conversation
const ConversationItem = ({ 
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
  const hasUnreadMessages = conversation.messages?.some(msg => !msg.is_read && msg.sender_id !== currentUserId);
  
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

  return (
    <div
      className={`
        group p-4 cursor-pointer transition-colors hover:bg-accent relative
        ${isSelected ? 'bg-primary/10 border-r-2 border-primary' : ''}
        ${hasUnreadMessages ? 'bg-primary/10' : ''}
        ${isAssistantConversation ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' : ''}
      `}
      onClick={onSelect}
    >
      {/* Badge spécial pour l'assistant */}
      {isAssistantConversation && (
        <div className="absolute top-2 right-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
            🤖 Assistant
          </div>
        </div>
      )}

      <div className="flex items-start space-x-3">
        <div className="relative">
          {/* Utiliser l'avatar spécial pour l'assistant */}
          {isAssistantConversation ? (
            <AssistantAvatar size="default" className="flex-shrink-0" />
          ) : (
            <UserAvatar 
              user={otherParticipant} 
              size="default"
              className="flex-shrink-0"
            />
          )}
          {hasUnreadMessages && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm truncate">
              {isAssistantConversation 
                ? 'AIDA' 
                : (otherParticipant ? `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() || 'Utilisateur' : 'Utilisateur')
              }
            </h4>
            <div className="flex items-center space-x-2">
              {conversation.starred && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
              <span className="text-xs text-muted-foreground">
                {lastMessage?.created_at ? formatTime(lastMessage.created_at) : 'À l\'instant'}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground truncate mb-1">
            {lastMessage?.content || 'Aucun message'}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {isAssistantConversation ? 'Support et assistance' : (conversation.listing?.title || 'Conversation')}
            </span>
            <div className="flex items-center space-x-1">
              {hasUnreadMessages && (
                <Badge variant="destructive" className="h-5 px-2 text-xs">
                  Nouveau
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Menu contextuel des actions */}
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onMarkAsRead?.(conversation)}>
                <Eye className="h-4 w-4 mr-2" />
                Marquer comme lu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStar?.(conversation)}>
                <Star className="h-4 w-4 mr-2" />
                {conversation.starred ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive?.(conversation)}>
                <Archive className="h-4 w-4 mr-2" />
                {conversation.is_archived ? 'Désarchiver' : 'Archiver'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete?.(conversation)}
                className="text-destructive focus:text-destructive"
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
};

// Composant pour afficher une bulle de message
const MessageBubble = ({ 
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
        relative max-w-xs lg:max-w-md px-4 py-2 rounded-lg cursor-pointer
        transition-all duration-200
        ${isOwn 
          ? 'bg-primary text-primary-foreground' 
          : isAssistantMessage
            ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 border border-blue-200'
            : 'bg-muted text-muted-foreground'
        }
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
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
            <span className="text-xs font-medium text-blue-600">
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
};

// Composant principal avec QueryClient
const MessagingPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MessagingPageContent />
    </QueryClientProvider>
  );
};

export default MessagingPage;