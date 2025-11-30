// ============================================================================
// SCRIPT DE TEST - FLUX COMPLET DES TRANSACTIONS
// ============================================================================
// Ce script teste le flux complet : Boost → Paiement → Transaction

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTransactionsFlow() {
  console.log('🧪 Test du flux des transactions\n');

  try {
    // 1. Vérifier les packages de boost
    console.log('1️⃣ Vérification des packages de boost...');
    const { data: packages, error: packagesError } = await supabase
      .from('boost_packages')
      .select('*')
      .eq('is_active', true);

    if (packagesError) throw packagesError;
    console.log(`✅ ${packages.length} packages trouvés`);
    packages.forEach(pkg => {
      console.log(`   - ${pkg.name}: ${pkg.price} XOF (${pkg.duration_days} jours)`);
    });

    // 2. Vérifier les boosts existants
    console.log('\n2️⃣ Vérification des boosts...');
    const { data: boosts, error: boostsError } = await supabase
      .from('listing_boosts')
      .select(`
        *,
        boost_packages (name, price),
        listings (title)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (boostsError) throw boostsError;
    console.log(`✅ ${boosts.length} boosts récents trouvés`);
    boosts.forEach(boost => {
      console.log(`   - ${boost.listings?.title || 'N/A'} - ${boost.status} - ${boost.boost_packages?.name || 'N/A'}`);
    });

    // 3. Vérifier les transactions
    console.log('\n3️⃣ Vérification des transactions...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        *,
        listing:listings (title),
        sender:users!transactions_sender_id_fkey (full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsError) throw transactionsError;
    console.log(`✅ ${transactions.length} transactions trouvées`);
    
    if (transactions.length === 0) {
      console.log('⚠️  Aucune transaction trouvée - C\'est normal si aucun boost n\'a été payé');
    } else {
      console.log('\n📊 Détails des transactions:');
      transactions.forEach(tx => {
        console.log(`\n   Transaction: ${tx.id.slice(0, 8)}`);
        console.log(`   - Type: ${tx.type || 'N/A'}`);
        console.log(`   - Montant: ${tx.amount} ${tx.currency}`);
        console.log(`   - Statut: ${tx.status}`);
        console.log(`   - Description: ${tx.description || 'N/A'}`);
        console.log(`   - Référence: ${tx.payment_reference || 'N/A'}`);
        console.log(`   - Méthode: ${tx.payment_method || 'N/A'}`);
        console.log(`   - Annonce: ${tx.listing?.title || 'N/A'}`);
        console.log(`   - Utilisateur: ${tx.sender?.full_name || 'N/A'}`);
        console.log(`   - Date: ${new Date(tx.created_at).toLocaleString('fr-FR')}`);
        
        if (tx.metadata) {
          console.log(`   - Metadata:`, JSON.stringify(tx.metadata, null, 2));
        }
      });
    }

    // 4. Statistiques
    console.log('\n4️⃣ Statistiques globales:');
    const { data: stats } = await supabase
      .from('transactions')
      .select('status, amount, type');

    if (stats) {
      const byStatus = stats.reduce((acc, tx) => {
        acc[tx.status] = (acc[tx.status] || 0) + 1;
        return acc;
      }, {});

      const byType = stats.reduce((acc, tx) => {
        acc[tx.type || 'unknown'] = (acc[tx.type || 'unknown'] || 0) + 1;
        return acc;
      }, {});

      const totalAmount = stats
        .filter(tx => tx.status === 'completed')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);

      console.log(`   Total transactions: ${stats.length}`);
      console.log(`   Par statut:`, byStatus);
      console.log(`   Par type:`, byType);
      console.log(`   Montant total (complétées): ${totalAmount.toLocaleString('fr-FR')} XOF`);
    }

    // 5. Vérifier la structure de la table transactions
    console.log('\n5️⃣ Vérification de la structure de la table...');
    const { data: sampleTx } = await supabase
      .from('transactions')
      .select('*')
      .limit(1)
      .single();

    if (sampleTx) {
      console.log('✅ Colonnes disponibles:', Object.keys(sampleTx).join(', '));
    }

    console.log('\n✅ Test terminé avec succès!');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    console.error(error);
  }
}

// Exécuter le test
testTransactionsFlow();
