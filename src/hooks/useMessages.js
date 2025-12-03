import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { messageService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '@/utils/logger';

// ============================================
// CONSTANTES ET UTILITAIRES
// ============================================

// Clés de cache centralisées pour éviter les incohérences
const QUERY_KEYS = {
  conversations: (userId) => ['conversations', userId],
  conversationMessages: (conversationId) => ['conversation-messages', conversationId],
  conversationsSearch: (searchTerm) => ['conversations-search', searchTerm],
  messageStats: (userId) => ['message-stats', userId],
};

// Configuration du cache
const CACHE_CONFIG = {
  conversations: {
    staleTime: 30000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  messages: {
    staleTime: 10000, // 10 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  search: {
    staleTime: 60000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  },
};

// Utilitaire de logging conditionnel
const conditionalLog = (level, ...args) => {
  if (process.env.NODE_ENV === 'development') {
    logger[level](...args);
  }
};

// ============================================
// HOOKS DE REQUÊTE
// ============================================

/**
 * Hook pour récupérer les conversations de l'utilisateur
 * @returns {UseQueryResult} Résultat de la requête
 */
export const useConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.conversations(user?.id),
    queryFn: async () => {
      try {
        conditionalLog('log', '🔍 Hook useConversations - Début de la récupération');
        const result = await messageService.getUserConversations();
        conditionalLog('log', '🔍 Hook useConversations - Récupération réussie:', result?.length || 0);
        return result;
      } catch (error) {
        conditionalLog('error', '❌ Hook useConversations - Erreur lors de la récupération:', error);
        
        // Retourner un message d'erreur structuré
        if (error.code === 'PGRST116') {
          throw new Error('Erreur de base de données: Vérifiez la structure des tables');
        } else if (error.message?.includes('Invalid Refresh Token')) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (error.status === 400) {
          throw new Error('Requête invalide. Vérifiez les paramètres.');
        } else {
          throw new Error(`Erreur de messagerie: ${error.message || 'Erreur inconnue'}`);
        }
      }
    },
    enabled: !!user,
    staleTime: CACHE_CONFIG.conversations.staleTime,
    gcTime: CACHE_CONFIG.conversations.gcTime,
    refetchInterval: 60000, // Refetch toutes les 60s en arrière-plan (belt and suspenders)
    retry: (failureCount, error) => {
      // Ne pas réessayer pour les erreurs d'authentification
      if (error.message?.includes('Session expirée') || 
          error.message?.includes('Utilisateur non connecté')) {
        return false;
      }
      // Réessayer jusqu'à 2 fois pour les autres erreurs
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook pour récupérer les messages d'une conversation avec pagination infinie
 * @param {string} conversationId - ID de la conversation
 * @param {number} pageSize - Nombre de messages par page
 * @returns {UseInfiniteQueryResult} Résultat de la requête infinie
 */
export const useConversationMessages = (conversationId, pageSize = 50) => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.conversationMessages(conversationId),
    queryFn: ({ pageParam = 0 }) => 
      messageService.getConversationMessages(conversationId, {
        from: pageParam * pageSize,
        to: (pageParam + 1) * pageSize - 1
      }),
    enabled: !!conversationId && !!user,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // Si moins de messages que pageSize, c'est la dernière page
      if (lastPage.length < pageSize) return undefined;
      return lastPageParam + 1;
    },
    staleTime: CACHE_CONFIG.messages.staleTime,
    gcTime: CACHE_CONFIG.messages.gcTime,
  });
};

/**
 * Hook pour rechercher des conversations
 * @param {string} searchTerm - Terme de recherche
 * @returns {UseQueryResult} Résultat de la requête
 */
export const useSearchConversations = (searchTerm) => {
  const { user } = useAuth();
  const { data: conversations } = useConversations();

  return useQuery({
    queryKey: QUERY_KEYS.conversationsSearch(searchTerm),
    queryFn: () => {
      // Recherche côté client pour l'instant (plus rapide)
      if (!conversations) return [];
      
      const searchLower = searchTerm.toLowerCase();
      return conversations.filter(conv => {
        const participant1Name = `${conv.participant1?.first_name || ''} ${conv.participant1?.last_name || ''}`.toLowerCase();
        const participant2Name = `${conv.participant2?.first_name || ''} ${conv.participant2?.last_name || ''}`.toLowerCase();
        const listingTitle = conv.listing?.title?.toLowerCase() || '';
        
        return participant1Name.includes(searchLower) || 
               participant2Name.includes(searchLower) || 
               listingTitle.includes(searchLower);
      });
    },
    enabled: !!searchTerm && searchTerm.length >= 2 && !!user && !!conversations,
    staleTime: CACHE_CONFIG.search.staleTime,
    gcTime: CACHE_CONFIG.search.gcTime,
  });
};

