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

      // D'abord, recuperer les conversations existantes
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(id, title, price, images),
          participant1:users!conversations_participant1_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          participant2:users!conversations_participant2_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (convError) {
        console.error('Erreur récupération conversations:', convError);
        throw convError;
      }

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

      // Pour chaque conversation, recuperer les messages
      const conversationsWithMessages = await Promise.all(
        conversations.map(async (conversation) => {
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
            return { ...conversation, messages: [] };
          }

          return { ...conversation, messages: messages || [] };
        })
      );

      return conversationsWithMessages;
    } catch (error) {
      console.error('Erreur dans getUserConversations:', error);
      throw error;
    }
  },

  // Recuperer les messages d'une conversation
  getConversationMessages: async (conversationId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        ),
        receiver:users!messages_receiver_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        listing:listings(id, title),
        participant1:users!conversations_participant1_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        ),
        participant2:users!conversations_participant2_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .or(`listing.title.ilike.%${searchTerm}%`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Récupérer les messages non lus d'un utilisateur
  getUnreadMessages: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        conversation:conversations(id, listing_id),
        sender:users!messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('receiver_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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
