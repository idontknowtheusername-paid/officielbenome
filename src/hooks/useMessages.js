import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { messageService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Hook pour les conversations
export const useConversations = (filters = {}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id, filters],
    queryFn: async () => {
      try {
        console.log('🔍 Hook useConversations - Début de la récupération');
        const result = await messageService.getUserConversations();
        console.log('🔍 Hook useConversations - Récupération réussie:', result?.length || 0);
        return result;
      } catch (error) {
        console.error('❌ Hook useConversations - Erreur lors de la récupération:', error);
        
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
    staleTime: 30000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
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

// Hook pour les messages d'une conversation avec pagination infinie
export const useConversationMessages = (conversationId, pageSize = 50) => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: ({ pageParam = 0 }) => 
      messageService.getConversationMessages(conversationId, {
        from: pageParam * pageSize,
        to: (pageParam + 1) * pageSize - 1
      }),
    enabled: !!conversationId && !!user,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length : undefined;
    },
    staleTime: 10000, // 10 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook pour envoyer un message avec optimistic updates
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ conversationId, content, messageType = 'text' }) =>
      messageService.sendMessage(conversationId, content, messageType),
    
    // Optimistic update
    onMutate: async ({ conversationId, content, messageType }) => {
      // Annuler les requetes en cours
      await queryClient.cancelQueries({ queryKey: ['conversation-messages', conversationId] });
      await queryClient.cancelQueries({ queryKey: ['conversations'] });

      // Snapshot de l'etat precedent
      const previousMessages = queryClient.getQueryData(['conversation-messages', conversationId]);
      const previousConversations = queryClient.getQueryData(['conversations']);

      // Optimistic update pour les messages
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
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

      queryClient.setQueryData(['conversation-messages', conversationId], (old) => {
        if (!old) return { pages: [[optimisticMessage]], pageParams: [0] };
        
        const newPages = [...old.pages];
        if (newPages.length > 0) {
          newPages[newPages.length - 1] = [...newPages[newPages.length - 1], optimisticMessage];
        }
        
        return {
          ...old,
          pages: newPages
        };
      });

      // Optimistic update pour les conversations
      queryClient.setQueryData(['conversations'], (old) => {
        if (!old) return old;
        
        return old.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                last_message_at: new Date().toISOString(),
                messages: [...(conv.messages || []), optimisticMessage]
              }
            : conv
        );
      });

      return { previousMessages, previousConversations };
    },

    // En cas d'erreur, restaurer l'etat precedent
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['conversation-messages', variables.conversationId], context.previousMessages);
      }
      if (context?.previousConversations) {
        queryClient.setQueryData(['conversations'], context.previousConversations);
      }
    },

    // Succes - mise à jour optimisée du cache (sans invalidation excessive)
    onSettled: (data, error, variables) => {
      if (error) {
        console.log('❌ Erreur lors de l\'envoi, invalidation du cache...');
        // En cas d'erreur, invalider pour recharger
        queryClient.invalidateQueries({ queryKey: ['conversation-messages', variables.conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        return;
      }

      console.log('✅ Message envoyé, mise à jour optimisée du cache...');
      
      // Mise à jour optimiste du cache des conversations (sans invalidation)
      queryClient.setQueryData(['conversations'], (old) => {
        if (!old) return old;
        
        return old.map(conv => 
          conv.id === variables.conversationId 
            ? {
                ...conv,
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            : conv
        );
      });

      // Mise à jour optimiste du cache des messages
      queryClient.setQueryData(['conversation-messages', variables.conversationId], (old) => {
        if (!old) return old;
        
        const newPages = [...old.pages];
        if (newPages.length > 0) {
          newPages[newPages.length - 1] = [...newPages[newPages.length - 1], data];
        }
        
        return {
          ...old,
          pages: newPages
        };
      });
    },
  });
};

// Hook pour marquer les messages comme lus
export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (conversationId) => messageService.markMessagesAsRead(conversationId),
    
    onSuccess: (data, conversationId) => {
      // Mettre a jour les messages dans le cache
      queryClient.setQueryData(['conversation-messages', conversationId], (old) => {
        if (!old) return old;
        
        const newPages = old.pages.map(page =>
          page.map(message => ({
            ...message,
            is_read: message.sender_id !== user?.id ? true : message.is_read
          }))
        );
        
        return {
          ...old,
          pages: newPages
        };
      });

      // Mettre a jour les conversations
      queryClient.setQueryData(['conversations'], (old) => {
        if (!old) return old;
        
        return old.map(conv => 
          conv.id === conversationId 
            ? {
                ...conv,
                messages: conv.messages?.map(msg => ({
                  ...msg,
                  is_read: msg.sender_id !== user?.id ? true : msg.is_read
                }))
              }
            : conv
        );
      });
    },
  });
};

// Hook pour creer une nouvelle conversation
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ participantId, listingId }) => 
      messageService.createConversation(participantId, listingId),
    
    onSuccess: (newConversation) => {
      // Ajouter la nouvelle conversation au cache
      queryClient.setQueryData(['conversations'], (old) => {
        if (!old) return [newConversation];
        return [newConversation, ...old];
      });
    },
  });
};

// Hook pour supprimer une conversation
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId) => messageService.deleteConversation(conversationId),
    
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      
      const previousConversations = queryClient.getQueryData(['conversations']);
      
      // Optimistic update
      queryClient.setQueryData(['conversations'], (old) => {
        if (!old) return old;
        return old.filter(conv => conv.id !== conversationId);
      });

      return { previousConversations };
    },

    onError: (err, conversationId, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(['conversations'], context.previousConversations);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// Hook pour supprimer un message individuel
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId) => messageService.deleteMessage(messageId),
    
    onMutate: async (messageId) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      
      const previousConversations = queryClient.getQueryData(['conversations']);

      // Optimistic update - supprimer le message des conversations
      queryClient.setQueryData(['conversations'], (old) => {
        if (!old) return old;
        
        return old.map(conv => ({
          ...conv,
          messages: conv.messages?.filter(msg => msg.id !== messageId) || []
        }));
      });

      return { previousConversations };
    },

    onError: (err, messageId, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(['conversations'], context.previousConversations);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// Hook pour rechercher des conversations
export const useSearchConversations = (searchTerm) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations-search', searchTerm],
    queryFn: () => messageService.searchConversations(searchTerm),
    enabled: !!searchTerm && !!user,
    staleTime: 60000, // 1 minute
  });
};

// Hook pour les statistiques des messages
export const useMessageStats = () => {
  const { user } = useAuth();
  const { data: conversations } = useConversations();

  return useQuery({
    queryKey: ['message-stats', user?.id],
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

// Hook pour la synchronisation temps reel
export const useRealtimeMessages = (conversationId) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        // Mettre a jour le cache avec le nouveau message
        queryClient.setQueryData(['conversation-messages', conversationId], (old) => {
          if (!old) return old;
          
          const newMessage = payload.new;
          const newPages = [...old.pages];
          
          if (newPages.length > 0) {
            newPages[newPages.length - 1] = [...newPages[newPages.length - 1], newMessage];
          }
          
          return {
            ...old,
            pages: newPages
          };
        });

        // Mettre a jour les conversations
        queryClient.setQueryData(['conversations'], (old) => {
          if (!old) return old;
          
          return old.map(conv => 
            conv.id === conversationId 
              ? {
                  ...conv,
                  last_message_at: newMessage.created_at,
                  messages: [...(conv.messages || []), newMessage]
                }
              : conv
          );
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient]);
}; 