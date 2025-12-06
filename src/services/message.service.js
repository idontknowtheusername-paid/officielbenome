import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import notificationService from './notification.service';

// ============================================================================
// SERVICE MESSAGERIE CORRIGÉ - SANS RELATIONS COMPLEXES
// ============================================================================

export const messageService = {
  // Récupérer les conversations d'un utilisateur (VERSION CORRIGÉE)
  getUserConversations: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      logger.log('🔍 Récupération des conversations pour l\'utilisateur:', user.id);

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
        logger.error('❌ Erreur récupération conversations:', convError);
        throw convError;
      }

      if (!conversations || conversations.length === 0) {
        logger.log('✅ Aucune conversation trouvée');
        return [];
      }

      // ÉTAPE 2: Collecter tous les IDs pour batch queries (optimisation N+1)
      const userIds = new Set();
      const listingIds = new Set();
      const conversationIds = [];

      conversations.forEach(conv => {
        userIds.add(conv.participant1_id);
        userIds.add(conv.participant2_id);
        if (conv.listing_id) listingIds.add(conv.listing_id);
        conversationIds.push(conv.id);
      });

      logger.log('🔍 Batch queries - Users:', userIds.size, 'Listings:', listingIds.size, 'Conversations:', conversationIds.length);

      // ÉTAPE 3: Exécuter les batch queries (4 requêtes au lieu de 30-40)
      const [usersResult, listingsResult, messagesResult] = await Promise.all([
        // Récupérer tous les utilisateurs en une seule requête
        supabase
          .from('users')
          .select('id, first_name, last_name, profile_image')
          .in('id', Array.from(userIds)),
        
        // Récupérer tous les listings en une seule requête
        listingIds.size > 0 
          ? supabase
              .from('listings')
              .select('id, title, price, images')
              .in('id', Array.from(listingIds))
          : Promise.resolve({ data: [], error: null }),
        
        // Récupérer tous les messages en une seule requête
        supabase
          .from('messages')
          .select('id, content, created_at, is_read, sender_id, message_type, conversation_id')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false })
      ]);

      if (usersResult.error) {
        logger.error('❌ Erreur récupération users:', usersResult.error);
      }
      if (listingsResult.error) {
        logger.error('❌ Erreur récupération listings:', listingsResult.error);
      }
      if (messagesResult.error) {
        logger.error('❌ Erreur récupération messages:', messagesResult.error);
      }

      const users = usersResult.data || [];
      const listings = listingsResult.data || [];
      const allMessages = messagesResult.data || [];

      logger.log('✅ Batch queries réussies - Users:', users.length, 'Listings:', listings.length, 'Messages:', allMessages.length);

      // ÉTAPE 4: Mapper les données (optimisé avec Map pour O(1) lookup)
      const usersMap = new Map(users.map(u => [u.id, u]));
      const listingsMap = new Map(listings.map(l => [l.id, l]));
      
      // Grouper les messages par conversation
      const messagesByConv = new Map();
      allMessages.forEach(msg => {
        if (!messagesByConv.has(msg.conversation_id)) {
          messagesByConv.set(msg.conversation_id, []);
        }
        messagesByConv.get(msg.conversation_id).push(msg);
      });

      // ÉTAPE 5: Enrichir les conversations (une seule boucle, pas de requêtes)
      const enrichedConversations = conversations.map(conv => {
        const participant1 = usersMap.get(conv.participant1_id) || {
          id: conv.participant1_id,
          first_name: 'Utilisateur',
          last_name: 'Inconnu',
          profile_image: null
        };

        const participant2 = usersMap.get(conv.participant2_id) || {
          id: conv.participant2_id,
          first_name: 'Utilisateur',
          last_name: 'Inconnu',
          profile_image: null
        };

        const listing = conv.listing_id ? listingsMap.get(conv.listing_id) : null;
        const messages = (messagesByConv.get(conv.id) || []).slice(0, 10); // Limiter à 10 derniers messages

        return {
          ...conv,
          participant1,
          participant2,
          listing,
          messages
        };
      });

      logger.log('✅ Conversations enrichies récupérées:', enrichedConversations.length);
      return enrichedConversations;
    } catch (error) {
      logger.error('❌ Erreur dans getUserConversations:', error);
      throw error;
    }
  },

  // Récupérer les messages d'une conversation avec pagination
  getConversationMessages: async (conversationId, options = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { from = 0, to = 49 } = options; // Par défaut, 50 messages

      logger.log('🔍 Récupération des messages pour la conversation:', conversationId, 'Range:', from, '-', to);

      let query = supabase
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
        .order('created_at', { ascending: false }); // Plus récents en premier pour pagination

      // Appliquer la pagination si spécifiée
      if (from !== undefined && to !== undefined) {
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('❌ Erreur récupération messages:', error);
        throw error;
      }

      logger.log('✅ Messages récupérés:', data?.length || 0, 'sur range', from, '-', to);
      return data || [];
    } catch (error) {
      logger.error('❌ Erreur dans getConversationMessages:', error);
      throw error;
    }
  },

  // Envoyer un message
  sendMessage: async (conversationId, content, messageType = 'text') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      logger.log('🔍 Envoi de message:', { conversationId, content, messageType });

      // Récupérer la conversation pour obtenir le receiver_id
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('participant1_id, participant2_id')
        .eq('id', conversationId)
        .single();

      if (convError) {
        logger.error('❌ Erreur récupération conversation:', convError);
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
        logger.error('❌ Erreur envoi message:', error);
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

      logger.log('✅ Message envoyé:', data.id);

      // ============================================================================
      // NOTIFICATION: Créer notification pour le destinataire
      // ============================================================================
      try {
        // Récupérer les informations de l'expéditeur
        const { data: senderData } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        const senderName = senderData 
          ? `${senderData.first_name} ${senderData.last_name}`.trim() 
          : 'Un utilisateur';

        // Créer la notification pour le destinataire
        await notificationService.createNewMessageNotification(
          user.id,        // senderId
          receiverId,     // receiverId
          senderName,     // senderName
          conversationId  // conversationId
        );

        logger.log('✅ Notification de nouveau message envoyée au destinataire');
      } catch (notifError) {
        // Ne pas bloquer l'envoi du message si la notification échoue
        logger.error('⚠️ Erreur création notification (message envoyé quand même):', notifError);
      }

      return data;
    } catch (error) {
      logger.error('❌ Erreur dans sendMessage:', error);
      throw error;
    }
  },

  // Marquer les messages comme lus
  markMessagesAsRead: async (conversationId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      logger.log('🔍 Marquage des messages comme lus pour conversation:', conversationId);

      // CORRECTION: Marquer comme lus uniquement les messages REÇUS (receiver_id = user.id)
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user.id)
        .eq('is_read', false)
        .select('id');

      if (error) {
        logger.error('❌ Erreur marquage messages:', error);
        throw error;
      }

      const markedCount = data?.length || 0;
      logger.log(`✅ ${markedCount} message(s) marqué(s) comme lu(s) - Badge "Nouveau" va disparaître`);
      return true;
    } catch (error) {
      logger.error('❌ Erreur dans markMessagesAsRead:', error);
      throw error;
    }
  },

  // Créer une nouvelle conversation
  createConversation: async (participantId, listingId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      logger.log('🔍 Création de conversation:', { participantId, listingId });

      // Vérifier si une conversation existe déjà
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${participantId}),and(participant1_id.eq.${participantId},participant2_id.eq.${user.id})`)
        .single();

      if (existingConv) {
        logger.log('✅ Conversation existante trouvée:', existingConv.id);
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
        logger.error('❌ Erreur création conversation:', error);
        throw error;
      }

      logger.log('✅ Conversation créée:', data.id);
      return data;
    } catch (error) {
      logger.error('❌ Erreur dans createConversation:', error);
      throw error;
    }
  },

  // Supprimer une conversation
  deleteConversation: async (conversationId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      logger.log('🔍 Suppression de conversation:', conversationId);

      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`);

      if (error) {
        logger.error('❌ Erreur suppression conversation:', error);
        throw error;
      }

      logger.log('✅ Conversation supprimée');
      return true;
    } catch (error) {
      logger.error('❌ Erreur dans deleteConversation:', error);
      throw error;
    }
  },

  // Supprimer un message
  deleteMessage: async (messageId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      logger.log('🔍 Suppression de message:', messageId);

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        logger.error('❌ Erreur suppression message:', error);
        throw error;
      }

      logger.log('✅ Message supprimé');
      return true;
    } catch (error) {
      logger.error('❌ Erreur dans deleteMessage:', error);
      throw error;
    }
  },

  // Basculer le statut favori d'une conversation
  toggleConversationStar: async (conversationId, starred) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      logger.log('🔍 Basculer favori conversation:', conversationId, 'vers', starred);

      const { error } = await supabase
        .from('conversations')
        .update({ 
          starred: starred,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`);

      if (error) {
        logger.error('❌ Erreur basculer favori:', error);
        throw error;
      }

      logger.log('✅ Statut favori mis à jour:', starred ? 'Ajouté' : 'Retiré');
      return true;
    } catch (error) {
      logger.error('❌ Erreur dans toggleConversationStar:', error);
      throw error;
    }
  },

  // Archiver/Désarchiver une conversation
  archiveConversation: async (conversationId, archived = true) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      logger.log('🔍 Archiver conversation:', conversationId, 'vers', archived);

      const { error } = await supabase
        .from('conversations')
        .update({ 
          is_archived: archived,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`);

      if (error) {
        logger.error('❌ Erreur archiver conversation:', error);
        throw error;
      }

      logger.log('✅ Conversation archivée:', archived ? 'Oui' : 'Non');
      return true;
    } catch (error) {
      logger.error('❌ Erreur dans archiveConversation:', error);
      throw error;
    }
  }
};

export default messageService;