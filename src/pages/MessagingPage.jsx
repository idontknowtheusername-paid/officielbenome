import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConversations, useMessageStats, useRealtimeMessages } from '../hooks/useMessages';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  MessageSquare, 
  Users, 
  Star, 
  Archive,
  Plus,
  Search,
  Bell,
  Settings,
  Filter,
  MoreVertical,
  ChevronLeft,
  Menu,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  User,
  Clock,
  Eye,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services';
import { useToast } from '../components/ui/use-toast';
import { 
  MobileMessagingNav, 
  MessagingSearch, 
  MessageInput 
} from '../components/messaging';
import { supabase } from '../lib/supabase';
import { useSearchParams } from 'react-router-dom';

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
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Utiliser le hook de chat en temps réel
  useRealtimeMessages(selectedConversation?.id);

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
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    setShowMobileMenu(false); // Fermer le menu mobile
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
      
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      });
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
    toast({
      title: "Pièces jointes",
      description: `${files.length} fichier(s) sélectionné(s)`,
    });
  };

  // Gérer les emojis
  const handleEmoji = () => {
    toast({
      title: "Emojis",
      description: "Sélecteur d'emojis à implémenter",
    });
  };

  // Gérer l'appel
  const handleCall = () => {
    toast({
      title: "Appel",
      description: "Fonctionnalité d'appel à implémenter",
    });
  };

  // Gérer la vidéo
  const handleVideo = () => {
    toast({
      title: "Vidéo",
      description: "Fonctionnalité de vidéo à implémenter",
    });
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
      toast({
        title: "Messages marqués comme lus",
        description: "Les messages ont été marqués comme lus",
      });
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
      toast({
        title: newStarredState ? "Ajouté aux favoris" : "Retiré des favoris",
        description: newStarredState ? "Conversation ajoutée à vos favoris" : "Conversation retirée de vos favoris",
      });
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
      toast({
        title: "Conversation archivée",
        description: "La conversation a été archivée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver la conversation",
        variant: "destructive",
      });
    }
  };

  // Gestion des erreurs
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-500 mb-4">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <MobileMessagingNav
        selectedConversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
        onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
        onSearch={() => setShowMobileMenu(false)}
        onFilter={() => setShowMobileMenu(false)}
        onMore={() => console.log('Plus d\'options')}
        onCall={handleCall}
        onVideo={handleVideo}
        unreadCount={stats.unread}
      />

      {/* Header Desktop */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 hidden md:block">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centre de Messages</h1>
            <p className="text-gray-600">
              Gérez vos conversations et échangez avec d'autres utilisateurs
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Conversation
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-140px)]">
        {/* Sidebar des conversations - cachée sur mobile si conversation sélectionnée */}
        <div className={`
          ${selectedConversation ? 'hidden md:block' : 'block'} 
          w-full md:w-80 lg:w-96 
          bg-white border-r border-gray-200 
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
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchedConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune conversation
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Aucune conversation trouvée pour votre recherche' : 'Commencez une nouvelle conversation'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {searchedConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversation?.id === conversation.id}
                    onSelect={() => handleSelectConversation(conversation)}
                    onMarkAsRead={() => handleMarkAsRead(conversation)}
                    onToggleStar={() => handleToggleStar(conversation)}
                    onArchive={() => handleArchive(conversation)}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone de conversation active */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Header de la conversation */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {selectedConversation.participant1?.first_name || 'Utilisateur'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.listing?.title || 'Conversation'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={handleCall}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleVideo}>
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">
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
                  />
                ))
              )}
            </div>

            {/* Zone de saisie optimisée */}
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
        ) : (
          /* Écran d'accueil quand aucune conversation n'est sélectionnée */
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-500">
                Choisissez une conversation dans la liste pour commencer à échanger
              </p>
            </div>
          </div>
        )}
      </div>
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
  currentUserId 
}) => {
  const lastMessage = conversation.messages?.[conversation.messages.length - 1];
  const hasUnreadMessages = conversation.messages?.some(msg => !msg.is_read && msg.sender_id !== currentUserId);
  
  // Déterminer l'autre participant
  const otherParticipant = conversation.participant1_id === currentUserId 
    ? conversation.participant2 
    : conversation.participant1;

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
        p-4 cursor-pointer transition-colors hover:bg-gray-50
        ${isSelected ? 'bg-blue-50 border-r-2 border-blue-600' : ''}
        ${hasUnreadMessages ? 'bg-blue-50' : ''}
      `}
      onClick={onSelect}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          {hasUnreadMessages && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm truncate">
              {otherParticipant ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : 'Utilisateur'}
            </h4>
            <div className="flex items-center space-x-2">
              {conversation.starred && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
              <span className="text-xs text-gray-500">
                {lastMessage?.created_at ? formatTime(lastMessage.created_at) : 'À l\'instant'}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 truncate mb-1">
            {lastMessage?.content || 'Aucun message'}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {conversation.listing?.title || 'Conversation'}
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
      </div>
    </div>
  );
};

// Composant pour afficher une bulle de message
const MessageBubble = ({ message, isOwn, participant1, participant2 }) => {
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

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-xs lg:max-w-md px-4 py-2 rounded-lg
        ${isOwn 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-200 text-gray-900'
        }
      `}>
        <div className="flex items-center space-x-2 mb-1">
          {!isOwn && (
            <span className="text-xs font-medium">
              {participant1?.first_name || 'Utilisateur'}
            </span>
          )}
          <span className="text-xs opacity-75">
            {formatTime(message.created_at)}
          </span>
        </div>
        <p className="text-sm">{message.content}</p>
      </div>
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