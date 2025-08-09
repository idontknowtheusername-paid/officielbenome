import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE AUTHENTIFICATION
// ============================================================================

export const authService = {
  // Connexion
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Inscription
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    if (error) throw error;
    return data;
  },

  // Déconnexion
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Réinitialisation mot de passe
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  // Mise à jour mot de passe
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  },

  // Récupérer la session actuelle
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  // Écouter les changements d'authentification
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================================================
// SERVICE UTILISATEURS
// ============================================================================

export const userService = {
  // Récupérer le profil utilisateur
  getProfile: async (userId = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour le profil utilisateur
  updateProfile: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer tous les utilisateurs (admin)
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Mettre à jour le statut d'un utilisateur (admin)
  updateUserStatus: async (userId, status) => {
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// SERVICE ANNONCES
// ============================================================================

export const listingService = {
  // Récupérer toutes les annonces avec pagination
  getAllListings: async (filters = {}) => {
    console.log('🔍 listingService.getAllListings called with filters:', filters);
    
    // Vérifier la configuration Supabase
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, retour de données de test');
      return {
        data: [
          {
            id: 'test-1',
            title: 'Appartement 3 pièces au Centre-Ville',
            description: 'Bel appartement moderne au cœur de Dakar, proche de tous les commerces et transports.',
            price: 500000,
            category: 'real_estate',
            status: 'approved',
            user_id: 'test-user-1',
            created_at: new Date().toISOString(),
            location: { city: 'Dakar', country: 'Sénégal' },
            real_estate_details: { type: 'Appartement', rooms: '3 pièces', surface: '80m²' },
            contact_info: { phone: '+221 77 123 4567', email: 'vendeur@test.com' },
            users: {
              id: 'test-user-1',
              first_name: 'Mamadou',
              last_name: 'Diallo',
              phone_number: '+221 77 123 4567',
              email: 'mamadou.diallo@test.com'
            }
          },
          {
            id: 'test-2',
            title: 'Toyota Corolla 2020 - Excellent état',
            description: 'Véhicule en parfait état, entretien régulier, première main.',
            price: 2500000,
            category: 'automobile',
            status: 'approved',
            user_id: 'test-user-2',
            created_at: new Date().toISOString(),
            location: { city: 'Thiès', country: 'Sénégal' },
            automobile_details: { brand: 'Toyota', model: 'Corolla', year: '2020' },
            contact_info: { phone: '+221 76 987 6543', email: 'vendeur-auto@test.com' },
            users: {
              id: 'test-user-2',
              first_name: 'Fatou',
              last_name: 'Sall',
              phone_number: '+221 76 987 6543',
              email: 'fatou.sall@test.com'
            }
          },
          {
            id: 'test-3',
            title: 'Service de Plomberie Professionnel',
            description: 'Plombier qualifié avec 10 ans d\'expérience. Réparation, installation, maintenance. Intervention rapide 24h/24.',
            price: 15000,
            category: 'services',
            status: 'approved',
            user_id: 'test-user-3',
            created_at: new Date().toISOString(),
            location: { city: 'Dakar', country: 'Sénégal' },
            service_details: { 
              expertise: 'Plomberie', 
              experience: '10 ans', 
              availability: '24h/24',
              verified: true,
              certifications: ['Certification professionnelle', 'Assurance responsabilité civile']
            },
            contact_info: { phone: '+221 78 555 1234', email: 'plombier@test.com', website: 'www.plombier-dakar.com' },
            users: {
              id: 'test-user-3',
              first_name: 'Ibrahima',
              last_name: 'Ndiaye',
              phone_number: '+221 78 555 1234',
              email: 'ibrahima.ndiaye@test.com'
            }
          },
          {
            id: 'test-4',
            title: 'iPhone 13 Pro - Comme neuf',
            description: 'iPhone 13 Pro 128GB en excellent état, acheté il y a 6 mois. Boîte et accessoires inclus.',
            price: 450000,
            category: 'marketplace',
            status: 'approved',
            user_id: 'test-user-4',
            created_at: new Date().toISOString(),
            location: { city: 'Dakar', country: 'Sénégal' },
            product_details: { 
              brand: 'Apple', 
              model: 'iPhone 13 Pro', 
              condition: 'Excellent',
              warranty: 'Garantie constructeur',
              dimensions: '146.7 x 71.5 x 7.65 mm',
              weight: '203g'
            },
            contact_info: { phone: '+221 77 888 9999', email: 'tech@test.com' },
            users: {
              id: 'test-user-4',
              first_name: 'Aissatou',
              last_name: 'Diop',
              phone_number: '+221 77 888 9999',
              email: 'aissatou.diop@test.com'
            },
          }
        ],
        count: 4,
        hasMore: false
      };
    }
    
    const { page = 0, limit = 12 } = filters;
    const from = page * limit;
    const to = from + limit - 1;
    
    try {
      console.log('🔍 Début de la requête getAllListings');
      
      // Requête simple sans timeout complexe
      console.log('🔍 Construction de la requête Supabase...');
    let query = supabase
      .from('listings')
        .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
      
      console.log('🔍 Requête de base construite');

    // Appliquer les filtres
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    // Par défaut, ne montrer que les annonces approuvées
    if (!filters.status) {
      query = query.eq('status', 'approved');
    } else if (filters.status) {
      query = query.eq('status', filters.status);
    }
      
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
      
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    console.log('🔍 Executing query with filters:', filters);
    
    // Exécuter la requête
    console.log('🔍 Lancement de la requête...');
    const { data, error } = await query;
    console.log('🔍 Requête terminée');
    
    console.log('🔍 listingService.getAllListings result:', { data: data?.length || 0, error });
      
      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
      }
      
      // Nettoyer et valider les données JSONB de manière sécurisée
      const cleanedData = data?.map(listing => {
        try {
          return {
            ...listing,
            location: listing.location ? (typeof listing.location === 'string' ? JSON.parse(listing.location) : listing.location) : null,
            real_estate_details: listing.real_estate_details ? (typeof listing.real_estate_details === 'string' ? JSON.parse(listing.real_estate_details) : listing.real_estate_details) : null,
            automobile_details: listing.automobile_details ? (typeof listing.automobile_details === 'string' ? JSON.parse(listing.automobile_details) : listing.automobile_details) : null,
            service_details: listing.service_details ? (typeof listing.service_details === 'string' ? JSON.parse(listing.service_details) : listing.service_details) : null,
            product_details: listing.product_details ? (typeof listing.product_details === 'string' ? JSON.parse(listing.product_details) : listing.product_details) : null,
            contact_info: listing.contact_info ? (typeof listing.contact_info === 'string' ? JSON.parse(listing.contact_info) : listing.contact_info) : null,
          };
        } catch (parseError) {
          console.warn('⚠️ Erreur parsing JSONB pour listing:', listing.id, parseError);
          return listing; // Retourner les données brutes si le parsing échoue
        }
      }) || [];
      
      return { data: cleanedData, count: cleanedData.length, hasMore: false };
      
    } catch (error) {
      console.error('❌ Erreur dans getAllListings:', error);
      throw error;
    }
  },

  // Récupérer une annonce spécifique par ID (UUID ou nombre)
  getListingById: async (id) => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, retour d\'annonce de test');
      // Retourner une annonce de test si Supabase n'est pas configuré
      return {
        id: 'test-1',
        title: 'Appartement 3 pièces au Centre-Ville',
        description: 'Bel appartement moderne au cœur de Dakar, proche de tous les commerces et transports.',
        price: 500000,
        category: 'real_estate',
        status: 'approved',
        user_id: 'test-user-1',
        created_at: new Date().toISOString(),
        location: { city: 'Dakar', country: 'Sénégal' },
        real_estate_details: { type: 'Appartement', rooms: '3 pièces', surface: '80m²' },
        contact_info: { phone: '+221 77 123 4567', email: 'vendeur@test.com' },
        users: {
          id: 'test-user-1',
          first_name: 'Mamadou',
          last_name: 'Diallo',
          phone_number: '+221 77 123 4567',
          email: 'mamadou.diallo@test.com'
        }
      };
    }
    
    try {
      // Essayer d'abord avec une requête simple
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      console.log('🔍 listingService.getListingById result:', { data, error });
      
      if (error) {
        console.log('🔍 Erreur avec requête simple:', error);
        
        // Si l'annonce n'est pas trouvée, essayer sans le filtre de statut
        const { data: allData, error: allError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();
          
        if (allError) throw allError;
        
        if (allData) {
          console.log('🔍 Annonce trouvée sans filtre de statut:', allData.status);
          return {
            ...allData,
            location: typeof allData.location === 'string' ? JSON.parse(allData.location) : allData.location,
            real_estate_details: typeof allData.real_estate_details === 'string' ? JSON.parse(allData.real_estate_details) : allData.real_estate_details,
            automobile_details: typeof allData.automobile_details === 'string' ? JSON.parse(allData.automobile_details) : allData.automobile_details,
            service_details: typeof allData.service_details === 'string' ? JSON.parse(allData.service_details) : allData.service_details,
            product_details: typeof allData.product_details === 'string' ? JSON.parse(allData.product_details) : allData.product_details,
            contact_info: typeof allData.contact_info === 'string' ? JSON.parse(allData.contact_info) : allData.contact_info,
          };
        }
        
        return null;
      }
      
      if (data) {
        // Nettoyer et valider les données JSONB
        return {
          ...data,
          location: typeof data.location === 'string' ? JSON.parse(data.location) : data.location,
          real_estate_details: typeof data.real_estate_details === 'string' ? JSON.parse(data.real_estate_details) : data.real_estate_details,
          automobile_details: typeof data.automobile_details === 'string' ? JSON.parse(data.automobile_details) : data.automobile_details,
          service_details: typeof data.service_details === 'string' ? JSON.parse(data.service_details) : data.service_details,
          product_details: typeof data.product_details === 'string' ? JSON.parse(data.product_details) : data.product_details,
          contact_info: typeof data.contact_info === 'string' ? JSON.parse(data.contact_info) : data.contact_info,
        };
      }
      
      return null;
    } catch (error) {
      console.error('🔍 Erreur dans getListingById:', error);
      throw error;
    }
  },

  // Récupérer les annonces d'un utilisateur
  getUserListings: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },



  // Créer une nouvelle annonce
  createListing: async (listingData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    // Préparer les données en excluant les champs qui pourraient ne pas exister
    const { currency, specificData, subCategory, videos, ...baseData } = listingData;
    
    const insertData = {
      ...baseData,
      user_id: user.id,
      status: 'approved'
    };

    // Ajouter currency seulement si la colonne existe
    if (currency) {
      insertData.currency = currency;
    }

    // Ajouter specificData comme JSON si la colonne existe
    if (specificData && Object.keys(specificData).length > 0) {
      insertData.specific_data = specificData;
    }

    // Ajouter subCategory seulement si la colonne existe
    if (subCategory) {
      insertData.subCategory = subCategory;
    }

    // Ajouter videos seulement si la colonne existe
    if (videos && videos.length > 0) {
      insertData.videos = videos;
    }

    const { data, error } = await supabase
      .from('listings')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Erreur création annonce:', error);
      throw error;
    }
    return data;
  },

  // Mettre à jour une annonce
  updateListing: async (id, updates) => {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une annonce
  deleteListing: async (id) => {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Approuver/Rejeter une annonce (admin)
  updateListingStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// SERVICE CATÉGORIES
// ============================================================================

export const categoryService = {
  // Récupérer toutes les catégories
  getAllCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Récupérer une catégorie par slug
  getCategoryBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Récupérer les catégories par type
  getCategoriesByType: async (type) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('name');

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// SERVICE FAVORIS
// ============================================================================

export const favoriteService = {
  // Récupérer les favoris d'un utilisateur
  getUserFavorites: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        listings!favorites_listing_id_fkey (
          *,
          users!listings_user_id_fkey (
            id,
            first_name,
            last_name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Ajouter aux favoris
  addToFavorites: async (listingId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: user.id,
        listing_id: listingId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Retirer des favoris
  removeFromFavorites: async (listingId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId);

    if (error) throw error;
  },

  // Vérifier si une annonce est en favori
  isFavorite: async (listingId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};

// ============================================================================
// SERVICE NOTIFICATIONS
// ============================================================================

export const notificationService = {
  // Récupérer les notifications d'un utilisateur
  getUserNotifications: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une notification
  createNotification: async (notificationData) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// SERVICE MESSAGES
// ============================================================================

export const messageService = {
  // Récupérer les conversations d'un utilisateur
  getUserConversations: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    // D'abord, récupérer les conversations existantes
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

    if (convError) throw convError;

    // Pour chaque conversation, récupérer les messages
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
  },

  // Récupérer les messages d'une conversation
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

    // Récupérer la conversation pour déterminer le destinataire
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    const receiverId = conversation.participant1_id === user.id 
      ? conversation.participant2_id 
      : conversation.participant1_id;

    // Insérer le message
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

    // Mettre à jour la conversation
    await supabase
      .from('conversations')
      .update({ 
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    return message;
  },

  // Créer une nouvelle conversation
  createConversation: async (participantId, listingId = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    // Vérifier si une conversation existe déjà
    const { data: existingConv, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${participantId}),and(participant1_id.eq.${participantId},participant2_id.eq.${user.id})`)
      .eq('listing_id', listingId)
      .single();

    if (existingConv) {
      return existingConv;
    }

    // Créer une nouvelle conversation
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

    // Vérifier que l'utilisateur fait partie de la conversation
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
  }
};

// ============================================================================
// SERVICE RECHERCHE
// ============================================================================

export const searchService = {
  // Rechercher dans les annonces
  searchListings: async (query, filters = {}) => {
    let searchQuery = supabase
      .from('listings')
      .select(`
        *,
        users!listings_user_id_fkey (
          id,
          first_name,
          last_name
        ),
        categories!listings_category_id_fkey (
          id,
          name,
          slug
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    // Appliquer les filtres supplémentaires
    if (filters.category_id) {
      searchQuery = searchQuery.eq('category_id', filters.category_id);
    }
    if (filters.min_price) {
      searchQuery = searchQuery.gte('price', filters.min_price);
    }
    if (filters.max_price) {
      searchQuery = searchQuery.lte('price', filters.max_price);
    }

    const { data, error } = await searchQuery;
    if (error) throw error;
    return data;
  },

  // Sauvegarder une recherche
  saveSearch: async (query, filters = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('search_history')
      .insert([{
        user_id: user.id,
        query,
        filters: filters
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// SERVICE STORAGE (IMAGES)
// ============================================================================

export const storageService = {
  // Uploader une image (optimisé)
  uploadImage: async (file, folder = 'listings') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      // Vérifier la taille (max 5MB après compression)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('L\'image ne doit pas dépasser 5MB');
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${folder}/${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '31536000', // 1 an
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('Erreur upload Supabase:', error);
        throw new Error(`Erreur lors de l'upload: ${error.message}`);
      }

      // Récupérer l'URL publique avec transformation pour optimisation
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erreur dans uploadImage:', error);
      throw error;
    }
  },

  // Supprimer une image
  deleteImage: async (filePath) => {
    try {
      const { error } = await supabase.storage
        .from('images')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur dans deleteImage:', error);
      throw error;
    }
  },

  // Lister les images d'un utilisateur
  listUserImages: async (userId, folder = 'listings') => {
    try {
      const { data, error } = await supabase.storage
        .from('images')
        .list(`${folder}/${userId}`);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur dans listUserImages:', error);
      throw error;
    }
  }
};

// ============================================================================
// SERVICE TRANSACTIONS
// ============================================================================

export const transactionService = {
  // Récupérer toutes les transactions
  getAllTransactions: async (filters = {}) => {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        users!transactions_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        listings!transactions_listing_id_fkey (
          id,
          title,
          price
        )
      `)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.type) {
      query = query.eq('transaction_type', filters.type);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Récupérer une transaction par ID
  getTransactionById: async (id) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        users!transactions_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        listings!transactions_listing_id_fkey (
          id,
          title,
          price,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une nouvelle transaction
  createTransaction: async (transactionData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transactionData,
        user_id: user.id,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour le statut d'une transaction
  updateTransactionStatus: async (id, status, reason = null) => {
    const updateData = { status };
    if (reason) updateData.reason = reason;

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Rembourser une transaction
  refundTransaction: async (id, amount, reason) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        status: 'refunded',
        refund_amount: amount,
        refund_reason: reason,
        refunded_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// SERVICE RAPPORTS/MODÉRATION
// ============================================================================

export const reportService = {
  // Récupérer tous les rapports
  getAllReports: async (filters = {}) => {
    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:users!reports_reporter_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        listing:listings!reports_listing_id_fkey (
          id,
          title,
          description
        )
      `)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Créer un nouveau rapport
  createReport: async (reportData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('reports')
      .insert([{
        ...reportData,
        reporter_id: user.id,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Modérer un rapport
  moderateReport: async (id, action, reason = null) => {
    const updateData = {
      status: action,
      moderated_at: new Date().toISOString(),
      moderator_reason: reason
    };

    const { data, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// SERVICE ANALYTICS
// ============================================================================

export const analyticsService = {
  // Obtenir les statistiques générales
  getDashboardStats: async () => {
    const [users, listings, transactions] = await Promise.all([
      userService.getAllUsers(),
      listingService.getAllListings(),
      transactionService.getAllTransactions()
    ]);

    const activeUsers = users.filter(u => u.status === 'active').length;
    const pendingListings = listings.filter(l => l.status === 'pending').length;
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      users: {
        total: users.length,
        active: activeUsers,
        inactive: users.length - activeUsers
      },
      listings: {
        total: listings.length,
        approved: listings.filter(l => l.status === 'approved').length,
        pending: pendingListings,
        rejected: listings.filter(l => l.status === 'rejected').length
      },
      transactions: {
        total: transactions.length,
        completed: completedTransactions.length,
        pending: transactions.filter(t => t.status === 'pending').length,
        revenue: totalRevenue
      }
    };
  },

  // Obtenir les données de croissance utilisateurs
  getUserGrowthData: async (days = 30) => {
    const users = await userService.getAllUsers();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentUsers = users.filter(user => 
      new Date(user.created_at) >= cutoffDate
    );

    // Grouper par jour
    const dailyData = {};
    recentUsers.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + 1;
    });

    return Object.entries(dailyData).map(([date, count]) => ({
      date,
      users: count
    }));
  },

  // Obtenir les données de revenus
  getRevenueData: async (days = 30) => {
    const transactions = await transactionService.getAllTransactions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentTransactions = transactions.filter(transaction => 
      transaction.status === 'completed' && 
      new Date(transaction.created_at) >= cutoffDate
    );

    // Grouper par jour
    const dailyData = {};
    recentTransactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, count: 0 };
      }
      dailyData[date].revenue += transaction.amount || 0;
      dailyData[date].count += 1;
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      transactions: data.count
    }));
  }
};

// Export par défaut mis à jour
export default {
  auth: authService,
  users: userService,
  listings: listingService,
  categories: categoryService,
  favorites: favoriteService,
  notifications: notificationService,
  messages: messageService,
  search: searchService,
  storage: storageService,
  transactions: transactionService,
  reports: reportService,
  analytics: analyticsService
};