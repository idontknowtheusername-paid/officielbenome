import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Hook pour la synchronisation temps réel CORRIGÉ
export const useRealtimeMessages = (conversationId) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId || !user) return;

    console.log('🔌 Initialisation subscription temps réel pour conversation:', conversationId);

    const channel = supabase
      .channel(`messages-${conversationId}-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        console.log('💬 Nouveau message reçu en temps réel:', payload.new);

        // Mettre à jour le cache des messages de la conversation
        queryClient.setQueryData(['conversation-messages', conversationId], (old) => {
          if (!old) return old;
          
          const newMessage = payload.new;
          const newPages = [...old.pages];
          
          // Vérifier si le message existe déjà (éviter les doublons)
          const exists = newPages.some(page => 
            page.some(msg => msg.id === newMessage.id)
          );
          
          if (exists) {
            console.log('⚠️ Message déjà présent, ignoré');
            return old;
          }
          
          if (newPages.length > 0) {
            newPages[newPages.length - 1] = [...newPages[newPages.length - 1], newMessage];
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

        console.log('✅ Cache mis à jour en temps réel');
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        console.log('🔄 Message mis à jour en temps réel:', payload.new);

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
      })
      .subscribe((status) => {
        console.log('🔌 Statut subscription temps réel:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscription temps réel active pour conversation:', conversationId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erreur subscription temps réel');
        }
      });

    return () => {
      console.log('🔌 Désabonnement subscription temps réel pour conversation:', conversationId);
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient]);
};

// Hook pour les notifications temps réel globales
export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('🔌 Initialisation notifications temps réel globales');

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        console.log('🔔 Notification temps réel reçue:', payload.new);

        // Rafraîchir les conversations pour mettre à jour les compteurs
        queryClient.invalidateQueries(['conversations']);
        
        // Optionnel : notification toast
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Nouveau message', {
              body: `Vous avez reçu un nouveau message`,
              icon: '/favicon.ico'
            });
          }
        }
      })
      .subscribe((status) => {
        console.log('🔌 Statut notifications globales:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Notifications globales actives');
        }
      });

    return () => {
      console.log('🔌 Désabonnement notifications globales');
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
};

export default useRealtimeMessages;