/**
 * Hook pour les statistiques des messages
 * @returns {UseQueryResult} Statistiques des messages
 */
export const useMessageStats = () => {
  const { user } = useAuth();
  const { data: conversations } = useConversations();

  return useQuery({
    queryKey: QUERY_KEYS.messageStats(user?.id),
    queryFn: () => {
      if (!conversations) return null;

      const stats = {
        total: conversations.length,
        unread: 0,
        active: 0,
        starred: 0,
        archived: 0
      };

      conversations.forEach(conv => {
        if (conv.messages?.some(msg => !msg.is_read && msg.sender_id !== user?.id)) {
          stats.unread++;
        }
        if (conv.is_active) stats.active++;
        if (conv.starred) stats.starred++;
        if (!conv.is_active) stats.archived++;
      });

      return stats;
    },
    enabled: !!user && !!conversations,
  });
};

// ============================================
// HOOKS DE MUTATION
// ============================================

/**
 * Hook pour envoyer un message avec optimistic updates
 * @returns {UseMutationResult} Mutation pour envoyer un message
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ conversationId, content, messageType = 'text' }) =>
      messageService.sendMessage(conversationId, content, messageType),
    
    // Optimistic update
    onMutate: async ({ conversationId, content, messageType }) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.conversationMessages(conversationId) });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.conversations(user?.id) });

      // Snapshot de l'état précédent
      const previousMessages = queryClient.getQueryData(QUERY_KEYS.conversationMessages(conversationId));
      const previousConversations = queryClient.getQueryData(QUERY_KEYS.conversations(user?.id));

      // Créer un ID temporaire unique
      const tempId = `temp-${Date.now()}-${Math.random()}`;

      // Optimistic update pour les messages
      const optimisticMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: user?.id,
        content,
        message_type: messageType,
        created_at: new Date().toISOString(),
        is_read: false,
        sender: {
          id: user?.id,
          first_name: user?.user_metadata?.first_name || '',
          last_name: user?.user_metadata?.last_name || '',
          avatar_url: user?.user_metadata?.avatar_url
        }
      };

      queryClient.setQueryData(QUERY_KEYS.conversationMessages(conversationId), (old) => {
        if (!old) return { pages: [[optimisticMessage]], pageParams: [0] };
        
        const newPages = [...old.pages];
        if (newPages.length > 0) {
          newPages[newPages.length - 1] = [...newPages[newPages.length - 1], optimisticMessage];
        } else {
          newPages.push([optimisticMessage]);
        }
        
        return {
          ...old,
          pages: newPages
        };
      });

      // Optimistic update pour les conversations
      queryClient.setQueryData(QUERY_KEYS.conversations(user?.id), (old) => {
        if (!old) return old;
        
        return old.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                messages: [...(conv.messages || []).slice(-9), optimisticMessage] // Garder 10 derniers
              }
            : conv
        );
      });

      return { previousMessages, previousConversations, tempId };
    },

    // En cas d'erreur, restaurer l'état précédent
    onError: (err, variables, context) => {
      conditionalLog('error', '❌ Erreur lors de l\'envoi du message:', err);
      
      if (context?.previousMessages) {
        queryClient.setQueryData(QUERY_KEYS.conversationMessages(variables.conversationId), context.previousMessages);
      }
      if (context?.previousConversations) {
        queryClient.setQueryData(QUERY_KEYS.conversations(user?.id), context.previousConversations);
      }
    },

    // Succès - remplacer le message temporaire par le message réel
    onSuccess: (data, variables, context) => {
      conditionalLog('log', '✅ Message envoyé avec succès, remplacement du message temporaire');

      // Remplacer le message temporaire dans les messages de conversation
      queryClient.setQueryData(QUERY_KEYS.conversationMessages(variables.conversationId), (old) => {
        if (!old) return old;
        
        const newPages = old.pages.map(page =>
          page.map(msg => msg.id === context.tempId ? data : msg)
        );
        
        return {
          ...old,
          pages: newPages
        };
      });

      // Remplacer le message temporaire dans les conversations
      queryClient.setQueryData(QUERY_KEYS.conversations(user?.id), (old) => {
        if (!old) return old;
        
        return old.map(conv => {
          if (conv.id === variables.conversationId) {
            return {
              ...conv,
              last_message_at: data.created_at,
              updated_at: new Date().toISOString(),
              messages: (conv.messages || []).map(msg => 
                msg.id === context.tempId ? data : msg
              )
            };
          }
          return conv;
        });
      });
    },
  });
};

/**
 * Hook pour marquer les messages comme lus
 * @returns {UseMutationResult} Mutation pour marquer comme lu
 */
