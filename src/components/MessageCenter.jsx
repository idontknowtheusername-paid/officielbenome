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
  MessageSquare
} from 'lucide-react';
import { messageService } from '../services/supabase.service';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ConversationList from './ConversationList';
import MessageComposer from './MessageComposer';

const MessageCenter = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const messagesEndRef = useRef(null);

  // Charger les conversations
  const loadConversations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await messageService.getUserConversations();
      setConversations(data);
      
      // Verifier s'il y a des parametres d'URL pour ouvrir une conversation specifique
      const conversationId = searchParams.get('conversation');
      const listingId = searchParams.get('listing');
      
      if (conversationId) {
        // Trouver la conversation dans la liste
        const conversation = data.find(c => c.id === conversationId);
        if (conversation) {
          setSelectedConversation(conversation);
          loadMessages(conversation.id);
        }
      } else if (listingId) {
        // Trouver une conversation liee a cette annonce
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

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId) => {
    if (!conversationId) return;

    setIsLoadingMessages(true);
    try {
      const data = await messageService.getConversationMessages(conversationId);
      setMessages(data);
      
      // Marquer comme lus
      await messageService.markMessagesAsRead(conversationId);
      
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

  // Selectionner une conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    setShowMobileMenu(false); // Fermer le menu mobile
  };

  // Message envoye
  const handleMessageSent = () => {
    // Recharger les messages
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
    // Recharger les conversations pour mettre a jour le dernier message
    loadConversations();
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

  // Charger au montage
  useEffect(() => {
    loadConversations();
  }, [user]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-96"
      >
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Connectez-vous pour accéder aux messages</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Liste des conversations - Desktop */}
      <div className="hidden md:block">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onArchiveConversation={handleArchiveConversation}
          onStarConversation={handleStarConversation}
          isLoading={isLoading}
        />
      </div>

      {/* Liste des conversations - Mobile */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl"
          >
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onArchiveConversation={handleArchiveConversation}
              onStarConversation={handleStarConversation}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col bg-white shadow-lg">
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

                {/* Avatar avec animation */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <img
                    src={getParticipantAvatar(selectedConversation) || '/default-avatar.png'}
                    alt={getParticipantName(selectedConversation)}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </motion.div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getParticipantName(selectedConversation) || 'Utilisateur'}
                  </h3>
                  {selectedConversation.listing && (
                    <p className="text-sm text-gray-500">
                      {selectedConversation.listing.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
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
                  {messages.map((message, index) => {
                    const isOwnMessage = message.sender_id === user?.id;
                    const isRead = isMessageRead(message);

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          delay: index * 0.1,
                          type: "spring",
                          damping: 25,
                          stiffness: 200
                        }}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                            isOwnMessage 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className={`flex items-center justify-end space-x-1 mt-1 ${
                            isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">
                              {formatMessageTime(message.created_at)}
                            </span>
                            {isOwnMessage && (
                              <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-xs"
                              >
                                {isRead ? <CheckCheck size={12} /> : <Check size={12} />}
                              </motion.span>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Indicateur de frappe */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="px-4 py-2 text-sm text-gray-500 italic bg-gray-50"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>{getParticipantName(selectedConversation)} tape...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Composant de composition */}
            <MessageComposer
              conversationId={selectedConversation.id}
              onMessageSent={handleMessageSent}
              onTyping={setIsTyping}
              listingInfo={selectedConversation.listing}
            />
          </>
        ) : (
          /* Écran d'accueil */
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50"
          >
            <div className="text-center max-w-md mx-auto px-6">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <MessageSquare size={32} className="text-white" />
              </motion.div>
              <motion.h3 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-semibold text-gray-900 mb-3"
              >
                Sélectionnez une conversation
              </motion.h3>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 leading-relaxed"
              >
                Choisissez une conversation dans la liste pour commencer à discuter avec d'autres utilisateurs
              </motion.p>
              
              {/* Bouton pour ouvrir la liste sur mobile */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => setShowMobileMenu(true)}
                className="md:hidden mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voir les conversations
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Overlay mobile */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMenu(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageCenter; 