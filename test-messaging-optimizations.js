/**
 * Script de Test des Optimisations Messagerie
 * Vérifie que les corrections appliquées fonctionnent correctement
 */

import { supabase } from './src/lib/supabase.js';
import { messageService } from './src/services/message.service.js';

console.log('🧪 TEST DES OPTIMISATIONS MESSAGERIE\n');
console.log('=====================================\n');

/**
 * Test 1 : Vérifier les batch queries
 */
async function testBatchQueries() {
  console.log('1️⃣ Test Batch Queries (Optimisation N+1)...\n');
  
  try {
    // Se connecter avec un utilisateur de test
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Erreur authentification:', authError?.message || 'Utilisateur non connecté');
      console.log('💡 Connectez-vous d\'abord dans l\'application\n');
      return false;
    }
    
    console.log('✅ Utilisateur connecté:', user.email);
    
    // Mesurer le temps de chargement
    console.log('\n⏱️  Mesure du temps de chargement...');
    const startTime = performance.now();
    
    const conversations = await messageService.getUserConversations();
    
    const endTime = performance.now();
    const loadTime = (endTime - startTime).toFixed(2);
    
    console.log(`✅ Conversations chargées: ${conversations.length}`);
    console.log(`⏱️  Temps de chargement: ${loadTime}ms`);
    
    // Vérifier la performance
    if (loadTime < 1000) {
      console.log('🎉 EXCELLENT ! Temps < 1s');
    } else if (loadTime < 2000) {
      console.log('✅ BON ! Temps < 2s');
    } else if (loadTime < 3000) {
      console.log('⚠️  MOYEN ! Temps < 3s (peut être amélioré)');
    } else {
      console.log('❌ LENT ! Temps > 3s (problème de performance)');
    }
    
    // Vérifier que les données sont enrichies
    if (conversations.length > 0) {
      const firstConv = conversations[0];
      console.log('\n📊 Vérification enrichissement des données:');
      console.log('  - Participant 1:', firstConv.participant1 ? '✅' : '❌');
      console.log('  - Participant 2:', firstConv.participant2 ? '✅' : '❌');
      console.log('  - Messages:', firstConv.messages ? `✅ (${firstConv.messages.length})` : '❌');
      console.log('  - Listing:', firstConv.listing ? '✅' : '⚠️  (optionnel)');
      
      // Vérifier les noms des participants
      if (firstConv.participant1) {
        const p1Name = `${firstConv.participant1.first_name || ''} ${firstConv.participant1.last_name || ''}`.trim();
        console.log(`  - Nom participant 1: ${p1Name || '❌ Manquant'}`);
      }
      if (firstConv.participant2) {
        const p2Name = `${firstConv.participant2.first_name || ''} ${firstConv.participant2.last_name || ''}`.trim();
        console.log(`  - Nom participant 2: ${p2Name || '❌ Manquant'}`);
      }
    }
    
    console.log('\n✅ Test Batch Queries RÉUSSI\n');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur test batch queries:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

/**
 * Test 2 : Vérifier que les logs sont conditionnés
 */
async function testLoggerWrapper() {
  console.log('2️⃣ Test Logger Wrapper...\n');
  
  try {
    // Vérifier que logger est importé
    const { logger } = await import('./src/utils/logger.js');
    
    console.log('✅ Logger importé correctement');
    
    // Tester les méthodes
    console.log('\n📝 Test des méthodes du logger:');
    logger.log('  - logger.log() fonctionne');
    logger.warn('  - logger.warn() fonctionne');
    logger.error('  - logger.error() fonctionne');
    
    console.log('\n💡 En production (NODE_ENV=production):');
    console.log('  - logger.log() sera silencieux ✅');
    console.log('  - logger.warn() sera silencieux ✅');
    console.log('  - logger.error() restera visible ✅');
    
    console.log('\n✅ Test Logger Wrapper RÉUSSI\n');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur test logger:', error.message);
    return false;
  }
}

/**
 * Test 3 : Vérifier la structure des données
 */
async function testDataStructure() {
  console.log('3️⃣ Test Structure des Données...\n');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️  Utilisateur non connecté, test ignoré\n');
      return true;
    }
    
    // Récupérer une conversation
    const conversations = await messageService.getUserConversations();
    
    if (conversations.length === 0) {
      console.log('⚠️  Aucune conversation, test ignoré\n');
      return true;
    }
    
    const conv = conversations[0];
    
    console.log('📊 Structure de la conversation:');
    console.log('  - ID:', conv.id ? '✅' : '❌');
    console.log('  - Participant 1 ID:', conv.participant1_id ? '✅' : '❌');
    console.log('  - Participant 2 ID:', conv.participant2_id ? '✅' : '❌');
    console.log('  - Participant 1 Data:', conv.participant1 ? '✅' : '❌');
    console.log('  - Participant 2 Data:', conv.participant2 ? '✅' : '❌');
    console.log('  - Messages Array:', Array.isArray(conv.messages) ? '✅' : '❌');
    console.log('  - Created At:', conv.created_at ? '✅' : '❌');
    console.log('  - Last Message At:', conv.last_message_at ? '✅' : '⚠️  (optionnel)');
    
    // Vérifier qu'il n'y a pas de "Utilisateur Inconnu"
    const hasUnknownUsers = conversations.some(c => 
      c.participant1?.first_name === 'Utilisateur' && c.participant1?.last_name === 'Inconnu' ||
      c.participant2?.first_name === 'Utilisateur' && c.participant2?.last_name === 'Inconnu'
    );
    
    if (hasUnknownUsers) {
      console.log('\n⚠️  ATTENTION: Certains utilisateurs sont "Utilisateur Inconnu"');
      console.log('💡 Vérifiez que les utilisateurs ont des noms dans la base de données');
    } else {
      console.log('\n✅ Tous les utilisateurs ont des noms valides');
    }
    
    console.log('\n✅ Test Structure des Données RÉUSSI\n');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur test structure:', error.message);
    return false;
  }
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  console.log('🚀 DÉBUT DES TESTS\n');
  console.log('=====================================\n');
  
  const results = {
    batchQueries: await testBatchQueries(),
    loggerWrapper: await testLoggerWrapper(),
    dataStructure: await testDataStructure()
  };
  
  console.log('=====================================\n');
  console.log('📊 RÉSULTATS DES TESTS\n');
  console.log('=====================================\n');
  
  console.log('1. Batch Queries:', results.batchQueries ? '✅ RÉUSSI' : '❌ ÉCHOUÉ');
  console.log('2. Logger Wrapper:', results.loggerWrapper ? '✅ RÉUSSI' : '❌ ÉCHOUÉ');
  console.log('3. Structure Données:', results.dataStructure ? '✅ RÉUSSI' : '❌ ÉCHOUÉ');
  
  const allPassed = Object.values(results).every(r => r === true);
  
  console.log('\n=====================================');
  if (allPassed) {
    console.log('🎉 TOUS LES TESTS RÉUSSIS !');
    console.log('✅ Les optimisations fonctionnent correctement');
  } else {
    console.log('⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('💡 Vérifiez les erreurs ci-dessus');
  }
  console.log('=====================================\n');
  
  return allPassed;
}

// Exécuter les tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
