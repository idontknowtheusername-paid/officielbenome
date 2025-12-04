import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createTestTransactions() {
  console.log('🔍 Création de transactions de test...\n');

  try {
    // 1. Récupérer les boosts existants
    console.log('📊 Récupération des boosts...');
    const { data: boosts, error: boostsError } = await supabase
      .from('listing_boosts')
      .select(`
        *,
        listing:listings(id, title, user_id),
        package:boost_packages(id, name, price)
      `);

    if (boostsError) {
      console.error('❌ Erreur boosts:', boostsError.message);
      return;
    }

    console.log(`✅ ${boosts?.length || 0} boosts trouvés`);

    if (!boosts || boosts.length === 0) {
      console.log('ℹ️  Aucun boost trouvé. Créez d\'abord des boosts via l\'application.');
      return;
    }

    // 2. Créer des transactions pour chaque boost
    console.log('\n💳 Création des transactions...');
    
    const transactions = [];
    for (const boost of boosts) {
      if (!boost.listing?.user_id || !boost.package?.price) {
        console.log(`⚠️  Boost ${boost.id.slice(0, 8)} ignoré (données manquantes)`);
        continue;
      }

      const transaction = {
        user_id: boost.listing.user_id,
        listing_id: boost.listing_id,
        amount: boost.package.price,
        currency: 'XOF',
        transaction_type: 'boost',
        status: boost.status === 'active' ? 'completed' : 'pending',
        payment_method: 'lygos',
        payment_reference: `BOOST-${boost.id.slice(0, 8).toUpperCase()}`,
        description: `Boost ${boost.package.name} pour "${boost.listing.title}"`,
        metadata: {
          boost_id: boost.id,
          package_id: boost.package_id,
          package_name: boost.package.name
        }
      };

      transactions.push(transaction);
    }

    if (transactions.length === 0) {
      console.log('⚠️  Aucune transaction à créer');
      return;
    }

    // 3. Insérer les transactions
    const { data: inserted, error: insertError } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();

    if (insertError) {
      console.error('❌ Erreur insertion:', insertError.message);
      return;
    }

    console.log(`✅ ${inserted.length} transactions créées avec succès!`);

    // 4. Afficher le résumé
    const totalRevenue = inserted
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    console.log('\n📊 Résumé:');
    console.log(`   - Total transactions: ${inserted.length}`);
    console.log(`   - Complétées: ${inserted.filter(t => t.status === 'completed').length}`);
    console.log(`   - En attente: ${inserted.filter(t => t.status === 'pending').length}`);
    console.log(`   - Revenu total: ${totalRevenue.toLocaleString('fr-FR')} XOF`);

    console.log('\n✅ Terminé! Rechargez le dashboard admin pour voir les statistiques.');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

createTestTransactions();
