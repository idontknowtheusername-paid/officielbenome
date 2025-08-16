import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE ANNONCES
// ============================================================================

export const listingService = {
  // Recuperer toutes les annonces avec pagination
  getAllListings: async (filters = {}) => {
    
    // Verifier la configuration Supabase
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
    
    const { page = 0, limit = 12, sort } = filters;
    const from = page * limit;
    const to = from + limit - 1;
    
    try {
      console.log('🔍 Début de la requête getAllListings');
      
      // Requete simple sans timeout complexe
      console.log('🔍 Construction de la requête Supabase...');
    let query = supabase
      .from('listings')
        .select('*')
      .order(sort === 'popular' ? 'views_count' : 'created_at', { ascending: false })
      .range(from, to);
      
      console.log('🔍 Requête de base construite');

    // Appliquer les filtres
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    // Par defaut, ne montrer que les annonces approuvees
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
    
    if (filters.minPrice) {
      query = query.gte('price', Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      query = query.lte('price', Number(filters.maxPrice));
    }
    if (filters.location) {
      const loc = String(filters.location).trim();
      if (loc) {
        query = query.or(`location->>city.ilike.%${loc}%,location->>country.ilike.%${loc}%`);
      }
    }

    console.log('🔍 Executing query with filters:', filters);
    
    // Executer la requete
    console.log('🔍 Lancement de la requête...');
    const { data, error } = await query;
    console.log('🔍 Requête terminée');
    

      
      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
      }
      
      // Nettoyer et valider les donnees JSONB de maniere securisee
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
          return listing; // Retourner les donnees brutes si le parsing echoue
        }
      }) || [];
      
      return { data: cleanedData, count: cleanedData.length, hasMore: false };
      
    } catch (error) {
      console.error('❌ Erreur dans getAllListings:', error);
      throw error;
    }
  },

  // Recuperer une annonce specifique par ID (UUID ou nombre)
  getListingById: async (id) => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, retour d\'annonce de test');
      // Retourner une annonce de test si Supabase n'est pas configure
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
      // Essayer d'abord avec une requete simple
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          users:users!listings_user_id_fkey (
            id,
            first_name,
            last_name,
            phone_number,
            email
          )
        `)
        .eq('id', id)
        .eq('status', 'approved')
        .single();

  
      
      if (error) {
        console.log('🔍 Erreur avec requête simple:', error);
        
        // Si l'annonce n'est pas trouvee, essayer sans le filtre de statut
        const { data: allData, error: allError } = await supabase
          .from('listings')
          .select(`
            *,
            users:users!listings_user_id_fkey (
              id,
              first_name,
              last_name,
              phone_number,
              email
            )
          `)
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
        // Nettoyer et valider les donnees JSONB
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

  // Incrementer les vues d'une annonce
  incrementViews: async (id) => {
    try {
      // Appeler la fonction RPC (a creer cote Supabase)
      const { error } = await supabase.rpc('increment_listing_views', { listing_id: id });
      if (error) throw error;
    } catch (e) {
      console.warn('⚠️ Impossible d\'incrémenter views_count pour', id, e?.message);
    }
  },

  // Recuperer le top N des annonces les plus vues (populaires)
  getTopViewedListings: async (limit = 6) => {
    console.log('🔍 getTopViewedListings appelé avec limit:', limit);
    console.log('🔍 isSupabaseConfigured:', isSupabaseConfigured);
    
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, retour de données de test (top vues)');
      const mock = [
        { id: 'test-2', title: 'Toyota Corolla 2020 - Excellent état', price: 2500000, category: 'automobile', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Thiès', country: 'Sénégal' }, images: [], views_count: 1200 },
        { id: 'test-1', title: 'Appartement 3 pièces au Centre-Ville', price: 500000, category: 'real_estate', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 980 },
        { id: 'test-4', title: 'iPhone 13 Pro - Comme neuf', price: 450000, category: 'marketplace', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 800 }
      ];
      return mock.slice(0, limit);
    }

    try {
      console.log('🔍 Tentative de connexion à Supabase...');
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')
        .order('views_count', { ascending: false, nullsFirst: false })
        .limit(limit);

      console.log('🔍 Réponse Supabase:', { data, error });

      if (error) throw error;

      const cleanedData = (data || []).map((listing) => ({
        ...listing,
        location: listing.location ? (typeof listing.location === 'string' ? JSON.parse(listing.location) : listing.location) : null,
        real_estate_details: listing.real_estate_details ? (typeof listing.real_estate_details === 'string' ? JSON.parse(listing.real_estate_details) : listing.real_estate_details) : null,
        automobile_details: listing.automobile_details ? (typeof listing.automobile_details === 'string' ? JSON.parse(listing.automobile_details) : listing.automobile_details) : null,
        service_details: listing.service_details ? (typeof listing.service_details === 'string' ? JSON.parse(listing.service_details) : listing.service_details) : null,
        product_details: listing.product_details ? (typeof listing.product_details === 'string' ? JSON.parse(listing.product_details) : listing.product_details) : null,
        contact_info: listing.contact_info ? (typeof listing.contact_info === 'string' ? JSON.parse(listing.contact_info) : listing.contact_info) : null,
      }));

      console.log('🔍 Données nettoyées:', cleanedData);
      return cleanedData;
    } catch (error) {
      console.error('❌ Erreur dans getTopViewedListings:', error);
      throw error;
    }
  },

  // Recuperer les annonces d'un utilisateur
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

  // Creer une nouvelle annonce
  createListing: async (listingData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    // Preparer les donnees en excluant les champs qui pourraient ne pas exister
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

  // Mettre a jour une annonce
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
  },

  // Rechercher des annonces par critères avancés
  searchListings: async (searchParams) => {
    const { query, category, minPrice, maxPrice, location, status = 'approved' } = searchParams;
    
    let searchQuery = supabase
      .from('listings')
      .select('*')
      .eq('status', status);

    if (query) {
      searchQuery = searchQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    
    if (category) {
      searchQuery = searchQuery.eq('category', category);
    }
    
    if (minPrice) {
      searchQuery = searchQuery.gte('price', Number(minPrice));
    }
    
    if (maxPrice) {
      searchQuery = searchQuery.lte('price', Number(maxPrice));
    }
    
    if (location) {
      searchQuery = searchQuery.or(`location->>city.ilike.%${location}%,location->>country.ilike.%${location}%`);
    }

    const { data, error } = await searchQuery.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Recuperer les statistiques des annonces
  getListingStats: async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('category, status, created_at, price');

    if (error) throw error;

    const stats = {
      total: data.length,
      byCategory: {},
      byStatus: {},
      byMonth: {},
      totalValue: 0,
      averagePrice: 0
    };

    let totalValue = 0;
    data.forEach(listing => {
      stats.byCategory[listing.category] = (stats.byCategory[listing.category] || 0) + 1;
      stats.byStatus[listing.status] = (stats.byStatus[listing.status] || 0) + 1;
      
      const month = new Date(listing.created_at).toISOString().slice(0, 7);
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
      
      if (listing.price) {
        totalValue += listing.price;
      }
    });

    stats.totalValue = totalValue;
    stats.averagePrice = data.length > 0 ? totalValue / data.length : 0;

    return stats;
  }
};

export default listingService;
