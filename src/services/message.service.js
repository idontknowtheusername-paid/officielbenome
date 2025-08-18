import { supabase } from '@/lib/supabase';

// ============================================================================
// SERVICE MESSAGERIE
// ============================================================================

// Fonction pour ajouter le message de bienvenue
const addWelcomeMessage = async (userId) => {
  const welcomeMessage = {
    content: `🤖 Bienvenue sur MaxiMarket !

Votre marketplace de confiance pour l'Afrique de l'Ouest.

✨ Découvrez nos fonctionnalités :
• 🏠 Immobilier : Achetez, vendez, louez
• 🚗 Automobile : Véhicules neufs et d'occasion
• 🛠️ Services : Trouvez des professionnels
• 🛍️ Marketplace : Tout ce dont vous avez besoin

🔒 Sécurité garantie avec nos partenaires vérifiés
💬 Support 24/7 disponible

Besoin d'aide ? Je suis là pour vous accompagner !`,
    message_type: 'system',
    sender_id: '00000000-0000-0000-0000-000000000000', // ID système pour l'assistant
    receiver_id: userId,
    is_read: false,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([welcomeMessage])
      .select()
      .single();

    if (error) {
      console.error('Erreur ajout message de bienvenue:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erreur ajout message de bienvenue:', error);
    return null;
  }
};

export const messageService = {
  // Recuperer les conversations d'un utilisateur
  getUserConversations: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      console.log('🔍 Récupération des conversations pour l\'utilisateur:', user.id);

      // D'abord, recuperer les conversations existantes avec une requête simplifiée
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          listing_id,
          participant1_id,
          participant2_id,
          is_active,
          last_message_at,
          created_at,
          updated_at
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (convError) {
        console.error('Erreur récupération conversations:', convError);
        throw convError;
      }

      console.log('🔍 Conversations trouvées:', conversations?.length || 0);

      // Si aucune conversation, créer un message de bienvenue et retourner un message système
      if (!conversations || conversations.length === 0) {
        console.log('Aucune conversation trouvée, ajout du message de bienvenue...');
        
        // Vérifier si l'utilisateur a déjà reçu le message de bienvenue
        const { data: existingWelcome, error: welcomeError } = await supabase
          .from('messages')
          .select('id')
          .eq('receiver_id', user.id)
          .eq('sender_id', '00000000-0000-0000-0000-000000000000')
          .eq('message_type', 'system')
          .limit(1);

        if (welcomeError) {
          console.error('Erreur vérification message de bienvenue:', welcomeError);
        }

        // Si pas de message de bienvenue, l'ajouter
        if (!existingWelcome || existingWelcome.length === 0) {
          console.log('Ajout du message de bienvenue pour l\'utilisateur:', user.id);
          await addWelcomeMessage(user.id);
        } else {
          console.log('Message de bienvenue déjà existant pour l\'utilisateur:', user.id);
        }

        // Retourner un message système pour l'affichage
        return [{
          id: 'welcome-message',
          type: 'system',
          content: `🤖 Bienvenue sur MaxiMarket !

Votre marketplace de confiance pour l'Afrique de l'Ouest.

✨ Découvrez nos fonctionnalités :
• 🏠 Immobilier : Achetez, vendez, louez
• 🚗 Automobile : Véhicules neufs et d'occasion
• 🛠️ Services : Trouvez des professionnels
• 🛍️ Marketplace : Tout ce dont vous avez besoin

🔒 Sécurité garantie avec nos partenaires vérifiés
💬 Support 24/7 disponible

Besoin d'aide ? Je suis là pour vous accompagner !`,
          sender: {
            id: '00000000-0000-0000-0000-000000000000',
            first_name: 'Assistant',
            last_name: 'MaxiMarket',
            avatar_url: null
          },
          created_at: new Date().toISOString(),
          is_system: true
        }];
      }

      // Pour chaque conversation, recuperer les détails des participants et du listing
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conversation) => {
          try {
            // Récupérer les détails du listing si il existe
            let listingDetails = null;
            if (conversation.listing_id) {
              const { data: listing, error: listingError } = await supabase
                .from('listings')
                .select('id, title, price, images')
                .eq('id', conversation.listing_id)
                .single();
              
              if (!listingError && listing) {
                listingDetails = listing;
              }
            }

            // Récupérer les détails des participants
            const participant1Id = conversation.participant1_id;
            const participant2Id = conversation.participant2_id;
            
            let participant1 = null;
            let participant2 = null;

            if (participant1Id) {
              const { data: user1, error: user1Error } = await supabase
                .from('users')
                .select('id, first_name, last_name, avatar_url')
                .eq('id', participant1Id)
                .single();
              
              if (!user1Error && user1) {
                participant1 = user1;
              }
            }

            if (participant2Id) {
              const { data: user2, error: user2Error } = await supabase
                .from('users')
                .select('id, first_name, last_name, avatar_url')
                .eq('id', participant2Id)
                .single();
              
              if (!user2Error && user2) {
                participant2 = user2;
              }
            }

            // Récupérer les messages de la conversation
            const { data: messages, error: msgError } = await supabase
              .from('messages')
              .select(`
                id,
                content,
                created_at,
                is_read,
                sender_id,
                conversation_id
              `)
              .eq('conversation_id', conversation.id)
              .order('created_at', { ascending: true });

            if (msgError) {
              console.error('Erreur récupération messages:', msgError);
              return { 
                ...conversation, 
                messages: [],
                listing: listingDetails,
                participant1,
                participant2
              };
            }

            return { 
              ...conversation, 
              messages: messages || [],
              listing: listingDetails,
              participant1,
              participant2
            };
          } catch (error) {
            console.error('Erreur lors de la récupération des détails de la conversation:', error);
            return { ...conversation, messages: [], listing: null, participant1: null, participant2: null };
          }
        })
      );

      return conversationsWithDetails;
    } catch (error) {
      console.error('Erreur dans getUserConversations:', error);
      throw error;
    }
  },

  // Recuperer les messages d'une conversation
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
          conversation_id,
          message_type
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur récupération messages:', error);
        throw error;
      }

      // Récupérer les détails des expéditeurs et destinataires
      const messagesWithUsers = await Promise.all(
        (data || []).map(async (message) => {
          try {
            let sender = null;
            let receiver = null;

            if (message.sender_id) {
              const { data: senderData, error: senderError } = await supabase
                .from('users')
                .select('id, first_name, last_name, avatar_url')
                .eq('id', message.sender_id)
                .single();
              
              if (!senderError && senderData) {
                sender = senderData;
              }
            }

            if (message.receiver_id) {
              const { data: receiverData, error: receiverError } = await supabase
                .from('users')
                .select('id, first_name, last_name, avatar_url')
                .eq('id', message.receiver_id)
                .single();
              
              if (!receiverError && receiverData) {
                receiver = receiverData;
              }
            }

            return {
              ...message,
              sender,
              receiver
            };
          } catch (error) {
            console.error('Erreur lors de la récupération des détails utilisateur:', error);
            return message;
          }
        })
      );

      return messagesWithUsers;
    } catch (error) {
      console.error('Erreur dans getConversationMessages:', error);
      throw error;
    }
  },

  // Envoyer un message
  sendMessage: async (conversationId, content, messageType = 'text') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    // Recuperer la conversation pour determiner le destinataire
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    const receiverId = conversation.participant1_id === user.id 
      ? conversation.participant2_id 
      : conversation.participant1_id;

    // Inserer le message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert([{
        sender_id: user.id,
        receiver_id: receiverId,
        conversation_id: conversationId,
        content,
        message_type: messageType
      }])
      .select()
      .single();

    if (msgError) throw msgError;

    // Mettre a jour la conversation
    await supabase
      .from('conversations')
      .update({ 
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    return message;
  },

  // Creer une nouvelle conversation
  createConversation: async (participantId, listingId = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    // Verifier si une conversation existe deja
    const { data: existingConv, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${participantId}),and(participant1_id.eq.${participantId},participant2_id.eq.${user.id})`)
      .eq('listing_id', listingId)
      .single();

    if (existingConv) {
      return existingConv;
    }

    // Creer une nouvelle conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        participant1_id: user.id,
        participant2_id: participantId,
        listing_id: listingId,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Marquer les messages comme lus
  markMessagesAsRead: async (conversationId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { error } = await supabase
      .from('messages')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
    return true;
  },

  // Supprimer une conversation
  deleteConversation: async (conversationId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    // Verifier que l'utilisateur fait partie de la conversation
    const { data: conversation, error: checkError } = await supabase
      .from('conversations')
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .single();

    if (checkError) throw checkError;

    if (conversation.participant1_id !== user.id && conversation.participant2_id !== user.id) {
      throw new Error('Non autorisé');
    }

    // Supprimer la conversation et tous les messages
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) throw deleteError;
    return true;
  },

  // Rechercher des conversations
  searchConversations: async (searchTerm) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      console.log('🔍 Recherche de conversations avec le terme:', searchTerm);

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          listing_id,
          participant1_id,
          participant2_id,
          is_active,
          last_message_at,
          created_at,
          updated_at
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Erreur recherche conversations:', error);
        throw error;
      }

      // Filtrer et enrichir les conversations avec les détails
      const enrichedConversations = await Promise.all(
        (data || []).map(async (conversation) => {
          try {
            let listing = null;
            let participant1 = null;
            let participant2 = null;

            // Récupérer les détails du listing si il existe
            if (conversation.listing_id) {
              const { data: listingData, error: listingError } = await supabase
                .from('listings')
                .select('id, title')
                .eq('id', conversation.listing_id)
                .single();
              
              if (!listingError && listingData) {
                listing = listingData;
              }
            }

            // Récupérer les détails des participants
            if (conversation.participant1_id) {
              const { data: user1, error: user1Error } = await supabase
                .from('users')
                .select('id, first_name, last_name, avatar_url')
                .eq('id', conversation.participant1_id)
                .single();
              
              if (!user1Error && user1) {
                participant1 = user1;
              }
            }

            if (conversation.participant2_id) {
              const { data: user2, error: user2Error } = await supabase
                .from('users')
                .select('id, first_name, last_name, avatar_url')
                .eq('id', conversation.participant2_id)
                .single();
              
              if (!user2Error && user2) {
                participant2 = user2;
              }
            }

            return {
              ...conversation,
              listing,
              participant1,
              participant2
            };
          } catch (error) {
            console.error('Erreur lors de l\'enrichissement de la conversation:', error);
            return conversation;
          }
        })
      );

      // Filtrer par le terme de recherche
      return enrichedConversations.filter(conv => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        
        // Rechercher dans le titre du listing
        if (conv.listing?.title?.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Rechercher dans les noms des participants
        if (conv.participant1?.first_name?.toLowerCase().includes(searchLower) ||
            conv.participant1?.last_name?.toLowerCase().includes(searchLower) ||
            conv.participant2?.first_name?.toLowerCase().includes(searchLower) ||
            conv.participant2?.last_name?.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        return false;
      });
    } catch (error) {
      console.error('Erreur dans searchConversations:', error);
      throw error;
    }
  },

  // Récupérer les messages non lus d'un utilisateur
  getUnreadMessages: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      console.log('🔍 Récupération des messages non lus pour l\'utilisateur:', user.id);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          is_read,
          sender_id,
          receiver_id,
          conversation_id,
          message_type
        `)
        .eq('receiver_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération messages non lus:', error);
        throw error;
      }

      // Enrichir les messages avec les détails de la conversation et de l'expéditeur
      const enrichedMessages = await Promise.all(
        (data || []).map(async (message) => {
          try {
            let conversation = null;
            let sender = null;

            // Récupérer les détails de la conversation si elle existe
            if (message.conversation_id) {
              const { data: convData, error: convError } = await supabase
                .from('conversations')
                .select('id, listing_id')
                .eq('id', message.conversation_id)
                .single();
              
              if (!convError && convData) {
                conversation = convData;
              }
            }

            // Récupérer les détails de l'expéditeur
            if (message.sender_id) {
              const { data: senderData, error: senderError } = await supabase
                .from('users')
                .select('id, first_name, last_name, avatar_url')
                .eq('id', message.sender_id)
                .single();
              
              if (!senderError && senderData) {
                sender = senderData;
              }
            }

            return {
              ...message,
              conversation,
              sender
            };
          } catch (error) {
            console.error('Erreur lors de l\'enrichissement du message:', error);
            return message;
          }
        })
      );

      return enrichedMessages;
    } catch (error) {
      console.error('Erreur dans getUnreadMessages:', error);
      throw error;
    }
  },

  // Compter les messages non lus
  getUnreadMessageCount: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  // Envoyer un message système
  sendSystemMessage: async (receiverId, content, messageType = 'system') => {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: '00000000-0000-0000-0000-000000000000', // ID système
        receiver_id: receiverId,
        content,
        message_type: messageType,
        is_read: false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export default messageService;