export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (conversationId) => messageService.markMessagesAsRead(conversationId),
    
    onSuccess: (_data, conversationId) => {
      // Mettre à jour les messages dans le cache
      queryClient.setQueryData(QUERY_KEYS.conversationMessages(conversationId), (old) => {
        if (!old) return old;
        
        const newPages = old.pages.map(page =>
          page.map(message => {
            // Plus précis : marquer comme lu SEULEMENT les messages reçus ET non lus
            if (message.receiver_id === user?.id && !message.is_read) {
              return { ...message, is_read: true };
            }
            return message;
          })
        );
        
        return {
          ...old,
          pages: newPages
        };
      });

      // Mettre à jour les conversations
      queryClient.setQueryData(QUERY_KEYS.conversations(user?.id), (old) => {
        if (!old) return old;
        
        return old.map(conv => 
          conv.id === conversationId 
            ? {
                ...conv,
                messages: conv.messages?.map(msg => {
                  // Plus précis : marquer comme lu SEULEMENT les messages reçus ET non lus
                  if (msg.receiver_id === user?.id && !msg.is_read) {
                    return { ...msg, is_read: true };
                  }
                  return msg;
                })
              }
            : conv
        );
      });
    },
  });
};

/**
 * Hook pour créer une nouvelle conversation
 * @returns {UseMutationResult} Mutation pour créer une conversation
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ participantId, listingId }) => 
      messageService.createConversation(participantId, listingId),
    
    onSuccess: (newConversation) => {
      // Ajouter la nouvelle conversation au cache
      queryClient.setQueryData(QUERY_KEYS.conversations(user?.id), (old) => {
        if (!old) return [newConversation];
        
        // Éviter les doublons
        const exists = old.some(conv => conv.id === newConversation.id);
        if (exists) return old;
        
        return [newConversation, ...old];
      });
    },
  });
};

/**
 * Hook pour supprimer une conversation
 * @returns {UseMutationResult} Mutation pour supprimer une conversation
 */
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (conversationId) => messageService.deleteConversation(conversationId),
    
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.conversations(user?.id) });
      
      const previousConversations = queryClient.getQueryData(QUERY_KEYS.conversations(user?.id));
      
      // Optimistic update
      queryClient.setQueryData(QUERY_KEYS.conversations(user?.id), (old) => {
        if (!old) return old;
        return old.filter(conv => conv.id !== conversationId);
      });

      return { previousConversations };
    },

    onError: (err, _conversationId, context) => {
      conditionalLog('error', '❌ Erreur lors de la suppression de la conversation:', err);
      if (context?.previousConversations) {
        queryClient.setQueryData(QUERY_KEYS.conversations(user?.id), context.previousConversations);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations(user?.id) });
    },
  });
};

/**
 * Hook pour supprimer un message individuel
 * @returns {UseMutationResult} Mutation pour supprimer un message
 */
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (messageId) => messageService.deleteMessage(messageId),
    
    onMutate: async (messageId) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.conversations(user?.id) });
      
      const previousConversations = queryClient.getQueryData(QUERY_KEYS.conversations(user?.id));

      // Optimistic update - supprimer le message des conversations
      queryClient.setQueryData(QUERY_KEYS.conversations(user?.id), (old) => {
        if (!old) return old;
        
        return old.map(conv => ({
          ...conv,
          messages: conv.messages?.filter(msg => msg.id !== messageId) || []
        }));
      });

      return { previousConversations };
    },

    onError: (err, _messageId, context) => {
      conditionalLog('error', '❌ Erreur lors de la suppression du message:', err);
      if (context?.previousConversations) {
        queryClient.setQueryData(QUERY_KEYS.conversations(user?.id), context.previousConversations);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations(user?.id) });
    },
  });
};

// ============================================
// HOOKS TEMPS RÉEL
// ============================================

/**
 * Hook GLOBAL pour écouter TOUS les nouveaux messages
 * À utiliser au niveau de l'application (pas dans les conversations individuelles)
 */
