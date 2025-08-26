import { supabase } from '@/lib/supabase';
import { MESSAGING_CONFIG, MESSAGING_FALLBACKS, MESSAGING_ERROR_MESSAGES } from '@/config/messaging';

// ============================================================================
// SERVICE MESSAGERIE
// ============================================================================

// Fonction pour vérifier/créer l'utilisateur assistant
const ensureAssistantUser = async () => {
  try {
    const assistantId = '00000000-0000-0000-0000-000000000000';
    
    // Vérifier si l'utilisateur assistant existe
    const { data: existingAssistant, error: checkError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('id', assistantId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erreur vérification utilisateur assistant:', checkError);
      return false;
    }

    if (!existingAssistant) {
      // Créer l'utilisateur assistant
      const { error: createError } = await supabase
        .from('users')
        .insert([{
          id: assistantId,
          first_name: 'AIDA',
          last_name: 'Assistant',
          email: 'aida@maximarket.com',
          role: 'assistant',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (createError) {
        console.error('❌ Erreur création utilisateur assistant:', createError);
        return false;
      }

      console.log('✅ Utilisateur assistant créé');
    } else {
      console.log('✅ Utilisateur assistant existe déjà');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur ensureAssistantUser:', error);
    return false;
  }
};

// Fonction pour ajouter le message de bienvenue
export const addWelcomeMessage = async (userId) => {
  try {
    console.log('🔍 Création de la conversation de bienvenue pour l\'utilisateur:', userId);
    
    // Vérifier que l'utilisateur existe
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    // S'assurer que l'utilisateur assistant existe
    const assistantExists = await ensureAssistantUser();
    if (!assistantExists) {
      throw new Error('Impossible de créer/vérifier l\'utilisateur assistant');
    }

    // 1. CRÉER une vraie conversation avec l'assistant
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert([{
        participant1_id: '00000000-0000-0000-0000-000000000000', // Assistant
        participant2_id: userId, // Utilisateur
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (convError) {
      console.error('❌ Erreur création conversation de bienvenue:', convError);
      throw convError;
    }

    console.log('✅ Conversation de bienvenue créée:', conversation.id);

    // 2. AJOUTER le message de bienvenue dans cette conversation
    const welcomeMessage = {
      conversation_id: conversation.id,
      sender_id: '00000000-0000-0000-0000-000000000000',
      receiver_id: userId,
      content: `🤖 Bonjour ! Je suis AIDA, votre assistant intelligent MaxiMarket !

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
      is_read: false,
      created_at: new Date().toISOString()
    };

    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert([welcomeMessage])
      .select()
      .single();

    if (msgError) {
      console.error('❌ Erreur ajout message de bienvenue:', msgError);
      // Supprimer la conversation si le message ne peut pas être ajouté
      await supabase
        .from('conversations')
        .delete()
        .eq('id', conversation.id);
      throw msgError;
    }

    console.log('✅ Message de bienvenue ajouté:', message.id);
    return conversation;
  } catch (error) {
    console.error('❌ Erreur création conversation de bienvenue:', error);
    return null;
  }
};

export const messageService = {
  // Recuperer les conversations d'un utilisateur
  getUserConversations: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ Utilisateur non connecté');
        return [];
      }

      console.log('🔍 Récupération des conversations pour l\'utilisateur:', user.id);

      // Récupérer les conversations de manière plus simple
      let conversations = [];
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
          .order('last_message_at', { ascending: false, nullsLast: true });

        if (error) {
          console.error('❌ Erreur récupération conversations:', error);
        } else {
          conversations = data || [];
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des conversations:', error);
      }

      console.log('🔍 Conversations trouvées:', conversations.length);

      // Vérifier la conversation de l'assistant de manière plus simple
      let assistantConversation = null;
      try {
        const assistantId = '00000000-0000-0000-0000-000000000000';
        
        // Vérifier si une conversation avec l'assistant existe déjà
        const existingAssistant = conversations.find(conv => 
          (conv.participant1_id === assistantId && conv.participant2_id === user.id) ||
          (conv.participant1_id === user.id && conv.participant2_id === assistantId)
        );

        if (!existingAssistant) {
          console.log('Création de la conversation de l\'assistant pour l\'utilisateur:', user.id);
          assistantConversation = await addWelcomeMessage(user.id);
        } else {
          console.log('Conversation de l\'assistant existante trouvée:', existingAssistant.id);
          assistantConversation = existingAssistant;
        }
      } catch (error) {
        console.error('❌ Erreur lors de la gestion de la conversation assistant:', error);
      }

      // Préparer la conversation de l'assistant pour l'affichage
      let formattedAssistantConversation = null;
      if (assistantConversation) {
        try {
          // Récupérer le message de bienvenue
          const { data: welcomeMsg, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', assistantConversation.id)
            .eq('sender_id', '00000000-0000-0000-0000-000000000000')
            .maybeSingle();

          if (!msgError && welcomeMsg) {
            formattedAssistantConversation = {
              ...assistantConversation,
              messages: [welcomeMsg],
              participant1: {
                id: '00000000-0000-0000-0000-000000000000',
                first_name: 'AIDA',
                last_name: 'Assistant',
                profile_image: null
              },
              participant2: {
                id: user.id,
                first_name: user.user_metadata?.first_name || '',
                last_name: user.user_metadata?.last_name || '',
                profile_image: user.user_metadata?.profile_image || null
              },
              listing: null
            };
          }
        } catch (error) {
          console.error('❌ Erreur lors de la préparation de la conversation assistant:', error);
        }
      }

      // Traiter les conversations normales
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conversation) => {
          try {
            // Éviter de traiter la conversation assistant deux fois
            if (conversation.participant1_id === '00000000-0000-0000-0000-000000000000' ||
                conversation.participant2_id === '00000000-0000-0000-0000-000000000000') {
              return null;
            }

            console.log(`🔍 Traitement de la conversation: ${conversation.id}`);
            
            // Récupérer les détails du listing si il existe
            let listingDetails = null;
            if (conversation.listing_id) {
              try {
                const { data: listing, error: listingError } = await supabase
                  .from('listings')
                  .select('id, title, price, images')
                  .eq('id', conversation.listing_id)
                  .maybeSingle();
                
                if (!listingError && listing) {
                  listingDetails = listing;
                }
              } catch (error) {
                console.warn(`⚠️ Erreur récupération listing pour conversation ${conversation.id}:`, error);
              }
            }

            // Récupérer les détails des participants
            const participant1Id = conversation.participant1_id;
            const participant2Id = conversation.participant2_id;
            
            let participant1 = null;
            let participant2 = null;

            // Récupérer participant 1
            if (participant1Id) {
              try {
                const { data: user1, error: user1Error } = await supabase
                  .from('users')
                  .select('id, first_name, last_name, profile_image')
                  .eq('id', participant1Id)
                  .maybeSingle();
                
                if (!user1Error && user1) {
                  participant1 = user1;
                }
              } catch (error) {
                console.warn(`⚠️ Erreur récupération participant 1:`, error);
              }
            }

            // Récupérer participant 2
            if (participant2Id) {
              try {
                const { data: user2, error: user2Error } = await supabase
                  .from('users')
                  .select('id, first_name, last_name, profile_image')
                  .eq('id', participant2Id)
                  .maybeSingle();
                
                if (!user2Error && user2) {
                  participant2 = user2;
                }
              } catch (error) {
                console.warn(`⚠️ Erreur récupération participant 2:`, error);
              }
            }

            // Récupérer les messages
            let messages = [];
            try {
              const { data: messagesData, error: messagesError } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversation.id)
                .order('created_at', { ascending: true });

              if (!messagesError && messagesData) {
                messages = messagesData;
              }
            } catch (error) {
              console.warn(`⚠️ Erreur récupération messages pour conversation ${conversation.id}:`, error);
            }

            return { 
              ...conversation, 
              messages: messages || [],
              listing: listingDetails,
              participant1,
              participant2
            };
          } catch (error) {
            console.error(`❌ Erreur lors du traitement de la conversation ${conversation.id}:`, error);
            return null;
          }
        })
      );

      // Filtrer les conversations null et ajouter l'assistant
      const validConversations = conversationsWithDetails.filter(conv => conv !== null);
      
      if (formattedAssistantConversation) {
        validConversations.unshift(formattedAssistantConversation);
        console.log('✅ Conversation de l\'assistant ajoutée à la liste');
      }

      console.log(`✅ Total des conversations traitées: ${validConversations.length}`);
      return validConversations;

    } catch (error) {
      console.error('❌ Erreur dans getUserConversations:', error);
      return [];
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
                .select('id, first_name, last_name, profile_image')
                .eq('id', message.sender_id)
                .single();
              
              if (!senderError && senderData) {
                sender = senderData;
              }
            }

            if (message.receiver_id) {
              const { data: receiverData, error: receiverError } = await supabase
                .from('users')
                .select('id, first_name, last_name, profile_image')
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

    console.log('📤 Envoi de message dans la conversation:', conversationId);

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

    const currentTime = new Date().toISOString();

    // Inserer le message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert([{
        sender_id: user.id,
        receiver_id: receiverId,
        conversation_id: conversationId,
        content,
        message_type: messageType,
        created_at: currentTime
      }])
      .select()
      .single();

    if (msgError) throw msgError;

    console.log('✅ Message envoyé avec succès, mise à jour de la conversation...');

    // Mettre a jour la conversation avec le timestamp exact du message
    console.log('🔍 message.service - Mise à jour de la conversation:', conversationId);
    console.log('🔍 message.service - currentTime:', currentTime);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('conversations')
      .update({ 
        last_message_at: currentTime,
        updated_at: currentTime
      })
      .eq('id', conversationId)
      .select();

    if (updateError) {
      console.error('❌ Erreur mise à jour conversation:', updateError);
      // Ne pas faire échouer l'envoi du message pour cette erreur
    } else {
      console.log('✅ Conversation mise à jour avec succès:', updateResult);
      console.log('✅ last_message_at mis à jour:', currentTime);
    }

    return message;
  },

  // Actualiser automatiquement les conversations
  refreshConversations: async () => {
    try {
      console.log('🔄 Actualisation automatique des conversations...');
      return await messageService.getUserConversations();
    } catch (error) {
      console.error('❌ Erreur lors de l\'actualisation des conversations:', error);
      throw error;
    }
  },

  // Synchroniser une conversation spécifique
  syncConversation: async (conversationId) => {
    try {
      console.log('🔄 Synchronisation de la conversation:', conversationId);
      
      // Récupérer les messages récents
      const { data: messages, error: msgError } = await supabase
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

      if (msgError) throw msgError;

      // Enrichir les messages avec les détails des expéditeurs
      const messagesWithUsers = await Promise.all(
        (messages || []).map(async (message) => {
          try {
            let sender = null;

            if (message.sender_id) {
              const { data: senderData, error: senderError } = await supabase
                .from('users')
                .select('id, first_name, last_name, profile_image')
                .eq('id', message.sender_id)
                .single();
              
              if (!senderError && senderData) {
                sender = senderData;
              }
            }

            return {
              ...message,
              sender
            };
          } catch (error) {
            console.error('Erreur lors de la récupération des détails de l\'expéditeur:', error);
            return message;
          }
        })
      );

      console.log('✅ Conversation synchronisée:', messagesWithUsers?.length || 0, 'messages');
      return messagesWithUsers;
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation de la conversation:', error);
      throw error;
    }
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

    console.log('🔍 Marquage des messages comme lus pour la conversation:', conversationId);

    // Marquer tous les messages non lus de la conversation comme lus
    const { error } = await supabase
      .from('messages')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id) // Ne pas marquer les messages de l'utilisateur actuel
      .eq('is_read', false);

    if (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
      throw error;
    }

    console.log('✅ Messages marqués comme lus avec succès');
    return true;
  },

  // Archiver une conversation
  archiveConversation: async (conversationId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    console.log('🔍 Archivage de la conversation:', conversationId);

    // Vérifier que l'utilisateur fait partie de la conversation
    const { data: conversation, error: checkError } = await supabase
      .from('conversations')
      .select('participant1_id, participant2_id, is_archived')
      .eq('id', conversationId)
      .single();

    if (checkError) throw checkError;

    if (conversation.participant1_id !== user.id && conversation.participant2_id !== user.id) {
      throw new Error('Non autorisé');
    }

    // Basculer le statut d'archivage
    const newArchivedStatus = !conversation.is_archived;
    
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        is_archived: newArchivedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Erreur lors de l\'archivage de la conversation:', updateError);
      throw updateError;
    }

    console.log(`✅ Conversation ${newArchivedStatus ? 'archivée' : 'désarchivée'} avec succès`);
    return { is_archived: newArchivedStatus };
  },

  // Basculer le statut favori d'une conversation
  toggleConversationStar: async (conversationId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    console.log('🔍 Basculement du statut favori pour la conversation:', conversationId);

    // Vérifier que l'utilisateur fait partie de la conversation
    const { data: conversation, error: checkError } = await supabase
      .from('conversations')
      .select('participant1_id, participant2_id, starred')
      .eq('id', conversationId)
      .single();

    if (checkError) throw checkError;

    if (conversation.participant1_id !== user.id && conversation.participant2_id !== user.id) {
      throw new Error('Non autorisé');
    }

    // Basculer le statut favori
    const newStarredStatus = !conversation.starred;
    
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        starred: newStarredStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Erreur lors du basculement du statut favori:', updateError);
      throw updateError;
    }

    console.log(`✅ Conversation ${newStarredStatus ? 'ajoutée aux' : 'retirée des'} favoris avec succès`);
    return { starred: newStarredStatus };
  },

  // Supprimer un message individuel
  deleteMessage: async (messageId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    console.log('🔍 Suppression du message:', messageId);

    // Vérifier que l'utilisateur est l'expéditeur du message
    const { data: message, error: checkError } = await supabase
      .from('messages')
      .select('sender_id, conversation_id')
      .eq('id', messageId)
      .single();

    if (checkError) throw checkError;

    if (message.sender_id !== user.id) {
      throw new Error('Vous ne pouvez supprimer que vos propres messages');
    }

    // Supprimer le message
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (deleteError) {
      console.error('Erreur lors de la suppression du message:', deleteError);
      throw deleteError;
    }

    console.log('✅ Message supprimé avec succès');
    return true;
  },

  // Supprimer une conversation
  deleteConversation: async (conversationId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    console.log('🔍 Suppression de la conversation:', conversationId);
    console.log('🔍 Utilisateur actuel:', user.id);

    // Verifier que l'utilisateur fait partie de la conversation
    const { data: conversation, error: checkError } = await supabase
      .from('conversations')
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .single();

    if (checkError) {
      console.error('❌ Erreur lors de la vérification de la conversation:', checkError);
      throw checkError;
    }

    console.log('🔍 Conversation trouvée:', conversation);

    if (conversation.participant1_id !== user.id && conversation.participant2_id !== user.id) {
      console.error('❌ Utilisateur non autorisé à supprimer cette conversation');
      throw new Error('Non autorisé');
    }

    console.log('✅ Autorisation vérifiée, suppression en cours...');

    // Supprimer d'abord tous les messages de la conversation
    console.log('🔍 Suppression des messages de la conversation...');
    const { error: messagesDeleteError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesDeleteError) {
      console.error('❌ Erreur lors de la suppression des messages:', messagesDeleteError);
      throw messagesDeleteError;
    }

    console.log('✅ Messages supprimés avec succès');

    // Supprimer la conversation
    console.log('🔍 Suppression de la conversation...');
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression de la conversation:', deleteError);
      throw deleteError;
    }

    console.log('✅ Conversation supprimée avec succès');
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
                .select('id, first_name, last_name, profile_image')
                .eq('id', conversation.participant1_id)
                .single();
              
              if (!user1Error && user1) {
                participant1 = user1;
              }
            }

            if (conversation.participant2_id) {
              const { data: user2, error: user2Error } = await supabase
                .from('users')
                .select('id, first_name, last_name, profile_image')
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
                .select('id, first_name, last_name, profile_image')
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
