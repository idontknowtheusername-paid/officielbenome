#!/usr/bin/env node

/**
 * Script de test de l'intégration Brevo
 * Usage: node test-brevo-integration.js
 */

import { brevoService } from './src/services/email/brevo.service.js';
import { brevoCampaignsService } from './src/services/email/brevo-campaigns.service.js';
import { brevoListsService } from './src/services/email/brevo-lists.service.js';
import { emailProviderService } from './src/services/email/email-provider.service.js';

console.log('🧪 Test de l\'intégration Brevo pour MaxiMarket\n');

// ============================================================================
// TEST 1 : Vérification de la configuration
// ============================================================================
async function testConfiguration() {
  console.log('📋 Test 1 : Vérification de la configuration');
  console.log('─'.repeat(50));
  
  try {
    const config = brevoService.checkConfiguration();
    console.log('✅ Configuration Brevo:', JSON.stringify(config, null, 2));
    
    const providerConfig = emailProviderService.checkConfiguration();
    console.log('✅ Configuration Provider:', JSON.stringify(providerConfig, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration:', error.message);
    return false;
  }
}

// ============================================================================
// TEST 2 : Envoi d'email simple
// ============================================================================
async function testSimpleEmail() {
  console.log('\n📧 Test 2 : Envoi d\'email simple');
  console.log('─'.repeat(50));
  
  try {
    const result = await brevoService.sendEmail(
      'test@example.com',
      'Test MaxiMarket - Email Simple',
      '<h1>Test d\'intégration Brevo</h1><p>Ceci est un email de test depuis MaxiMarket.</p>',
      'Test d\'intégration Brevo - Ceci est un email de test depuis MaxiMarket.'
    );
    
    console.log('✅ Email simple envoyé:', result);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email simple:', error.message);
    return false;
  }
}

// ============================================================================
// TEST 3 : Envoi avec template
// ============================================================================
async function testTemplateEmail() {
  console.log('\n📝 Test 3 : Envoi avec template');
  console.log('─'.repeat(50));
  
  try {
    const result = await emailProviderService.sendWelcomeEmail(
      'test@example.com',
      'John Doe'
    );
    
    console.log('✅ Email template envoyé:', result);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi template:', error.message);
    console.log('ℹ️  Assurez-vous d\'avoir créé le template dans Brevo');
    return false;
  }
}

// ============================================================================
// TEST 4 : Gestion des contacts
// ============================================================================
async function testContactManagement() {
  console.log('\n👤 Test 4 : Gestion des contacts');
  console.log('─'.repeat(50));
  
  try {
    // Créer un contact
    const createResult = await brevoService.createOrUpdateContact(
      'test@example.com',
      {
        FIRSTNAME: 'John',
        LASTNAME: 'Doe',
        SMS: '+221771234567'
      },
      [] // Pas de liste pour le test
    );
    console.log('✅ Contact créé/mis à jour:', createResult);
    
    // Récupérer le contact
    const getResult = await brevoService.getContact('test@example.com');
    console.log('✅ Contact récupéré:', getResult.contact ? 'Trouvé' : 'Non trouvé');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur gestion contacts:', error.message);
    return false;
  }
}

// ============================================================================
// TEST 5 : Gestion des listes
// ============================================================================
async function testListManagement() {
  console.log('\n📋 Test 5 : Gestion des listes');
  console.log('─'.repeat(50));
  
  try {
    // Récupérer toutes les listes
    const listsResult = await brevoListsService.getAllLists(10, 0);
    console.log('✅ Listes récupérées:', listsResult.lists?.length || 0, 'listes');
    
    if (listsResult.lists && listsResult.lists.length > 0) {
      console.log('📋 Première liste:', listsResult.lists[0].name);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur gestion listes:', error.message);
    return false;
  }
}

// ============================================================================
// TEST 6 : Gestion des campagnes
// ============================================================================
async function testCampaignManagement() {
  console.log('\n📊 Test 6 : Gestion des campagnes');
  console.log('─'.repeat(50));
  
  try {
    // Récupérer les campagnes
    const campaignsResult = await brevoCampaignsService.getAllCampaigns({
      limit: 10,
      offset: 0
    });
    console.log('✅ Campagnes récupérées:', campaignsResult.campaigns?.length || 0, 'campagnes');
    
    // Obtenir les statistiques
    const statsResult = await brevoCampaignsService.getCampaignsStats();
    console.log('✅ Statistiques campagnes:', JSON.stringify(statsResult.stats, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Erreur gestion campagnes:', error.message);
    return false;
  }
}

// ============================================================================
// TEST 7 : Envoi en batch
// ============================================================================
async function testBatchEmail() {
  console.log('\n📬 Test 7 : Envoi en batch');
  console.log('─'.repeat(50));
  
  try {
    const recipients = [
      { email: 'test1@example.com', name: 'User 1' },
      { email: 'test2@example.com', name: 'User 2' },
      { email: 'test3@example.com', name: 'User 3' }
    ];
    
    const result = await brevoService.sendBatchEmail(
      recipients,
      'Test MaxiMarket - Batch Email',
      '<h1>Email de test en batch</h1><p>Ceci est un test d\'envoi groupé.</p>'
    );
    
    console.log('✅ Batch email envoyé:', result);
    return true;
  } catch (error) {
    console.error('❌ Erreur batch email:', error.message);
    return false;
  }
}

// ============================================================================
// TEST 8 : Provider avec fallback
// ============================================================================
async function testProviderFallback() {
  console.log('\n🔄 Test 8 : Provider avec fallback');
  console.log('─'.repeat(50));
  
  try {
    const activeProvider = emailProviderService.getActiveProvider();
    console.log('✅ Provider actif:', activeProvider);
    
    const result = await emailProviderService.sendEmail(
      'test@example.com',
      'Test MaxiMarket - Provider',
      '<h1>Test du provider</h1><p>Test avec fallback automatique.</p>'
    );
    
    console.log('✅ Email envoyé via provider:', result);
    return true;
  } catch (error) {
    console.error('❌ Erreur provider:', error.message);
    return false;
  }
}

// ============================================================================
// EXÉCUTION DES TESTS
// ============================================================================
async function runAllTests() {
  console.log('🚀 Démarrage des tests d\'intégration Brevo\n');
  console.log('═'.repeat(50));
  
  const results = {
    configuration: await testConfiguration(),
    simpleEmail: await testSimpleEmail(),
    templateEmail: await testTemplateEmail(),
    contactManagement: await testContactManagement(),
    listManagement: await testListManagement(),
    campaignManagement: await testCampaignManagement(),
    batchEmail: await testBatchEmail(),
    providerFallback: await testProviderFallback()
  };
  
  console.log('\n═'.repeat(50));
  console.log('📊 RÉSULTATS DES TESTS');
  console.log('═'.repeat(50));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌';
    console.log(`${icon} ${test}: ${result ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
  });
  
  console.log('\n' + '═'.repeat(50));
  console.log(`📈 Score: ${passed}/${total} tests réussis (${Math.round(passed/total*100)}%)`);
  console.log('═'.repeat(50));
  
  if (passed === total) {
    console.log('\n🎉 Tous les tests sont passés ! L\'intégration Brevo est fonctionnelle.');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez la configuration.');
    console.log('ℹ️  Consultez le guide: GUIDE_CONFIGURATION_BREVO.md');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Exécuter les tests
runAllTests().catch(error => {
  console.error('\n💥 Erreur fatale:', error);
  process.exit(1);
});
