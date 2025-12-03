import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Search,
  Star,
  Archive,
  Trash2,
  User,
  Clock,
  Check,
  CheckCheck,
  Send,
  Paperclip,
  Smile,
  Settings,
  Filter,
  MessageSquare,
  Circle,
  RefreshCw
} from 'lucide-react';
import { messageService } from '../services';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealTimeMessaging } from '../hooks/useRealTimeMessaging';
import ConversationList from './ConversationList';
import MessageComposer from './MessageComposer';
import EnhancedMessageCard from './EnhancedMessageCard';
import { RealTimeTester } from './messaging';

const MessageCenter = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchTerm, setSearchParam] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const presenceChannelRef = useRef(null);
  const typingChannelRef = useRef(null);
  const realtimeChannelRef = useRef(null);

  // Récupérer l'ID de la conversation depuis les paramètres d'URL
  const conversationId = searchParams.get('conversation') || selectedConversation?.id;

  // Fonction de chargement des conversations avec temps réel
  const loadConversations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('🔄 Chargement des conversations avec temps réel...');
      const data = await messageService.getUserConversations();
      setConversations(data);
      
      // Vérifier s'il y a des paramètres d'URL pour ouvrir une conversation spécifique
      const urlConversationId = searchParams.get('conversation');
      const listingId = searchParams.get('listing');
      
      if (urlConversationId) {
        const conversation = data.find(c => c.id === urlConversationId);
        if (conversation) {
          setSelectedConversation(conversation);
          loadMessages(conversation.id);
        }
      } else if (listingId) {
        const conversation = data.find(c => c.listing_id === listingId);
        if (conversation) {
          setSelectedConversation(conversation);
          loadMessages(conversation.id);
        }
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de chargement des messages avec temps réel
  const loadMessages = async (convId) => {
    if (!convId) return;

    setIsLoadingMessages(true);
    try {
      console.log('🔄 Chargement des messages avec temps réel...');
      const data = await messageService.getConversationMessages(convId);
      // Inverser pour affichage chronologique (anciens en haut, récents en bas)
      setMessages(data.reverse());
      
      // Marquer comme lus
      await messageService.markMessagesAsRead(convId);
      
      // Scroll vers le bas
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Configuration du temps réel pour les messages
  useEffect(() => {
    if (!conversationId) return;

    console.log('🔌 Configuration du temps réel pour la conversation:', conversationId);

    // Écouter les nouveaux messages en temps réel
    realtimeChannelRef.current = supabase
      .channel(`realtime-messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        console.log('🆕 NOUVEAU MESSAGE REÇU EN TEMPS RÉEL:', payload.new);
        
        // Ajouter immédiatement le nouveau message
        setMessages(prev => [...prev, payload.new]);
        
        // Actualiser les conversations
        loadConversations();
        
        // Scroll vers le bas
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        console.log('🔄 Message mis à jour en temps réel:', payload.new);
        
        // Mettre à jour le message dans la liste
        setMessages(prev => prev.map(msg => 
          msg.id === payload.new.id ? payload.new : msg
        ));
      })
      .subscribe();

    return () => {
      if (realtimeChannelRef.current) {
        console.log('🔌 Désabonnement du temps réel');
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [conversationId]);

  // Actualisation automatique toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (conversationId) {
        console.log('⏰ Actualisation automatique des messages...');
        loadMessages(conversationId);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [conversationId]);

  // Charger au montage
  useEffect(() => {
    loadConversations();
  }, [user]);

  // Marquer les messages comme lus quand la conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      messageService.markMessagesAsRead(selectedConversation.id);
    }
  }, [selectedConversation, messages]);

  // Gérer la présence des utilisateurs (en ligne/hors ligne)
  useEffect(() => {
    if (!selectedConversation || !user) return;

    const channelId = `presence:${selectedConversation.id}`;
    presenceChannelRef.current = supabase.channel(channelId);

    presenceChannelRef.current
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannelRef.current.presenceState();
        const onlineUserIds = Object.keys(presenceState);
        setOnlineUsers(new Set(onlineUserIds));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach(presence => {
          setOnlineUsers(prev => new Set([...prev, presence.user_id]));
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach(presence => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(presence.user_id);
            return newSet;
          });
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Se connecter au canal de présence
          await presenceChannelRef.current.track({ 
            user_id: user.id, 
            online_at: new Date().toISOString(),
            user_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim()
          });
        }
      });

    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [selectedConversation, user]);

  // Gérer l'indicateur de frappe temps réel
  useEffect(() => {
    if (!selectedConversation || !user) return;

    const channelId = `typing:${selectedConversation.id}`;
    typingChannelRef.current = supabase.channel(channelId);

    typingChannelRef.current
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, isTyping } = payload.payload;
        
        if (userId !== user.id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (isTyping) {
              newSet.add(userId);
            } else {
              newSet.delete(userId);
            }
            return newSet;
          });
        }
      })
      .subscribe();

    return () => {
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
      }
    };
  }, [selectedConversation, user]);

  // Selectionner une conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowMobileMenu(false); // Fermer le menu mobile
    
    // Réinitialiser les états
    setIsTyping(false);
    setTypingUsers(new Set());
  };

  // Message envoye
  const handleMessageSent = () => {
    // Recharger les messages immédiatement
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
    // Recharger les conversations pour mettre à jour le dernier message
    loadConversations();
  };

  // Gérer l'indicateur de frappe
  const handleTyping = (isTyping) => {
    setIsTyping(isTyping);
  };

  // Supprimer une conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      await messageService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Erreur suppression conversation:', error);
    }
  };

  // Archiver une conversation
  const handleArchiveConversation = async (conversationId) => {
    try {
      // Mettre a jour le statut de la conversation
      const { error } = await supabase
        .from('conversations')
        .update({ is_active: false })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId ? { ...c, is_active: false } : c
        )
      );
    } catch (error) {
      console.error('Erreur archivage conversation:', error);
    }
  };

  // Marquer comme favori
  const handleStarConversation = async (conversationId) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      const newStarredValue = !conversation.starred;

      const { error } = await supabase
        .from('conversations')
        .update({ starred: newStarredValue })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId ? { ...c, starred: newStarredValue } : c
        )
      );
    } catch (error) {
      console.error('Erreur marquage favori:', error);
    }
  };

  // Rechercher des conversations
  const handleSearchConversations = async (searchTerm) => {
    if (!searchTerm.trim()) {
      await loadConversations();
      return;
    }

    try {
      const data = await messageService.searchConversations(searchTerm);
      setConversations(data);
    } catch (error) {
      console.error('Erreur recherche conversations:', error);
    }
  };

  // Obtenir le nom du participant
  const getParticipantName = (conversation) => {
    if (!conversation) return '';
    
    if (conversation.participant1_id === user?.id) {
      return `${conversation.participant2?.first_name || ''} ${conversation.participant2?.last_name || ''}`.trim();
    } else {
      return `${conversation.participant1?.first_name || ''} ${conversation.participant1?.last_name || ''}`.trim();
    }
  };

  // Obtenir l'avatar du participant
  const getParticipantAvatar = (conversation) => {
    if (!conversation) return '';
    
    if (conversation.participant1_id === user?.id) {
      return conversation.participant2?.avatar_url;
    } else {
      return conversation.participant1?.avatar_url;
    }
  };

  // Obtenir l'ID du participant (l'autre utilisateur)
  const getParticipantId = (conversation) => {
    if (!conversation) return null;
    
    if (conversation.participant1_id === user?.id) {
      return conversation.participant2_id;
    } else {
      return conversation.participant1_id;
    }
  };

  // Vérifier si le participant est en ligne
  const isParticipantOnline = (conversation) => {
    const participantId = getParticipantId(conversation);
    return participantId ? onlineUsers.has(participantId) : false;
  };

  // Vérifier si le participant est en train de taper
  const isParticipantTyping = (conversation) => {
    const participantId = getParticipantId(conversation);
    return participantId ? typingUsers.has(participantId) : false;
  };

  // Formater la date
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Verifier si un message est lu
  const isMessageRead = (message) => {
    return message.is_read || message.sender_id === user?.id;
  };

  // Nettoyer les canaux au démontage
  useEffect(() => {
    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
      }
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connexion requise
          </h3>
          <p className="text-gray-500">
            Veuillez vous connecter pour accéder à la messagerie.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Liste des conversations */}
      <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col ${
        showMobileMenu ? 'block' : 'hidden md:flex'
      }`}>
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onArchiveConversation={handleArchiveConversation}
          onStarConversation={handleStarConversation}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchParam}
          onSearch={handleSearchConversations}
        />
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header de la conversation */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-3">
                {/* Bouton retour mobile */}
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="md:hidden p-2 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={20} />
                </button>

                {/* Avatar avec animation et statut en ligne */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <img
                    src={getParticipantAvatar(selectedConversation) || '/default-avatar.png'}
                    alt={getParticipantName(selectedConversation)}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                  />
                  {/* Statut en ligne/hors ligne */}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${
                    isParticipantOnline(selectedConversation) 
                      ? 'bg-green-600' 
                      : 'bg-gray-400'
                  }`}>
                    {isParticipantOnline(selectedConversation) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-full h-full bg-green-600 rounded-full"
                      />
                    )}
                  </div>
                </motion.div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getParticipantName(selectedConversation) || 'Utilisateur'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {selectedConversation.listing && (
                      <p className="text-sm text-gray-500">
                        {selectedConversation.listing.title}
                      </p>
                    )}
                    {/* Indicateur de frappe */}
                    {isParticipantTyping(selectedConversation) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center space-x-1 text-sm text-blue-600"
                      >
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs">tape...</span>
                      </motion.div>
                    )}
                    {/* Statut en ligne */}
                    {isParticipantOnline(selectedConversation) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center space-x-1 text-sm text-green-600"
                      >
                        <Circle size={8} className="fill-current" />
                        <span className="text-xs">en ligne</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Bouton de rafraîchissement manuel */}
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadConversations}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  title="Actualiser les conversations"
                >
                  <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Phone size={20} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Video size={20} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Settings size={20} />
                </motion.button>
              </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
              {/* Testeur de Temps Réel - À RETIRER APRÈS TEST */}
              {selectedConversation && (
                <div className="mb-4">
                  <RealTimeTester conversationId={selectedConversation.id} />
                </div>
              )}

              {isLoadingMessages ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-32"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </motion.div>
              ) : messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Aucun message dans cette conversation</p>
                  <p className="text-sm text-gray-400 mt-2">Commencez la conversation !</p>
                </motion.div>
              ) : (
                <AnimatePresence>
                      {/* Indicateur de début de conversation */}
                      {messages.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center py-4"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-500">
                            <span>📜</span>
                            <span>Début de la conversation</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            💡 Appui long sur un message pour activer la sélection multiple
                          </p>
                        </motion.div>
                      )}

                  {messages.map((message, index) => {
                    const isOwnMessage = message.sender_id === user?.id;

                    return (
                      <EnhancedMessageCard
                        key={message.id}
                        message={message}
                        isOwnMessage={isOwnMessage}
                        showTimestamp={true}
                        showStatus={true}
                      />
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Indicateur de frappe amélioré */}
            <AnimatePresence>
              {isParticipantTyping(selectedConversation) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="px-4 py-2 text-sm text-gray-500 italic bg-gray-50 border-t border-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-blue-600 font-medium">
                      {getParticipantName(selectedConversation)} est en train d'écrire...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Composant de composition */}
            <MessageComposer
              conversationId={selectedConversation.id}
              onMessageSent={handleMessageSent}
              onTyping={handleTyping}
              listingInfo={selectedConversation.listing}
            />
          </>
        ) : (
          /* Écran de bienvenue */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Bienvenue dans la messagerie
              </h3>
              <p className="text-gray-500 max-w-md">
                Sélectionnez une conversation pour commencer à discuter ou créez-en une nouvelle.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageCenter; 