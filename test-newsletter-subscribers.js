#!/usr/bin/env node

/**
 * Test et affichage des abonnés newsletter
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSubscribers() {
  console.log('📧 Test des abonnés newsletter MaxiMarket\n');
  console.log('='.repeat(60));

  // 1. Récupérer tous les abonnés
  console.log('\n1️⃣ Récupération de tous les abonnés...');
  const { data: allSubscribers, error: allError } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('❌ Erreur:', allError.message);
    return;
  }

  console.log(`✅ ${allSubscribers.length} abonnés trouvés\n`);

  // 2. Statistiques
  const active = allSubscribers.filter(s => s.is_active).length;
  const inactive = allSubscribers.length - active;

  console.log('📊 STATISTIQUES');
  console.log('='.repeat(60));
  console.log(`Total abonnés:     ${allSubscribers.length}`);
  console.log(`Abonnés actifs:    ${active} (${((active/allSubscribers.length)*100).toFixed(1)}%)`);
  console.log(`Abonnés inactifs:  ${inactive} (${((inactive/allSubscribers.length)*100).toFixed(1)}%)`);

  // 3. Liste des abonnés actifs
  console.log('\n✅ ABONNÉS ACTIFS');
  console.log('='.repeat(60));
  
  const activeSubscribers = allSubscribers.filter(s => s.is_active);
  if (activeSubscribers.length > 0) {
    activeSubscribers.forEach((sub, index) => {
      const date = new Date(sub.subscribed_at).toLocaleDateString('fr-FR');
      const source = sub.source || 'N/A';
      console.log(`${index + 1}. ${sub.email}`);
      console.log(`   📅 Inscrit le: ${date}`);
      console.log(`   📍 Source: ${source}`);
      console.log('');
    });
  } else {
    console.log('Aucun abonné actif');
  }

  // 4. Liste des abonnés inactifs
  if (inactive > 0) {
    console.log('❌ ABONNÉS INACTIFS');
    console.log('='.repeat(60));
    
    const inactiveSubscribers = allSubscribers.filter(s => !s.is_active);
    inactiveSubscribers.forEach((sub, index) => {
      const date = new Date(sub.unsubscribed_at || sub.updated_at).toLocaleDateString('fr-FR');
      console.log(`${index + 1}. ${sub.email}`);
      console.log(`   📅 Désinscrit le: ${date}`);
      console.log('');
    });
  }

  // 5. Répartition par source
  console.log('📍 RÉPARTITION PAR SOURCE');
  console.log('='.repeat(60));
  
  const sources = {};
  allSubscribers.forEach(sub => {
    const source = sub.source || 'Non spécifié';
    sources[source] = (sources[source] || 0) + 1;
  });

  Object.entries(sources).forEach(([source, count]) => {
    const percentage = ((count / allSubscribers.length) * 100).toFixed(1);
    console.log(`${source}: ${count} (${percentage}%)`);
  });

  // 6. Abonnements récents (7 derniers jours)
  console.log('\n🆕 ABONNEMENTS RÉCENTS (7 derniers jours)');
  console.log('='.repeat(60));
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentSubscribers = allSubscribers.filter(sub => 
    new Date(sub.subscribed_at) > sevenDaysAgo
  );

  if (recentSubscribers.length > 0) {
    console.log(`${recentSubscribers.length} nouveaux abonnés cette semaine`);
    recentSubscribers.forEach((sub, index) => {
      const date = new Date(sub.subscribed_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      console.log(`${index + 1}. ${sub.email} - ${date}`);
    });
  } else {
    console.log('Aucun nouvel abonné cette semaine');
  }

  // 7. Test d'envoi potentiel
  console.log('\n📧 SIMULATION D\'ENVOI');
  console.log('='.repeat(60));
  console.log(`Une campagne serait envoyée à ${active} destinataires actifs`);
  
  if (active > 0) {
    console.log('\n💡 Prêt pour l\'envoi de campagnes !');
    console.log('   Utilisez l\'admin newsletter: /admin/newsletter');
  } else {
    console.log('\n⚠️  Aucun abonné actif. Ajoutez des abonnés avant d\'envoyer des campagnes.');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test terminé');
  console.log('='.repeat(60));
}

testSubscribers().catch(console.error);
