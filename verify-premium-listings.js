// ============================================================================
// SCRIPT DE VÉRIFICATION - ANNONCES PREMIUM
// ============================================================================
// Ce script vérifie quelles annonces sont considérées comme premium

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPremiumListings() {
  console.log('🔍 Vérification des annonces premium\n');

  try {
    // 1. Récupérer toutes les annonces avec is_featured ou is_boosted
    console.log('1️⃣ Récupération des annonces premium...');
    const { data: premiumListings, error } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        is_featured,
        is_boosted,
        boost_expires_at,
        status,
        created_at,
        updated_at,
        user_id,
        users (
          first_name,
          last_name,
          email
        )
      `)
      .or('is_featured.eq.true,is_boosted.eq.true')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ ${premiumListings.length} annonces premium trouvées\n`);

    // 2. Analyser chaque annonce
    console.log('📊 Détails des annonces premium:\n');
    
    const featured = [];
    const boosted = [];
    const both = [];
    const expired = [];

    premiumListings.forEach((listing, index) => {
      const isFeatured = listing.is_featured;
      const isBoosted = listing.is_boosted;
      const expiresAt = listing.boost_expires_at ? new Date(listing.boost_expires_at) : null;
      const isExpired = expiresAt && expiresAt < new Date();

      console.log(`\n${index + 1}. ${listing.title}`);
      console.log(`   ID: ${listing.id.slice(0, 8)}`);
      console.log(`   Utilisateur: ${listing.users?.first_name} ${listing.users?.last_name} (${listing.users?.email})`);
      console.log(`   is_featured: ${isFeatured ? '✅' : '❌'}`);
      console.log(`   is_boosted: ${isBoosted ? '✅' : '❌'}`);
      
      if (expiresAt) {
        const daysRemaining = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`   Expire le: ${expiresAt.toLocaleDateString('fr-FR')} (${daysRemaining} jours)`);
        console.log(`   Statut: ${isExpired ? '🔴 EXPIRÉ' : '🟢 ACTIF'}`);
      } else {
        console.log(`   Expire le: N/A`);
      }
      
      console.log(`   Créé le: ${new Date(listing.created_at).toLocaleDateString('fr-FR')}`);
      console.log(`   Mis à jour: ${new Date(listing.updated_at).toLocaleDateString('fr-FR')}`);

      // Catégoriser
      if (isExpired) {
        expired.push(listing);
      } else if (isFeatured && isBoosted) {
        both.push(listing);
      } else if (isFeatured) {
        featured.push(listing);
      } else if (isBoosted) {
        boosted.push(listing);
      }
    });

    // 3. Statistiques
    console.log('\n\n📈 Statistiques:');
    console.log(`   Total premium: ${premiumListings.length}`);
    console.log(`   Featured uniquement: ${featured.length}`);
    console.log(`   Boosted uniquement: ${boosted.length}`);
    console.log(`   Featured + Boosted: ${both.length}`);
    console.log(`   Expirés: ${expired.length}`);

    // 4. Vérifier les boosts actifs
    console.log('\n\n2️⃣ Vérification des boosts actifs...');
    const { data: activeBoosts, error: boostsError } = await supabase
      .from('listing_boosts')
      .select(`
        *,
        boost_packages (name, price, duration_days),
        listings (id, title, is_boosted)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (boostsError) throw boostsError;

    console.log(`✅ ${activeBoosts.length} boosts actifs trouvés\n`);

    activeBoosts.forEach((boost, index) => {
      const daysRemaining = Math.ceil((new Date(boost.end_date) - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`\n${index + 1}. ${boost.listings?.title || 'N/A'}`);
      console.log(`   Package: ${boost.boost_packages?.name || 'N/A'}`);
      console.log(`   Prix: ${boost.boost_packages?.price || 'N/A'} XOF`);
      console.log(`   Durée: ${boost.boost_packages?.duration_days || 'N/A'} jours`);
      console.log(`   Jours restants: ${daysRemaining}`);
      console.log(`   is_boosted dans listings: ${boost.listings?.is_boosted ? '✅' : '❌'}`);
      console.log(`   Référence paiement: ${boost.payment_reference || 'N/A'}`);
    });

    // 5. Recommandations
    console.log('\n\n💡 Recommandations:');
    
    if (expired.length > 0) {
      console.log(`\n⚠️  ${expired.length} annonce(s) expirée(s) à nettoyer:`);
      expired.forEach(listing => {
        console.log(`   - ${listing.title} (${listing.id.slice(0, 8)})`);
      });
      console.log('\n   Commande SQL pour nettoyer:');
      console.log(`   UPDATE listings SET is_boosted = false, boost_expires_at = NULL WHERE id IN ('${expired.map(l => l.id).join("','")}');`);
    }

    if (featured.length > 0) {
      console.log(`\n📌 ${featured.length} annonce(s) avec is_featured = true (probablement des données de test)`);
    }

    console.log('\n✅ Vérification terminée!');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error);
  }
}

// Exécuter la vérification
verifyPremiumListings();
