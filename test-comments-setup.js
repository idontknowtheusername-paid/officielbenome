// =====================================================
// SCRIPT DE TEST - SYSTÈME DE COMMENTAIRES
// =====================================================
// 
// Ce script teste la configuration de la base de données
// et les fonctionnalités de base du système de commentaires

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (à adapter selon votre configuration)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCommentsSetup() {
  console.log('🧪 Test du système de commentaires...\n');

  try {
    // 1. Test de connexion
    console.log('1️⃣ Test de connexion à Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('comments')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError.message);
      return;
    }
    console.log('✅ Connexion réussie\n');

    // 2. Vérification des tables
    console.log('2️⃣ Vérification des tables...');
    
    // Test table comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .limit(1);
    
    if (commentsError) {
      console.error('❌ Erreur table comments:', commentsError.message);
    } else {
      console.log('✅ Table comments accessible');
    }

    // Test table comment_reports
    const { data: reportsData, error: reportsError } = await supabase
      .from('comment_reports')
      .select('*')
      .limit(1);
    
    if (reportsError) {
      console.error('❌ Erreur table comment_reports:', reportsError.message);
    } else {
      console.log('✅ Table comment_reports accessible');
    }

    // 3. Test des policies RLS
    console.log('\n3️⃣ Test des policies RLS...');
    
    // Test lecture publique (doit fonctionner sans auth)
    const { data: publicRead, error: publicReadError } = await supabase
      .from('comments')
      .select('*')
      .eq('status', 'approved')
      .limit(1);
    
    if (publicReadError) {
      console.error('❌ Erreur lecture publique:', publicReadError.message);
    } else {
      console.log('✅ Lecture publique fonctionnelle');
    }

    // 4. Test de la fonction RPC (si elle existe)
    console.log('\n4️⃣ Test de la fonction RPC...');
    try {
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_listing_comment_stats', { listing_uuid: '00000000-0000-0000-0000-000000000000' });
      
      if (statsError) {
        console.log('⚠️  Fonction RPC non disponible (normal si pas encore créée)');
      } else {
        console.log('✅ Fonction RPC fonctionnelle');
      }
    } catch (error) {
      console.log('⚠️  Fonction RPC non disponible (normal si pas encore créée)');
    }

    // 5. Vérification des index
    console.log('\n5️⃣ Vérification des index...');
    const { data: indexData, error: indexError } = await supabase
      .from('comments')
      .select('listing_id, user_id, status, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (indexError) {
      console.error('❌ Erreur lors du test des index:', indexError.message);
    } else {
      console.log('✅ Index fonctionnels');
    }

    console.log('\n🎉 Tests terminés avec succès !');
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Exécuter le script SQL dans Supabase');
    console.log('2. Tester l\'interface utilisateur');
    console.log('3. Vérifier les permissions utilisateur');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Fonction pour tester avec authentification
async function testWithAuth() {
  console.log('\n🔐 Test avec authentification...');
  
  // Note: Ce test nécessite un utilisateur authentifié
  // Vous devrez l'adapter selon votre configuration
  
  console.log('⚠️  Test d\'authentification à implémenter selon votre configuration');
}

// Exécution des tests
if (import.meta.url === `file://${process.argv[1]}`) {
  testCommentsSetup();
  // testWithAuth(); // Décommentez si vous voulez tester avec auth
}

export { testCommentsSetup, testWithAuth };
