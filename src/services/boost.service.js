import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE DE GESTION DES BOOSTS PREMIUM - PRODUCTION
// ============================================================================

export const boostService = {
  // Obtenir tous les packages de boost disponibles
  getBoostPackages: async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase non configuré. Impossible de récupérer les packages de boost.');
    }

    try {
      const { data, error } = await supabase
        .from('boost_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        packages: data || [],
        message: 'Packages récupérés avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des packages:', error);
      throw new Error(`Erreur de récupération des packages: ${error.message}`);
    }
  },

  // Acheter un boost pour une annonce
  purchaseBoost: async (packageId, listingId, userId) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase non configuré. Impossible d\'acheter un boost.');
    }

    try {
      // Vérifier que le package existe et est actif
      const { data: packageData, error: packageError } = await supabase
        .from('boost_packages')
        .select('*')
        .eq('id', packageId)
        .eq('is_active', true)
        .single();

      if (packageError || !packageData) {
        throw new Error('Package de boost non trouvé ou inactif');
      }

      // Vérifier que l'utilisateur est propriétaire de l'annonce
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', listingId)
        .single();

      if (listingError || !listing) {
        throw new Error('Annonce non trouvée');
      }

      if (listing.user_id !== userId) {
        throw new Error('Vous n\'êtes pas autorisé à booster cette annonce');
      }

      // Créer le boost
      const endDate = new Date(Date.now() + packageData.duration_days * 24 * 60 * 60 * 1000);
      
      const { data: boost, error: boostError } = await supabase
        .from('listing_boosts')
        .insert({
          listing_id: listingId,
          user_id: userId,
          package_id: packageId,
          status: 'pending',
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          metadata: {
            price: packageData.price,
            duration_days: packageData.duration_days,
            features: packageData.features,
            package_name: packageData.name
          }
        })
        .select()
        .single();

      if (boostError) throw boostError;

      return {
        success: true,
        boostId: boost.id,
        boostData: boost,
        message: 'Boost créé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de l\'achat du boost:', error);
      throw new Error(`Erreur d'achat de boost: ${error.message}`);
    }
  },

  // Obtenir les boosts d'un utilisateur
  getUserBoosts: async (userId) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase non configuré. Impossible de récupérer les boosts.');
    }

    try {
      const { data, error } = await supabase
        .from('listing_boosts')
        .select(`
          *,
          boost_packages (*),
          listings (
            id,
            title,
            price,
            images,
            location
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        boosts: data || [],
        message: 'Boosts récupérés avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des boosts:', error);
      throw new Error(`Erreur de récupération des boosts: ${error.message}`);
    }
  },

  // Obtenir les boosts d'une annonce
  getListingBoosts: async (listingId) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase non configuré. Impossible de récupérer les boosts de l\'annonce.');
    }

    try {
      const { data, error } = await supabase
        .from('listing_boosts')
        .select(`
          *,
          boost_packages (*)
        `)
        .eq('listing_id', listingId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        boosts: data || [],
        message: 'Boosts de l\'annonce récupérés avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des boosts de l\'annonce:', error);
      throw new Error(`Erreur de récupération des boosts: ${error.message}`);
    }
  },

  // Annuler un boost
  cancelBoost: async (boostId, userId) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase non configuré. Impossible d\'annuler le boost.');
    }

    try {
      // Vérifier que l'utilisateur est propriétaire du boost
      const { data: boost, error: boostError } = await supabase
        .from('listing_boosts')
        .select('*')
        .eq('id', boostId)
        .eq('user_id', userId)
        .single();

      if (boostError || !boost) {
        throw new Error('Boost non trouvé ou non autorisé');
      }

      // Annuler le boost
      const { error: updateError } = await supabase
        .from('listing_boosts')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', boostId);

      if (updateError) throw updateError;

      return {
        success: true,
        message: 'Boost annulé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de l\'annulation du boost:', error);
      throw new Error(`Erreur d'annulation de boost: ${error.message}`);
    }
  },

  // Activer un boost (après paiement réussi)
  activateBoost: async (boostId) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase non configuré. Impossible d\'activer le boost.');
    }

    try {
      // Récupérer le boost
      const { data: boost, error: boostError } = await supabase
        .from('listing_boosts')
        .select(`
          *,
          boost_packages (*)
        `)
        .eq('id', boostId)
        .single();

      if (boostError || !boost) {
        throw new Error('Boost non trouvé');
      }

      // Calculer la date d'expiration
      const expiresAt = new Date(Date.now() + boost.duration_days * 24 * 60 * 60 * 1000);

      // Activer le boost
      const { error: updateError } = await supabase
        .from('listing_boosts')
        .update({
          status: 'active',
          activated_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .eq('id', boostId);

      if (updateError) throw updateError;

      // Mettre à jour l'annonce pour indiquer qu'elle est boostée
      const { error: listingError } = await supabase
        .from('listings')
        .update({
          is_boosted: true,
          boost_expires_at: expiresAt.toISOString()
        })
        .eq('id', boost.listing_id);

      if (listingError) {
        console.warn('Erreur lors de la mise à jour de l\'annonce:', listingError);
      }

      return {
        success: true,
        boostData: {
          ...boost,
          status: 'active',
          activated_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        },
        message: 'Boost activé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de l\'activation du boost:', error);
      throw new Error(`Erreur d'activation de boost: ${error.message}`);
    }
  },

  // Renouveler un boost
  renewBoost: async (boostId, userId) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase non configuré. Impossible de renouveler le boost.');
    }

    try {
      // Vérifier que l'utilisateur est propriétaire du boost
      const { data: boost, error: boostError } = await supabase
        .from('listing_boosts')
        .select(`
          *,
          boost_packages (*)
        `)
        .eq('id', boostId)
        .eq('user_id', userId)
        .single();

      if (boostError || !boost) {
        throw new Error('Boost non trouvé ou non autorisé');
      }

      // Vérifier que le boost est actif ou expiré
      if (boost.status !== 'active' && boost.status !== 'expired') {
        throw new Error('Le boost ne peut pas être renouvelé dans son état actuel');
      }

      // Calculer la nouvelle date d'expiration
      const currentExpiry = new Date(boost.expires_at);
      const newExpiry = new Date(currentExpiry.getTime() + boost.duration_days * 24 * 60 * 60 * 1000);

      // Renouveler le boost
      const { error: updateError } = await supabase
        .from('listing_boosts')
        .update({
          status: 'active',
          expires_at: newExpiry.toISOString(),
          renewed_at: new Date().toISOString()
        })
        .eq('id', boostId);

      if (updateError) throw updateError;

      // Mettre à jour l'annonce
      const { error: listingError } = await supabase
        .from('listings')
        .update({
          is_boosted: true,
          boost_expires_at: newExpiry.toISOString()
        })
        .eq('id', boost.listing_id);

      if (listingError) {
        console.warn('Erreur lors de la mise à jour de l\'annonce:', listingError);
      }

      return {
        success: true,
        boostData: {
          ...boost,
          status: 'active',
          expires_at: newExpiry.toISOString(),
          renewed_at: new Date().toISOString()
        },
        message: 'Boost renouvelé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors du renouvellement du boost:', error);
      throw new Error(`Erreur de renouvellement de boost: ${error.message}`);
    }
  },

  // Obtenir les statistiques des boosts
  getBoostStats: async (userId) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase non configuré. Impossible de récupérer les statistiques.');
    }

    try {
      const { data, error } = await supabase
        .from('listing_boosts')
        .select('status, price, created_at')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(b => b.status === 'active').length,
        pending: data.filter(b => b.status === 'pending').length,
        expired: data.filter(b => b.status === 'expired').length,
        cancelled: data.filter(b => b.status === 'cancelled').length,
        totalSpent: data.reduce((sum, b) => sum + (b.price || 0), 0)
      };

      return {
        success: true,
        stats,
        message: 'Statistiques récupérées avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error(`Erreur de récupération des statistiques: ${error.message}`);
    }
  },

  // Vérifier le statut d'un boost pour une annonce
  getBoostStatus: async (listingId) => {
    if (!isSupabaseConfigured) {
      return {
        hasActiveBoost: false,
        currentBoost: null,
        boostHistory: []
      };
    }

    try {
      const { data, error } = await supabase
        .from('listing_boosts')
        .select(`
          *,
          boost_packages (
            name,
            description,
            features
          )
        `)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const activeBoost = data?.find(boost => boost.status === 'active');
      const boostHistory = data || [];

      return {
        hasActiveBoost: !!activeBoost,
        currentBoost: activeBoost,
        boostHistory
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de boost:', error);
      return {
        hasActiveBoost: false,
        currentBoost: null,
        boostHistory: []
      };
    }
  }
};

export default boostService;
