import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Hook de temps réel COMPLÈTEMENT REFAIT
export const useRealtimeMessages = (conversationId) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const channelRef = useRef(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!conversationId || !user) {
      console.log('🔌 Pas de conversation ou utilisateur, pas de subscription');
      return;
    }

    // Éviter les subscriptions multiples
    if (isSubscribedRef.current) {
      console.log('🔌 Déjà abonné, évitement de la double subscription');
      return;
    }

    console.log('🔌 Initialisation subscription temps réel pour conversation:', conversationId);

    const channelName = `messages-${conversationId}-${user.id}-${Date.now()}`;
    const channel = supabase.channel(channelName);
    
    // Événement INSERT - Nouveaux messages
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      console.log('💬 NOUVEAU MESSAGE REÇU:', payload.new);
      
      // Mettre à jour le cache des messages de la conversation
      queryClient.setQueryData(['conversation-messages', conversationId], (old) => {
        if (!old) return old;
        
        const newMessage = payload.new;
        
        // Vérifier si le message existe déjà
        const exists = old.pages.some(page => 
          page.some(msg => msg.id === newMessage.id)
        );
        
        if (exists) {
          console.log('⚠️ Message déjà présent, ignoré');
          return old;
        }
        
        // Ajouter le nouveau message à la dernière page
        const newPages = [...old.pages];
        if (newPages.length > 0) {
          newPages[newPages.length - 1] = [...newPages[newPages.length - 1], newMessage];
        } else {
          newPages.push([newMessage]);
        }
        
        return {
          ...old,
          pages: newPages
        };
      });

      // Mettre à jour le cache des conversations
      queryClient.setQueryData(['conversations'], (old) => {
        if (!old) return old;
        
        return old.map(conv => 
          conv.id === conversationId 
            ? {
                ...conv,
                last_message_at: payload.new.created_at,
                updated_at: new Date().toISOString(),
                messages: [...(conv.messages || []), payload.new]
              }
            : conv
        );
      });

      console.log('✅ Cache mis à jour avec le nouveau message');
    });

    // Événement UPDATE - Messages modifiés (lecture, etc.)
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      console.log('🔄 MESSAGE MODIFIÉ:', payload.new);

      // Mettre à jour le message dans le cache
      queryClient.setQueryData(['conversation-messages', conversationId], (old) => {
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
    });

    // S'abonner avec gestion d'état
    channel.subscribe((status) => {
      console.log('🔌 Statut subscription:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscription temps réel ACTIVE pour conversation:', conversationId);
        isSubscribedRef.current = true;
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erreur subscription temps réel');
        isSubscribedRef.current = false;
      } else if (status === 'TIMED_OUT') {
        console.warn('⏰ Timeout subscription temps réel');
        isSubscribedRef.current = false;
      } else if (status === 'CLOSED') {
        console.log('🔌 Subscription fermée');
        isSubscribedRef.current = false;
      }
    });

    channelRef.current = channel;

    return () => {
      console.log('🔌 Désabonnement subscription temps réel pour conversation:', conversationId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        isSubscribedRef.current = false;
      }
    };
  }, [conversationId, user, queryClient]);
};

// Hook pour les notifications globales (sans conflit)
export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    console.log('🔌 Initialisation notifications globales');

    const channelName = `notifications-${user.id}-${Date.now()}`;
    const channel = supabase.channel(channelName);
    
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${user.id}`
    }, (payload) => {
      console.log('🔔 NOTIFICATION GLOBALE REÇUE:', payload.new);
      
      // Rafraîchir les conversations pour mettre à jour les compteurs
      queryClient.invalidateQueries(['conversations']);
    });

    channel.subscribe((status) => {
      console.log('🔌 Statut notifications globales:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Notifications globales ACTIVES');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erreur notifications globales');
      }
    });

    channelRef.current = channel;

    return () => {
      console.log('🔌 Désabonnement notifications globales');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, queryClient]);
};

export default useRealtimeMessages;