export const useGlobalRealtimeMessages = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    conditionalLog('log', '🌍 [GLOBAL REALTIME] Initialisation subscription globale pour user:', user.id);

    // Nom de channel stable (sans timestamp)
    const channelName = `global-messages-${user.id}`;
    const channel = supabase.channel(channelName);
    
    // Écouter TOUS les nouveaux messages où l'utilisateur est destinataire
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${user.id}`
    }, (payload) => {
      conditionalLog('log', '🔔 [GLOBAL REALTIME] NOUVEAU MESSAGE REÇU:', payload.new.id, 'dans conversation:', payload.new.conversation_id);
      
      // Mise à jour IMMÉDIATE du cache des conversations
      queryClient.setQueryData(QUERY_KEYS.conversations(user.id), (old) => {
        if (!old) return old;
        
        return old.map(conv => {
          if (conv.id === payload.new.conversation_id) {
            // Éviter les doublons
            const messageExists = conv.messages?.some(msg => msg.id === payload.new.id);
            if (messageExists) {
              conditionalLog('log', '⚠️ [GLOBAL REALTIME] Message déjà présent, ignoré');
              return conv;
            }
            
            // Ajouter le message à la liste
            const updatedMessages = [...(conv.messages || []), payload.new];
            
            // Garder seulement les 10 derniers messages
            const lastMessages = updatedMessages.slice(-10);
            
            conditionalLog('log', '✅ [GLOBAL REALTIME] Conversation mise à jour:', conv.id);
            
            return {
              ...conv,
              last_message_at: payload.new.created_at,
              updated_at: new Date().toISOString(),
              messages: lastMessages
            };
          }
          return conv;
        });
      });
    });

    // Écouter les mises à jour de messages (lecture, etc.)
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${user.id}`
    }, (payload) => {
      conditionalLog('log', '🔄 [GLOBAL REALTIME] MESSAGE MIS À JOUR:', payload.new.id);
      
      // Mettre à jour dans le cache des conversations
      queryClient.setQueryData(QUERY_KEYS.conversations(user.id), (old) => {
        if (!old) return old;
        
        return old.map(conv => {
          if (conv.id === payload.new.conversation_id) {
            return {
              ...conv,
              messages: (conv.messages || []).map(msg =>
                msg.id === payload.new.id ? payload.new : msg
              )
            };
          }
          return conv;
        });
      });
    });

    // S'abonner
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        conditionalLog('log', '✅ [GLOBAL REALTIME] Subscription globale ACTIVE');
      } else if (status === 'CHANNEL_ERROR') {
        conditionalLog('error', '❌ [GLOBAL REALTIME] Erreur subscription globale');
      } else if (status === 'CLOSED') {
        conditionalLog('log', '🔌 [GLOBAL REALTIME] Channel fermé');
      }
    });

    channelRef.current = channel;

    return () => {
      conditionalLog('log', '🔌 [GLOBAL REALTIME] Désabonnement global');
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, queryClient]);
};

/**
 * Hook pour la synchronisation temps réel d'une conversation spécifique
 * À utiliser UNIQUEMENT dans la vue de conversation active
 * NE PAS utiliser en même temps que useGlobalRealtimeMessages pour la même conversation
 * 
 * @param {string} conversationId - ID de la conversation à surveiller
 */
