import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE ANNONCES
// ============================================================================

// Fonction utilitaire pour la rotation intelligente des annonces premium
const calculatePremiumRotation = (allPremium, limit) => {
  const totalPremium = allPremium?.length || 0;
  
  if (totalPremium === 0) return { data: [], hasMore: false, totalPremium: 0 };
  
  // Si moins d'annonces premium que la limite, retourner toutes
  if (totalPremium <= limit) {
    return {
      data: allPremium || [],
      hasMore: false,
      totalPremium
    };
  }

  // ROTATION : Sélectionner des annonces différentes chaque jour
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const rotationOffset = dayOfYear % totalPremium;
  
  // Sélectionner les annonces avec rotation
  const rotatedData = [];
  for (let i = 0; i < limit; i++) {
    const index = (rotationOffset + i) % totalPremium;
    rotatedData.push(allPremium[index]);
  }

  console.log(`🔄 Rotation premium: ${totalPremium} total, ${limit} affichées, offset: ${rotationOffset}`);

  return {
    data: rotatedData,
    hasMore: totalPremium > limit,
    totalPremium,
    rotationInfo: {
      dayOfYear,
      rotationOffset,
      nextRotation: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  };
};

// Nouvelle fonction pour calculer le score premium d'une annonce
const calculatePremiumScore = (listing) => {
  let score = 0;
  
  // 1. PRIORITÉ DU PACKAGE (40% du score)
  const priorityWeights = {
    'highest': 1000,
    'high': 800,
    'medium': 600,
    'low': 400
  };
  
  // Extraire la priorité depuis les features du package
  const packagePriority = listing.listing_boosts?.[0]?.boost_packages?.features?.priority;
  score += priorityWeights[packagePriority] || 500;
  
  // 2. TYPE DE PREMIUM (30% du score)
  if (listing.is_featured && listing.is_boosted) score += 900;      // Premium complet
  else if (listing.is_featured) score += 700;                       // Featured uniquement
  else if (listing.is_boosted) score += 600;                        // Boost uniquement
  
  // 3. TEMPS RESTANT (20% du score)
  const daysUntilExpiry = Math.ceil((new Date(listing.boost_expires_at) - new Date()) / (1000 * 60 * 60 * 24));
  score += Math.max(0, daysUntilExpiry * 10);                      // +10 points par jour restant
  
  // 4. FRÉQUENCE DE MISE À JOUR (10% du score)
  const daysSinceUpdate = Math.ceil((Date.now() - new Date(listing.updated_at)) / (1000 * 60 * 60 * 24));
  score += Math.max(0, 30 - daysSinceUpdate);                      // +30 points si très récent
  
  return score;
};

// Fonction pour déterminer la catégorie selon l'heure de la journée
const getCategoryByHour = () => {
  const hour = new Date().getHours();
  
  // 6h-12h : Immobilier (matin, recherche de logements)
  if (hour >= 6 && hour < 12) return 'real_estate';
  
  // 12h-18h : Automobile (après-midi, achats/ventes de véhicules)
  if (hour >= 12 && hour < 18) return 'automobile';
  
  // 18h-22h : Marketplace (soirée, achats en ligne)
  if (hour >= 18 && hour < 22) return 'marketplace';
  
  // 22h-6h : Services (nuit, services professionnels)
  return 'services';
};

// Fonction helper pour les données de test
const getMockHeroListings = (category, hour, limit) => {
  const mockListings = {
    real_estate: [
      { id: 'hero-re-1', title: 'Appartement de luxe au Plateau', price: 850000, category: 'real_estate', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 1500, is_featured: true, is_boosted: true },
      { id: 'hero-re-2', title: 'Villa avec piscine à Almadies', price: 2500000, category: 'real_estate', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 1200, is_featured: true, is_boosted: false },
      { id: 'hero-re-3', title: 'Terrain constructible à Thiès', price: 350000, category: 'real_estate', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Thiès', country: 'Sénégal' }, images: [], views_count: 800, is_featured: false, is_boosted: true }
    ],
    automobile: [
      { id: 'hero-auto-1', title: 'Toyota Land Cruiser 2022', price: 4500000, category: 'automobile', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 2000, is_featured: true, is_boosted: true },
      { id: 'hero-auto-2', title: 'BMW X5 2021 - Excellent état', price: 3200000, category: 'automobile', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 1800, is_featured: true, is_boosted: false },
      { id: 'hero-auto-3', title: 'Peugeot 3008 2020', price: 1800000, category: 'automobile', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 950, is_featured: false, is_boosted: true }
    ],
    services: [
      { id: 'hero-serv-1', title: 'Service de nettoyage professionnel', price: 25000, category: 'services', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 1200, is_featured: true, is_boosted: true },
      { id: 'hero-serv-2', title: 'Cours particuliers - Mathématiques', price: 15000, category: 'services', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 800, is_featured: true, is_boosted: false },
      { id: 'hero-serv-3', title: 'Service de déménagement', price: 45000, category: 'services', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 600, is_featured: false, is_boosted: true }
    ],
    marketplace: [
      { id: 'hero-mp-1', title: 'iPhone 15 Pro Max - Neuf', price: 850000, category: 'marketplace', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 2500, is_featured: true, is_boosted: true },
      { id: 'hero-mp-2', title: 'MacBook Pro M2 - 2023', price: 1200000, category: 'marketplace', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 1800, is_featured: true, is_boosted: false },
      { id: 'hero-mp-3', title: 'PS5 + 5 jeux - Comme neuf', price: 350000, category: 'marketplace', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 1100, is_featured: false, is_boosted: true }
    ]
  };
  
  return {
    data: mockListings[category]?.slice(0, limit) || [],
    category: category,
    hour: hour,
    fallbackLevel: 5,
    nextRotation: new Date(Date.now() + 60 * 60 * 1000),
    rotationInfo: {
      currentHour: hour,
      currentCategory: category,
      timeSlot: getTimeSlot(hour),
      fallbackLevel: 5
    }
  };
};

// Fonction pour obtenir des annonces hero selon l'heure avec fallback multi-niveaux
const getHeroListingsByHour = async (limit = 6) => {
  const currentHour = new Date().getHours();
  const currentCategory = getCategoryByHour();
  
  console.log(`🕐 Hero carousel - Heure: ${currentHour}h, Catégorie: ${currentCategory}`);
  
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase non configuré, retour de données de test pour hero');
    return getMockHeroListings(currentCategory, currentHour, limit);
  }

  try {
    let finalListings = [];
    let fallbackLevel = 1;
    
    // NIVEAU 1 : Annonces premium de la catégorie actuelle
    console.log(`🔄 Niveau ${fallbackLevel}: Annonces premium de ${currentCategory}`);
    const { data: premiumListings, error: premiumError } = await supabase
      .from('listings')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          profile_image
        ),
        listing_boosts (
          boost_packages (
            name,
            features
          ),
          end_date
        )
      `)
      .eq('category', currentCategory)
      .eq('status', 'approved')
      .or('is_featured.eq.true,is_boosted.eq.true')
      .order('created_at', { ascending: false })
      .limit(limit * 2);

    if (!premiumError && premiumListings && premiumListings.length > 0) {
      finalListings = premiumListings;
      console.log(`✅ Niveau ${fallbackLevel} réussi: ${finalListings.length} annonces premium trouvées`);
    } else {
      console.log(`❌ Niveau ${fallbackLevel} échoué: ${premiumError?.message || 'Aucune annonce premium'}`);
      fallbackLevel++;
    }

    // NIVEAU 2 : Annonces populaires de la catégorie actuelle
    if (finalListings.length < limit) {
      console.log(`🔄 Niveau ${fallbackLevel}: Annonces populaires de ${currentCategory}`);
      const { data: popularListings, error: popularError } = await supabase
        .from('listings')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            profile_image
          )
        `)
        .eq('category', currentCategory)
        .eq('status', 'approved')
        .eq('is_featured', false)
        .eq('is_boosted', false)
        .order('views_count', { ascending: false })
        .limit(limit - finalListings.length);

      if (!popularError && popularListings && popularListings.length > 0) {
        finalListings = [...finalListings, ...popularListings];
        console.log(`✅ Niveau ${fallbackLevel} réussi: ${popularListings.length} annonces populaires ajoutées`);
      } else {
        console.log(`❌ Niveau ${fallbackLevel} échoué: ${popularError?.message || 'Aucune annonce populaire'}`);
        fallbackLevel++;
      }
    }

    // NIVEAU 3 : Annonces premium d'autres catégories
    if (finalListings.length < limit) {
      console.log(`🔄 Niveau ${fallbackLevel}: Annonces premium d'autres catégories`);
      const { data: otherPremiumListings, error: otherError } = await supabase
        .from('listings')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            profile_image
          )
        `)
        .neq('category', currentCategory)
        .eq('status', 'approved')
        .or('is_featured.eq.true,is_boosted.eq.true')
        .order('created_at', { ascending: false })
        .limit(limit - finalListings.length);

      if (!otherError && otherPremiumListings && otherPremiumListings.length > 0) {
        finalListings = [...finalListings, ...otherPremiumListings];
        console.log(`✅ Niveau ${fallbackLevel} réussi: ${otherPremiumListings.length} annonces d'autres catégories ajoutées`);
      } else {
        console.log(`❌ Niveau ${fallbackLevel} échoué: ${otherError?.message || 'Aucune annonce d\'autre catégorie'}`);
        fallbackLevel++;
      }
    }

    // NIVEAU 4 : Annonces récentes de toutes catégories
    if (finalListings.length < limit) {
      console.log(`🔄 Niveau ${fallbackLevel}: Annonces récentes de toutes catégories`);
      const { data: recentListings, error: recentError } = await supabase
        .from('listings')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            profile_image
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit - finalListings.length);

      if (!recentError && recentListings && recentListings.length > 0) {
        finalListings = [...finalListings, ...recentListings];
        console.log(`✅ Niveau ${fallbackLevel} réussi: ${recentListings.length} annonces récentes ajoutées`);
      } else {
        console.log(`❌ Niveau ${fallbackLevel} échoué: ${recentError?.message || 'Aucune annonce récente'}`);
        fallbackLevel++;
      }
    }

    // NIVEAU 5 : Données de test (fallback final)
    if (finalListings.length === 0) {
      console.log(`🔄 Niveau ${fallbackLevel}: Données de test (fallback final)`);
      return getMockHeroListings(currentCategory, currentHour, limit);
    }

    // Appliquer la rotation horaire
    const today = new Date();
    const hourOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60));
    const rotationOffset = hourOfYear % Math.max(1, finalListings.length);
    
    const rotatedListings = [];
    for (let i = 0; i < limit && i < finalListings.length; i++) {
      const index = (rotationOffset + i) % finalListings.length;
      rotatedListings.push(finalListings[index]);
    }

    console.log(`🔄 Hero rotation: ${finalListings.length} total, ${rotatedListings.length} affichées, catégorie: ${currentCategory}, heure: ${currentHour}h, niveau de fallback: ${fallbackLevel}`);

    return {
      data: rotatedListings,
      category: currentCategory,
      hour: currentHour,
      nextRotation: new Date(Date.now() + 60 * 60 * 1000),
      fallbackLevel,
      rotationInfo: {
        currentHour,
        currentCategory,
        timeSlot: getTimeSlot(currentHour),
        totalListings: finalListings.length,
        rotationOffset,
        fallbackLevel
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des annonces hero:', error);
    console.log('🔄 Fallback vers les données de test');
    return getMockHeroListings(currentCategory, currentHour, limit);
  }
};

