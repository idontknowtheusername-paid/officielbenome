import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testAdminStats() {
  console.log('🔍 Test des statistiques admin...\n');

  try {
    // 1. Vérifier les transactions
    console.log('📊 Récupération des transactions...');
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*');

    if (transError) {
      console.error('❌ Erreur transactions:', transError.message);
    } else {
      console.log(`✅ Transactions trouvées: ${transactions?.length || 0}`);
      
      if (transactions && transactions.length > 0) {
        const completed = transactions.filter(t => t.status === 'completed');
        const totalRevenue = completed.reduce((sum, t) => sum + (t.amount || 0), 0);
        
        console.log(`   - Complétées: ${completed.length}`);
        console.log(`   - En attente: ${transactions.filter(t => t.status === 'pending').length}`);
        console.log(`   - Échouées: ${transactions.filter(t => t.status === 'failed').length}`);
        console.log(`   - Revenu total: ${totalRevenue.toLocaleString('fr-FR')} XOF`);
        
        // Afficher quelques exemples
        console.log('\n   Exemples de transactions:');
        transactions.slice(0, 3).forEach(t => {
          console.log(`   - ${t.payment_reference || t.id.slice(0, 8)}: ${t.amount} ${t.currency} (${t.status})`);
        });
      }
    }

    // 2. Vérifier les utilisateurs
    console.log('\n👥 Récupération des utilisateurs...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, status, role');

    if (usersError) {
      console.error('❌ Erreur utilisateurs:', usersError.message);
    } else {
      console.log(`✅ Utilisateurs trouvés: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log(`   - Actifs: ${users.filter(u => u.status === 'active').length}`);
        console.log(`   - Admins: ${users.filter(u => u.role === 'admin').length}`);
      }
    }

    // 3. Vérifier les annonces
    console.log('\n📋 Récupération des annonces...');
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, status, price');

    if (listingsError) {
      console.error('❌ Erreur annonces:', listingsError.message);
    } else {
      console.log(`✅ Annonces trouvées: ${listings?.length || 0}`);
      if (listings && listings.length > 0) {
        console.log(`   - En attente: ${listings.filter(l => l.status === 'pending').length}`);
        console.log(`   - Approuvées: ${listings.filter(l => l.status === 'approved').length}`);
        console.log(`   - Rejetées: ${listings.filter(l => l.status === 'rejected').length}`);
      }
    }

    // 4. Vérifier les boosts
    console.log('\n🚀 Récupération des boosts...');
    const { data: boosts, error: boostsError } = await supabase
      .from('boosts')
      .select('*');

    if (boostsError) {
      console.error('❌ Erreur boosts:', boostsError.message);
    } else {
      console.log(`✅ Boosts trouvés: ${boosts?.length || 0}`);
      if (boosts && boosts.length > 0) {
        console.log(`   - Actifs: ${boosts.filter(b => b.status === 'active').length}`);
        console.log(`   - Complétés: ${boosts.filter(b => b.status === 'completed').length}`);
      }
    }

    console.log('\n✅ Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testAdminStats();
