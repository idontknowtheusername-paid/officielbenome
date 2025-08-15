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
  X,
  Circle
} from 'lucide-react';
import { messageService } from '../services/supabase.service';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ConversationSearch from './ConversationSearch';

const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  onDeleteConversation,
  onArchiveConversation,
  onStarConversation,
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  onSearch
}) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all'); // all, unread, starred, archived
  const [showFilters, setShowFilters] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: 'all',
    starred: false,
    unread: false
  });

  // Écouter les statuts en ligne des utilisateurs
  useEffect(() => {
    if (!user) return;

    // Canal global pour la présence
    const presenceChannel = supabase.channel('global-presence');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
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
          // Se connecter au canal de présence global
          await presenceChannel.track({ 
            user_id: user.id, 
            online_at: new Date().toISOString(),
            user_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim()
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

  // Écouter les indicateurs de frappe globaux
  useEffect(() => {
    if (!user) return;

    // Canal global pour la frappe
    const typingChannel = supabase.channel('global-typing');
    
    typingChannel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, isTyping, conversationId } = payload.payload;
        
        if (userId !== user.id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (isTyping) {
              newSet.add(`${userId}:${conversationId}`);
            } else {
              newSet.delete(`${userId}:${conversationId}`);
            }
            return newSet;
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [user]);

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

    // Filtres avancés
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && conversation.is_active) ||
      (filters.status === 'archived' && !conversation.is_active);

    const matchesType = filters.type === 'all' ||
      (filters.type === 'listing' && conversation.listing_id) ||
      (filters.type === 'support' && conversation.type === 'support') ||
      (filters.type === 'general' && !conversation.listing_id);

    const matchesDateRange = filters.dateRange === 'all' ||
      matchesDateRangeFilter(conversation, filters.dateRange);

    const matchesStarred = !filters.starred || conversation.starred;
    const matchesUnread = !filters.unread || hasUnreadMessages(conversation);

    return matchesSearch && matchesFilter && matchesStatus && matchesType && 
           matchesDateRange && matchesStarred && matchesUnread;
  });

  // Vérifier si une conversation correspond à la plage de dates
  const matchesDateRangeFilter = (conversation, dateRange) => {
    if (!conversation.last_message_at) return false;
    
    const lastMessageDate = new Date(conversation.last_message_at);
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        return lastMessageDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return lastMessageDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return lastMessageDate >= monthAgo;
      default:
        return true;
    }
  };

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

  // Obtenir l'ID du participant
  const getParticipantId = (conversation) => {
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
    const conversationId = conversation.id;
    return participantId ? typingUsers.has(`${participantId}:${conversationId}`) : false;
  };

  // Verifier s'il y a des messages non lus
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

  // Gérer le changement de filtres
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Gérer la recherche
  const handleSearch = (term) => {
    if (onSearch) {
      onSearch(term);
    }
  };

  // Gérer le changement de terme de recherche
  const handleSearchChange = (term) => {
    if (onSearchChange) {
      onSearchChange(term);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <Plus size={20} />
          </button>
        </div>

        {/* Recherche et filtres */}
        <ConversationSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Filtres rapides */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'Toutes', icon: MessageSquare },
            { key: 'unread', label: 'Non lues', icon: MessageSquare },
            { key: 'starred', label: 'Favoris', icon: Star },
            { key: 'archived', label: 'Archivées', icon: Archive }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                filter === filterOption.key
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <filterOption.icon size={14} />
              <span>{filterOption.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune conversation trouvée
            </h3>
            <p className="text-gray-500">
              {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== false)
                ? 'Essayez de modifier vos critères de recherche ou vos filtres.'
                : 'Commencez une nouvelle conversation !'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              const participantName = getParticipantName(conversation);
              const participantAvatar = getParticipantAvatar(conversation);
              const lastMessage = getLastMessage(conversation);
              const unreadCount = getUnreadCount(conversation);
              const isSelected = selectedConversation?.id === conversation.id;
              const isOnline = isParticipantOnline(conversation);
              const isTyping = isParticipantTyping(conversation);

              return (
                <motion.div
                  key={conversation.id}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectConversation(conversation)}
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
                      {/* Statut en ligne - coin inférieur droit */}
                      {isOnline && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                        />
                      )}
                      {/* Indicateur de frappe - coin inférieur gauche */}
                      {isTyping && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"
                        />
                      )}
                    </motion.div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-sm font-medium truncate ${
                            unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {participantName || 'Utilisateur'}
                          </h3>
                          {/* Badge en ligne */}
                          {isOnline && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center space-x-1"
                            >
                              <Circle size={8} className="text-green-500 fill-current" />
                              <span className="text-xs text-green-600 font-medium">en ligne</span>
                            </motion.div>
                          )}
                          {/* Badge en train de taper */}
                          {isTyping && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center space-x-1"
                            >
                              <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-xs text-blue-600 font-medium">tape...</span>
                            </motion.div>
                          )}
                        </div>
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

                    {/* Actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStarConversation(conversation.id);
                        }}
                        className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <Star size={16} className={conversation.starred ? 'text-yellow-500 fill-current' : ''} />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveConversation(conversation.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Archive size={16} />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList; 