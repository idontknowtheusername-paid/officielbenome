import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Archive,
  Star,
  MessageSquare,
  Clock,
  User,
  Plus,
  X
} from 'lucide-react';
import { messageService } from '../services/supabase.service';
import { useAuth } from '../contexts/AuthContext';

const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  onDeleteConversation,
  onArchiveConversation,
  onStarConversation,
  isLoading = false 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, starred, archived
  const [showFilters, setShowFilters] = useState(false);

  // Filtrer les conversations
  const filteredConversations = conversations.filter(conversation => {
    // Filtre par recherche
    const matchesSearch = searchTerm === '' || 
      conversation.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getParticipantName(conversation).toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par type
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && hasUnreadMessages(conversation)) ||
      (filter === 'starred' && conversation.starred) ||
      (filter === 'archived' && !conversation.is_active);

    return matchesSearch && matchesFilter;
  });

  // Obtenir le nom du participant (l'autre utilisateur)
  const getParticipantName = (conversation) => {
    if (conversation.participant1_id === user?.id) {
      return `${conversation.participant2?.first_name || ''} ${conversation.participant2?.last_name || ''}`.trim();
    } else {
      return `${conversation.participant1?.first_name || ''} ${conversation.participant1?.last_name || ''}`.trim();
    }
  };

  // Obtenir l'avatar du participant
  const getParticipantAvatar = (conversation) => {
    if (conversation.participant1_id === user?.id) {
      return conversation.participant2?.avatar_url;
    } else {
      return conversation.participant1?.avatar_url;
    }
  };

  // Vérifier s'il y a des messages non lus
  const hasUnreadMessages = (conversation) => {
    return conversation.messages?.some(msg => 
      !msg.is_read && msg.sender_id !== user?.id
    );
  };

  // Obtenir le dernier message
  const getLastMessage = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return null;
    }
    return conversation.messages[conversation.messages.length - 1];
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) { // 7 jours
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  // Obtenir le nombre de messages non lus
  const getUnreadCount = (conversation) => {
    if (!conversation.messages) return 0;
    return conversation.messages.filter(msg => 
      !msg.is_read && msg.sender_id !== user?.id
    ).length;
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[...Array(5)].map((_, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 border-b border-gray-100 animate-pulse"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold text-gray-900"
          >
            Messages
          </motion.h2>
          <div className="flex items-center space-x-2">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Plus size={16} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical size={16} />
            </motion.button>
          </div>
        </div>

        {/* Recherche */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-4"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher des conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm"
          />
        </motion.div>

        {/* Filtres */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Filtres
            </button>
          </div>
          {filter !== 'all' && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setFilter('all')}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <X size={12} />
              <span>Effacer</span>
            </motion.button>
          )}
        </motion.div>

        {/* Menu des filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-2 bg-white rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'Toutes', icon: MessageSquare },
                  { value: 'unread', label: 'Non lues', icon: Clock },
                  { value: 'starred', label: 'Favoris', icon: Star },
                  { value: 'archived', label: 'Archivées', icon: Archive }
                ].map((filterOption) => (
                  <motion.button
                    key={filterOption.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setFilter(filterOption.value);
                      setShowFilters(false);
                    }}
                    className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                      filter === filterOption.value
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <filterOption.icon size={12} className="inline mr-1" />
                    {filterOption.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center"
          >
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'all' ? 'Aucun résultat' : 'Aucune conversation'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez une nouvelle conversation'
              }
            </p>
          </motion.div>
        ) : (
          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {filteredConversations.map((conversation, index) => {
                const participantName = getParticipantName(conversation);
                const participantAvatar = getParticipantAvatar(conversation);
                const lastMessage = getLastMessage(conversation);
                const unreadCount = getUnreadCount(conversation);
                const isSelected = selectedConversation?.id === conversation.id;

                return (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    onClick={() => onSelectConversation(conversation)}
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <motion.div 
                        className="relative flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                      >
                        <img
                          src={participantAvatar || '/default-avatar.png'}
                          alt={participantName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                        />
                        {conversation.is_active && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                          />
                        )}
                      </motion.div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className={`text-sm font-medium truncate ${
                            unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {participantName || 'Utilisateur'}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {conversation.starred && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 15 }}
                              >
                                <Star size={12} className="text-yellow-500 fill-current" />
                              </motion.div>
                            )}
                            <span className="text-xs text-gray-400">
                              {formatDate(conversation.last_message_at)}
                            </span>
                          </div>
                        </div>

                        {/* Dernier message */}
                        <p className={`text-sm truncate ${
                          unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {lastMessage ? lastMessage.content : 'Aucun message'}
                        </p>

                        {/* Annonce associée */}
                        {conversation.listing && (
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 truncate">
                              {conversation.listing.title}
                            </span>
                          </div>
                        )}

                        {/* Badge messages non lus */}
                        {unreadCount > 0 && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-between mt-2"
                          >
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList; 