// Fonction utilitaire pour obtenir le créneau horaire
const getTimeSlot = (hour) => {
  if (hour >= 6 && hour < 12) return 'matin';
  if (hour >= 12 && hour < 18) return 'après-midi';
  if (hour >= 18 && hour < 22) return 'soirée';
  return 'nuit';
};

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
    // Requête optimisée avec jointures pour éviter les N+1
    let query = supabase
      .from('listings')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          email,
          phone_number,
          profile_image,
          created_at
        ),
        favorites!left(
          id,
          user_id,
          created_at
        )
      `)
      .order(sort === 'popular' ? 'views_count' : 'created_at', { ascending: false })
      .range(from, to);
      
      console.log('🔍 Requête de base construite');

    // Appliquer les filtres
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    
    // Gérer le statut - si 'all' ou pas de filtre, ne pas filtrer par statut
    if (filters.status && filters.status !== 'all') {
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
  // EXCLUT les annonces premium (is_featured et is_boosted) pour éviter le double affichage
  getTopViewedListings: async (limit = 10) => {
    console.log('🔍 getTopViewedListings appelé avec limit:', limit);
    console.log('🔍 isSupabaseConfigured:', isSupabaseConfigured);
    
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, retour de données de test (top vues)');
      const mock = [
        { id: 'test-2', title: 'Toyota Corolla 2020 - Excellent état', price: 2500000, category: 'automobile', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Thiès', country: 'Sénégal' }, images: [], views_count: 1200, is_featured: false, is_boosted: false },
        { id: 'test-1', title: 'Appartement 3 pièces au Centre-Ville', price: 500000, category: 'real_estate', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 980, is_featured: false, is_boosted: false },
        { id: 'test-4', title: 'iPhone 13 Pro - Comme neuf', price: 450000, category: 'marketplace', status: 'approved', created_at: new Date().toISOString(), location: { city: 'Dakar', country: 'Sénégal' }, images: [], views_count: 800, is_featured: false, is_boosted: false }
      ];
      return mock.slice(0, limit);
    }

    try {
      console.log('🔍 Tentative de connexion à Supabase...');
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')
        .not('is_featured', 'eq', true)    // Exclure les annonces mises en avant
        .not('is_boosted', 'eq', true)     // Exclure les annonces boostées
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
  },

  // Recuperer les annonces premium (is_featured et/ou is_boosted)
  // ROTATION INTELLIGENTE : Équité entre toutes les annonces premium (pour la home page)
  // TRI PAR SCORE : Ordre optimisé par score premium (pour la page premium)
  getPremiumListings: async (limit = 6, useScoreSorting = false) => {
    // Verifier la configuration Supabase
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, retour de données de test premium');
      return {
        data: [
          {
            id: 'premium-1',
            title: 'Villa de luxe avec vue mer - Premium',
            description: 'Magnifique villa 5 pièces avec vue panoramique sur l\'océan. Piscine privée, jardin paysager, garage 2 voitures.',
            price: 15000000,
            category: 'real_estate',
            status: 'approved',
            is_featured: true,
            is_boosted: true,
            user_id: 'premium-user-1',
            created_at: new Date().toISOString(),
            location: { city: 'Saly', country: 'Sénégal' },
            real_estate_details: { type: 'Villa', rooms: '5 pièces', surface: '200m²', amenities: ['Piscine', 'Jardin', 'Garage'] },
            contact_info: { phone: '+221 77 999 8888', email: 'villa-premium@test.com' },
            views_count: 1250,
            favorites_count: 89,
            users: {
              id: 'premium-user-1',
              first_name: 'Omar',
              last_name: 'Diop',
              phone_number: '+221 77 999 8888',
              email: 'omar.diop@test.com'
            }
          },
          {
            id: 'premium-2',
            title: 'Mercedes Classe S 2023 - Premium',
            description: 'Berline de luxe Mercedes Classe S en parfait état, toutes options, entretien constructeur, garantie étendue.',
            price: 45000000,
            category: 'automobile',
            status: 'approved',
            is_featured: true,
            is_boosted: true,
            user_id: 'premium-user-2',
            created_at: new Date().toISOString(),
            location: { city: 'Dakar', country: 'Sénégal' },
            automobile_details: { brand: 'Mercedes', model: 'Classe S', year: '2023', condition: 'Parfait' },
            contact_info: { phone: '+221 76 777 6666', email: 'mercedes-premium@test.com' },
            views_count: 890,
            favorites_count: 67,
            users: {
              id: 'premium-user-2',
              first_name: 'Aissatou',
              last_name: 'Fall',
              phone_number: '+221 76 777 6666',
              email: 'aissatou.fall@test.com'
            }
          },
          {
            id: 'premium-3',
            title: 'Service de Design d\'Intérieur Premium',
            description: 'Designer d\'intérieur certifié avec 15 ans d\'expérience. Projets résidentiels et commerciaux, suivi complet.',
            price: 250000,
            category: 'services',
            status: 'approved',
            is_featured: true,
            is_boosted: false,
            user_id: 'premium-user-3',
            created_at: new Date().toISOString(),
            location: { city: 'Dakar', country: 'Sénégal' },
            service_details: { 
              expertise: 'Design d\'Intérieur', 
              experience: '15 ans', 
              availability: 'Sur rendez-vous',
              verified: true,
              certifications: ['Certification internationale', 'Membre de l\'ordre des designers']
            },
            contact_info: { phone: '+221 78 444 3333', email: 'design-premium@test.com', website: 'www.design-interieur-premium.com' },
            views_count: 567,
            favorites_count: 34,
            users: {
              id: 'premium-user-3',
              first_name: 'Mariama',
              last_name: 'Ba',
              phone_number: '+221 78 444 3333',
              email: 'mariama.ba@test.com'
            }
          }
        ],
        hasMore: false
      };
    }

    try {
      // Récupérer TOUTES les annonces premium valides (sans limite)
      const { data: allPremium, error: allError } = await supabase
        .from('listings')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            phone_number,
            email
          ),
          listing_boosts (
            boost_packages (
              features
            ),
            end_date
          )
        `)
        .or('is_featured.eq.true,is_boosted.eq.true')
        .eq('status', 'approved')
        .order('updated_at', { ascending: false });

      if (allError) throw allError;

      // Enrichir les données avec les métadonnées premium
      const enrichedPremium = allPremium.map(listing => {
        const boostData = listing.listing_boosts?.[0];
        const packageFeatures = boostData?.boost_packages?.features;
        
        return {
          ...listing,
          premium_metadata: {
            priority: packageFeatures?.priority || 'medium',
            badge: packageFeatures?.badge || 'boosted',
            featured: packageFeatures?.featured || false,
            analytics: packageFeatures?.analytics || 'basic',
            support: packageFeatures?.support || 'standard'
          },
          boost_expires_at: boostData?.end_date || null
        };
      });

      // Choisir la stratégie de tri selon le paramètre
      if (useScoreSorting) {
        // TRI PAR SCORE PREMIUM (pour la page premium)
        console.log('🏆 Tri par score premium activé');
        
        // Trier par score premium décroissant
        const sortedByScore = enrichedPremium.sort((a, b) => {
          const scoreA = calculatePremiumScore(a);
          const scoreB = calculatePremiumScore(b);
          return scoreB - scoreA; // Décroissant
        });

        // Retourner avec pagination
        return {
          data: sortedByScore.slice(0, limit),
          hasMore: sortedByScore.length > limit,
          totalPremium: sortedByScore.length,
          sortingMethod: 'score',
          topScores: sortedByScore.slice(0, 3).map((listing, index) => ({
            position: index + 1,
            score: calculatePremiumScore(listing),
            title: listing.title
          }))
        };
      } else {
        // ROTATION INTELLIGENTE (pour la home page)
        console.log('🔄 Rotation intelligente activée');
        return calculatePremiumRotation(enrichedPremium, limit);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces premium:', error);
      throw error;
    }
  },

  // Obtenir les annonces hero pour le carousel
  getHeroListings: async (limit = 6) => {
    return getHeroListingsByHour(limit);
  }
};

export default listingService;
