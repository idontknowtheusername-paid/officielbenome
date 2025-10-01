import { supabase } from '@/lib/supabase';

// ============================================================================
// SERVICE MESSAGERIE CORRIGÉ - SANS RELATIONS COMPLEXES
// ============================================================================

export const messageService = {
  // Récupérer les conversations d'un utilisateur (VERSION CORRIGÉE)
  getUserConversations: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      console.log('🔍 Récupération des conversations pour l\'utilisateur:', user.id);

      // ÉTAPE 1: Récupérer les conversations de base
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          listing_id,
          participant1_id,
          participant2_id,
          is_active,
          is_archived,
          starred,
          last_message_at,
          created_at,
          updated_at
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsLast: true })
        .order('created_at', { ascending: false });

      if (convError) {
        console.error('❌ Erreur récupération conversations:', convError);
        throw convError;
      }

      if (!conversations || conversations.length === 0) {
        console.log('✅ Aucune conversation trouvée');
        return [];
      }

      // ÉTAPE 2: Enrichir chaque conversation
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          try {
            // Récupérer les données des participants
            const [participant1, participant2] = await Promise.all([
              supabase.from('users').select('id, first_name, last_name, profile_image').eq('id', conv.participant1_id).single(),
              supabase.from('users').select('id, first_name, last_name, profile_image').eq('id', conv.participant2_id).single()
            ]);

            // Récupérer les données de l'annonce si elle existe
            let listing = null;
            if (conv.listing_id) {
              const { data: listingData } = await supabase
                .from('listings')
                .select('id, title, price, images')
                .eq('id', conv.listing_id)
                .single();
              listing = listingData;
            }

            // Récupérer les derniers messages
            const { data: messages } = await supabase
              .from('messages')
              .select('id, content, created_at, is_read, sender_id, message_type')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(10);

            return {
              ...conv,
              participant1: participant1.data,
              participant2: participant2.data,
              listing: listing,
              messages: messages || []
            };
          } catch (error) {
            console.error('❌ Erreur enrichissement conversation:', conv.id, error);
            // Retourner la conversation de base en cas d'erreur
            return {
              ...conv,
              participant1: { id: conv.participant1_id, first_name: 'Utilisateur', last_name: 'Inconnu' },
              participant2: { id: conv.participant2_id, first_name: 'Utilisateur', last_name: 'Inconnu' },
              listing: null,
              messages: []
            };
          }
        })
      );

      console.log('✅ Conversations enrichies récupérées:', enrichedConversations.length);
      return enrichedConversations;
    } catch (error) {
      console.error('❌ Erreur dans getUserConversations:', error);
      throw error;
    }
  },

  // Récupérer les messages d'une conversation
  getConversationMessages: async (conversationId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      console.log('🔍 Récupération des messages pour la conversation:', conversationId);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          is_read,
          sender_id,
          receiver_id,
          message_type
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erreur récupération messages:', error);
        throw error;
      }

      console.log('✅ Messages récupérés:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erreur dans getConversationMessages:', error);
      throw error;
    }
  },

  // Envoyer un message
  sendMessage: async (conversationId, content, messageType = 'text') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      console.log('🔍 Envoi de message:', { conversationId, content, messageType });

      // Récupérer la conversation pour obtenir le receiver_id
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('participant1_id, participant2_id')
        .eq('id', conversationId)
        .single();

      if (convError) {
        console.error('❌ Erreur récupération conversation:', convError);
        throw convError;
      }

      const receiverId = conversation.participant1_id === user.id 
        ? conversation.participant2_id 
        : conversation.participant1_id;

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: receiverId,
          content: content,
          message_type: messageType,
          is_read: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur envoi message:', error);
        throw error;
      }

      // Mettre à jour last_message_at de la conversation
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      console.log('✅ Message envoyé:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Erreur dans sendMessage:', error);
      throw error;
    }
  },

  // Marquer les messages comme lus
  markMessagesAsRead: async (conversationId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      console.log('🔍 Marquage des messages comme lus:', conversationId);

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);

      if (error) {
        console.error('❌ Erreur marquage messages:', error);
        throw error;
      }

      console.log('✅ Messages marqués comme lus');
      return true;
    } catch (error) {
      console.error('❌ Erreur dans markMessagesAsRead:', error);
      throw error;
    }
  },

  // Créer une nouvelle conversation
  createConversation: async (participantId, listingId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      console.log('🔍 Création de conversation:', { participantId, listingId });

      // Vérifier si une conversation existe déjà
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${participantId}),and(participant1_id.eq.${participantId},participant2_id.eq.${user.id})`)
        .single();

      if (existingConv) {
        console.log('✅ Conversation existante trouvée:', existingConv.id);
        return existingConv;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          participant1_id: user.id,
          participant2_id: participantId,
          listing_id: listingId,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création conversation:', error);
        throw error;
      }

      console.log('✅ Conversation créée:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Erreur dans createConversation:', error);
      throw error;
    }
  },

  // Supprimer une conversation
  deleteConversation: async (conversationId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      console.log('🔍 Suppression de conversation:', conversationId);

      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`);

      if (error) {
        console.error('❌ Erreur suppression conversation:', error);
        throw error;
      }

      console.log('✅ Conversation supprimée');
      return true;
    } catch (error) {
      console.error('❌ Erreur dans deleteConversation:', error);
      throw error;
    }
  },

  // Supprimer un message
  deleteMessage: async (messageId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      console.log('🔍 Suppression de message:', messageId);

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ Erreur suppression message:', error);
        throw error;
      }

      console.log('✅ Message supprimé');
      return true;
    } catch (error) {
      console.error('❌ Erreur dans deleteMessage:', error);
      throw error;
    }
  }
};

export default messageService;