import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { messageService } from '@/services/message.service';

export const useRealTimeMessaging = (conversationId = null) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const refreshIntervalRef = useRef(null);
  const lastMessageRef = useRef(null);

  // Fonction pour actualiser les conversations
  const refreshConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Actualisation des conversations...');
      
      const updatedConversations = await messageService.refreshConversations();
      setConversations(updatedConversations);
      
      console.log('✅ Conversations actualisées:', updatedConversations.length);
    } catch (err) {
      console.error('❌ Erreur lors de l\'actualisation des conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour synchroniser une conversation spécifique
  const syncConversation = useCallback(async (convId) => {
    if (!convId) return;
    
    try {
      console.log('🔄 Synchronisation de la conversation:', convId);
      
      const updatedMessages = await messageService.syncConversation(convId);
      setMessages(updatedMessages);
      
      // Mettre à jour aussi la conversation dans la liste
      setConversations(prev => prev.map(conv => 
        conv.id === convId 
          ? { ...conv, messages: updatedMessages }
          : conv
      ));
      
      console.log('✅ Conversation synchronisée:', updatedMessages.length, 'messages');
    } catch (err) {
      console.error('❌ Erreur lors de la synchronisation:', err);
      setError(err.message);
    }
  }, []);

  // Fonction pour envoyer un message avec synchronisation automatique
  const sendMessage = useCallback(async (content, messageType = 'text') => {
    if (!conversationId) {
      throw new Error('Aucune conversation sélectionnée');
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 Envoi du message...');
      const newMessage = await messageService.sendMessage(conversationId, content, messageType);
      
      // Ajouter immédiatement le message à l'interface (optimistic update)
      setMessages(prev => [...prev, newMessage]);
      
      // Actualiser automatiquement les conversations après envoi
      setTimeout(() => {
        refreshConversations();
        syncConversation(conversationId);
      }, 500);
      
      console.log('✅ Message envoyé et interface mise à jour');
      return newMessage;
    } catch (err) {
      console.error('❌ Erreur lors de l\'envoi du message:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversationId, refreshConversations, syncConversation]);

  // Configuration de l'actualisation automatique
  useEffect(() => {
    // Actualiser toutes les 10 secondes
    refreshIntervalRef.current = setInterval(() => {
      console.log('⏰ Actualisation automatique des conversations...');
      refreshConversations();
      
      if (conversationId) {
        syncConversation(conversationId);
      }
    }, 10000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [conversationId, refreshConversations, syncConversation]);

  // Initialisation au montage
  useEffect(() => {
    refreshConversations();
    
    if (conversationId) {
      syncConversation(conversationId);
    }
  }, [conversationId, refreshConversations, syncConversation]);

  // Écouter les changements en temps réel avec Supabase
  useEffect(() => {
    if (!conversationId) return;

    console.log('🔌 Configuration de l\'écoute en temps réel pour la conversation:', conversationId);

    // Écouter les nouveaux messages
    const messagesSubscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        console.log('🆕 Nouveau message reçu en temps réel:', payload.new);
        
        // Mettre à jour immédiatement l'interface
        setMessages(prev => [...prev, payload.new]);
        
        // Actualiser les conversations
        refreshConversations();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        console.log('🔄 Message mis à jour en temps réel:', payload.new);
        
        // Mettre à jour le message dans l'interface
        setMessages(prev => prev.map(msg => 
          msg.id === payload.new.id ? payload.new : msg
        ));
      })
      .subscribe();

    return () => {
      console.log('🔌 Désabonnement de l\'écoute en temps réel');
      supabase.removeChannel(messagesSubscription);
    };
  }, [conversationId, refreshConversations]);

  // Fonction pour forcer une actualisation manuelle
  const forceRefresh = useCallback(() => {
    console.log('🔄 Actualisation manuelle forcée...');
    refreshConversations();
    
    if (conversationId) {
      syncConversation(conversationId);
    }
  }, [conversationId, refreshConversations, syncConversation]);

  return {
    conversations,
    messages,
    loading,
    error,
    sendMessage,
    refreshConversations,
    syncConversation,
    forceRefresh
  };
};