export const useRealtimeMessages = (conversationId) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!conversationId || !user?.id) {
      return;
    }

    conditionalLog('log', '🔌 [REALTIME] Initialisation subscription pour conversation:', conversationId);

    // Nom de channel stable (sans timestamp pour éviter les doublons)
    const channelName = `messages-${conversationId}`;
    
    // Vérifier si un channel existe déjà et le nettoyer
    if (channelRef.current) {
      conditionalLog('log', '🧹 [REALTIME] Nettoyage du channel existant');
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase.channel(channelName);
    
    // Événement INSERT - Nouveaux messages
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      conditionalLog('log', '💬 [REALTIME] NOUVEAU MESSAGE REÇU:', payload.new.id);
      
      // Mise à jour IMMÉDIATE du cache des messages
      queryClient.setQueryData(QUERY_KEYS.conversationMessages(conversationId), (old) => {
        if (!old) return old;
        
        const newMessage = payload.new;
        
        // Vérifier si le message existe déjà (éviter doublons)
        const exists = old.pages.some(page => 
          page.some(msg => msg.id === newMessage.id)
        );
        
        if (exists) {
          conditionalLog('log', '⚠️ [REALTIME] Message déjà présent, ignoré');
          return old;
        }
        
        // Ajouter le nouveau message à la dernière page
        const newPages = [...old.pages];
        if (newPages.length > 0) {
          newPages[newPages.length - 1] = [...newPages[newPages.length - 1], newMessage];
        } else {
          newPages.push([newMessage]);
        }
        
        conditionalLog('log', '✅ [REALTIME] Message ajouté au cache');
        return {
          ...old,
          pages: newPages
        };
      });

      // Mise à jour IMMÉDIATE du cache des conversations
      queryClient.setQueryData(QUERY_KEYS.conversations(user.id), (old) => {
        if (!old) return old;
        
        return old.map(conv => {
          if (conv.id === conversationId) {
            // Éviter les doublons
            const messageExists = conv.messages?.some(msg => msg.id === payload.new.id);
            if (messageExists) return conv;
            
            // Ajouter le message à la liste des messages de la conversation
            const updatedMessages = [...(conv.messages || []), payload.new];
            
            // Garder seulement les 10 derniers messages
            const lastMessages = updatedMessages.slice(-10);
            
            return {
              ...conv,
              last_message_at: payload.new.created_at,
              updated_at: new Date().toISOString(),
              messages: lastMessages
            };
          }
          return conv;
        });
      });

      conditionalLog('log', '✅ [REALTIME] Cache conversations mis à jour');
    });

    // Événement UPDATE - Messages modifiés (lecture, etc.)
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      conditionalLog('log', '🔄 [REALTIME] MESSAGE MODIFIÉ:', payload.new.id);

      // Mettre à jour le message dans le cache
      queryClient.setQueryData(QUERY_KEYS.conversationMessages(conversationId), (old) => {
        if (!old) return old;
        
        const newPages = old.pages.map(page =>
          page.map(msg => 
            msg.id === payload.new.id ? payload.new : msg
          )
        );
        
        return {
          ...old,
          pages: newPages
        };
      });

      // Mettre à jour aussi dans le cache des conversations
      queryClient.setQueryData(QUERY_KEYS.conversations(user.id), (old) => {
        if (!old) return old;
        
        return old.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: (conv.messages || []).map(msg =>
                msg.id === payload.new.id ? payload.new : msg
              )
            };
          }
          return conv;
        });
      });
    });

    // S'abonner
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        conditionalLog('log', '✅ [REALTIME] Subscription ACTIVE pour conversation:', conversationId);
      } else if (status === 'CHANNEL_ERROR') {
        conditionalLog('error', '❌ [REALTIME] Erreur subscription');
      } else if (status === 'CLOSED') {
        conditionalLog('log', '🔌 [REALTIME] Channel fermé');
      }
    });

    channelRef.current = channel;

    return () => {
      conditionalLog('log', '🔌 [REALTIME] Désabonnement conversation:', conversationId);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, user?.id, queryClient]);
};

// ============================================
// HOOKS COMPOSÉS (NIVEAU EXPERT)
// ============================================

/**
 * Hook composé pour gérer une conversation complète
 * Regroupe messages, realtime et marquage comme lu
 * 
 * @param {string} conversationId - ID de la conversation
 * @returns {Object} Toutes les fonctionnalités de conversation
 * 
 * @example
 * const {
 *   messages,
 *   isLoading,
 *   hasNextPage,
 *   fetchNextPage,
 *   markAsRead,
 *   isMarkingAsRead
 * } = useConversation(conversationId);
 */
export const useConversation = (conversationId) => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error
  } = useConversationMessages(conversationId);

  const { mutate: markAsRead, isPending: isMarkingAsRead } = useMarkMessagesAsRead();

  // Activer le realtime pour cette conversation
  useRealtimeMessages(conversationId);

  // Aplatir les pages de messages et inverser pour affichage chronologique
  const messages = data?.pages.flat().reverse() || [];

  // Fonction helper pour marquer comme lu
  const handleMarkAsRead = () => {
    if (conversationId) {
      markAsRead(conversationId);
    }
  };

  return {
    // Données
    messages,
    error,
    
    // États de chargement
    isLoading,
    isFetchingNextPage,
    isMarkingAsRead,
    
    // Pagination
    hasNextPage,
    fetchNextPage,
    
    // Actions
    markAsRead: handleMarkAsRead,
  };
};

// ============================================
// EXPORTS
// ============================================

// Exporter les clés de cache pour un usage externe si nécessaire
export { QUERY_KEYS };