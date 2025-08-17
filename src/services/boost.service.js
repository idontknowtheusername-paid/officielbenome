import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE DE GESTION DES BOOSTS PREMIUM
// ============================================================================

export const boostService = {
  // Récupérer tous les packages de boost disponibles
  getBoostPackages: async () => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, retour de packages de test');
      return [
        {
          id: 'test-basic',
          name: 'Boost Basique',
          description: 'Visibilité améliorée pendant 7 jours',
          duration_days: 7,
          price: 5000.00,
          features: {
            priority: 'medium',
            badge: 'boosted',
            featured: false,
            analytics: 'basic'
          },
          is_active: true,
          sort_order: 1
        },
        {
          id: 'test-premium',
          name: 'Boost Premium',
          description: 'Mise en avant complète pendant 14 jours',
          duration_days: 14,
          price: 12000.00,
          features: {
            priority: 'high',
            badge: 'boosted',
            featured: true,
            analytics: 'detailed'
          },
          is_active: true,
          sort_order: 2
        },
        {
          id: 'test-vip',
          name: 'Boost VIP',
          description: 'Visibilité maximale pendant 30 jours',
          duration_days: 30,
          price: 25000.00,
          features: {
            priority: 'highest',
            badge: 'boosted',
            featured: true,
            analytics: 'premium',
            support: 'priority'
          },
          is_active: true,
          sort_order: 3
        },
        {
          id: 'test-flash',
          name: 'Boost Flash',
          description: 'Visibilité intensive pendant 3 jours',
          duration_days: 3,
          price: 3000.00,
          features: {
            priority: 'high',
            badge: 'boosted',
            featured: false,
            analytics: 'basic'
          },
          is_active: true,
          sort_order: 4
        }
      ];
    }

    try {
      const { data, error } = await supabase
        .from('boost_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des packages de boost:', error);
      throw error;
    }
  },

  // Acheter un boost pour une annonce
  purchaseBoost: async (listingId, packageId, userId) => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, simulation d\'achat de boost');
      return {
        success: true,
        boostId: 'test-boost-' + Date.now(),
        message: 'Boost acheté avec succès (mode test)'
      };
    }

    try {
      // 1. Récupérer les détails du package
      const { data: packageData, error: packageError } = await supabase
        .from('boost_packages')
        .select('*')
        .eq('id', packageId)
        .eq('is_active', true)
        .single();

      if (packageError || !packageData) {
        throw new Error('Package de boost non trouvé ou inactif');
      }

      // 2. Vérifier que l'utilisateur possède l'annonce
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('id, user_id, status')
        .eq('id', listingId)
        .eq('user_id', userId)
        .eq('status', 'approved')
        .single();

      if (listingError || !listingData) {
        throw new Error('Annonce non trouvée ou non autorisée');
      }

      // 3. Calculer les dates de début et fin
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + packageData.duration_days);

      // 4. Créer l'enregistrement de boost
      const { data: boostData, error: boostError } = await supabase
        .from('listing_boosts')
        .insert({
          listing_id: listingId,
          package_id: packageId,
          user_id: userId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'pending', // Sera activé après paiement
          metadata: {
            views_before: 0, // Sera mis à jour lors de l'activation
            contacts_before: 0
          }
        })
        .select()
        .single();

      if (boostError) throw boostError;

      // 5. Enregistrer dans l'historique
      await supabase
        .from('boost_history')
        .insert({
          listing_id: listingId,
          boost_id: boostData.id,
          user_id: userId,
          action: 'purchased',
          details: {
            package_name: packageData.name,
            price: packageData.price,
            duration_days: packageData.duration_days
          }
        });

      return {
        success: true,
        boostId: boostData.id,
        boostData,
        packageData,
        message: 'Boost acheté avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de l\'achat du boost:', error);
      throw error;
    }
  },

  // Vérifier le statut d'un boost
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
      throw error;
    }
  },

  // Annuler un boost
  cancelBoost: async (boostId, userId) => {
    if (!isSupabaseConfigured) {
      return { success: true, message: 'Boost annulé avec succès (mode test)' };
    }

    try {
      // Vérifier que l'utilisateur possède le boost
      const { data: boostData, error: boostError } = await supabase
        .from('listing_boosts')
        .select('*')
        .eq('id', boostId)
        .eq('user_id', userId)
        .single();

      if (boostError || !boostData) {
        throw new Error('Boost non trouvé ou non autorisé');
      }

      // Marquer le boost comme annulé
      const { error: updateError } = await supabase
        .from('listing_boosts')
        .update({ status: 'cancelled' })
        .eq('id', boostId);

      if (updateError) throw updateError;

      // Enregistrer dans l'historique
      await supabase
        .from('boost_history')
        .insert({
          listing_id: boostData.listing_id,
          boost_id: boostId,
          user_id: userId,
          action: 'cancelled',
          details: {
            reason: 'user_cancelled',
            cancelled_at: new Date().toISOString()
          }
        });

      return { success: true, message: 'Boost annulé avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'annulation du boost:', error);
      throw error;
    }
  },

  // Récupérer l'historique des boosts d'un utilisateur
  getBoostHistory: async (userId) => {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('boost_history')
        .select(`
          *,
          listing_boosts (
            boost_packages (
              name,
              price
            )
          ),
          listings (
            title,
            category
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des boosts:', error);
      throw error;
    }
  },

  // Activer un boost après paiement confirmé
  activateBoost: async (boostId, paymentId) => {
    if (!isSupabaseConfigured) {
      return { success: true, message: 'Boost activé avec succès (mode test)' };
    }

    try {
      // Récupérer les statistiques actuelles de l'annonce
      const { data: boostData, error: boostError } = await supabase
        .from('listing_boosts')
        .select(`
          *,
          listings (
            views_count,
            favorites_count
          )
        `)
        .eq('id', boostId)
        .single();

      if (boostError || !boostData) {
        throw new Error('Boost non trouvé');
      }

      // Mettre à jour le boost avec les statistiques de départ
      const { error: updateError } = await supabase
        .from('listing_boosts')
        .update({
          status: 'active',
          payment_id: paymentId,
          metadata: {
            views_before: boostData.listings.views_count || 0,
            contacts_before: boostData.listings.favorites_count || 0,
            activated_at: new Date().toISOString()
          }
        })
        .eq('id', boostId);

      if (updateError) throw updateError;

      // Enregistrer dans l'historique
      await supabase
        .from('boost_history')
        .insert({
          listing_id: boostData.listing_id,
          boost_id: boostId,
          user_id: boostData.user_id,
          action: 'activated',
          details: {
            payment_id: paymentId,
            activated_at: new Date().toISOString()
          }
        });

      return { success: true, message: 'Boost activé avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'activation du boost:', error);
      throw error;
    }
  },

  // Renouveler un boost
  renewBoost: async (boostId, userId) => {
    if (!isSupabaseConfigured) {
      return { success: true, message: 'Boost renouvelé avec succès (mode test)' };
    }

    try {
      // Récupérer les détails du boost actuel
      const { data: currentBoost, error: boostError } = await supabase
        .from('listing_boosts')
        .select(`
          *,
          boost_packages (
            duration_days,
            price
          )
        `)
        .eq('id', boostId)
        .eq('user_id', userId)
        .single();

      if (boostError || !currentBoost) {
        throw new Error('Boost non trouvé ou non autorisé');
      }

      // Calculer la nouvelle date de fin
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + currentBoost.boost_packages.duration_days);

      // Mettre à jour la date de fin
      const { error: updateError } = await supabase
        .from('listing_boosts')
        .update({
          end_date: newEndDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', boostId);

      if (updateError) throw updateError;

      // Enregistrer dans l'historique
      await supabase
        .from('boost_history')
        .insert({
          listing_id: currentBoost.listing_id,
          boost_id: boostId,
          user_id: userId,
          action: 'renewed',
          details: {
            new_end_date: newEndDate.toISOString(),
            renewed_at: new Date().toISOString()
          }
        });

      return { success: true, message: 'Boost renouvelé avec succès' };
    } catch (error) {
      console.error('Erreur lors du renouvellement du boost:', error);
      throw error;
    }
  },

  // Récupérer les statistiques de boost pour une annonce
  getBoostStats: async (listingId) => {
    if (!isSupabaseConfigured) {
      return {
        total_boosts: 0,
        active_boosts: 0,
        total_days: 0,
        total_investment: 0,
        current_boost: null
      };
    }

    try {
      const { data, error } = await supabase
        .rpc('get_boost_stats', { listing_id_param: listingId });

      if (error) throw error;
      return data || {};
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de boost:', error);
      throw error;
    }
  }
};

export default boostService;
