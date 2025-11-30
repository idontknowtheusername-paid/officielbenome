#!/usr/bin/env node

/**
 * Test réel de l'API Brevo avec la clé configurée
 */

import brevo from '@getbrevo/brevo';

const BREVO_API_KEY = 'xkeysib-c4acfd956bef553227031115f67a22e8e2981567732789563563aafa50370813-14FmpTuJlYK84hLSj';

console.log('🧪 Test réel de l\'API Brevo\n');

// Initialiser l'API
const defaultClient = brevo.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = BREVO_API_KEY;

const apiInstance = new brevo.TransactionalEmailsApi();
const contactsApi = new brevo.ContactsApi();

// ============================================================================
// TEST 1 : Vérifier le compte
// ============================================================================
async function testAccount() {
  console.log('📋 Test 1 : Vérification du compte Brevo');
  console.log('─'.repeat(50));
  
  try {
    const accountApi = new brevo.AccountApi();
    const account = await accountApi.getAccount();
    
    console.log('✅ Compte Brevo vérifié:');
    console.log('   Email:', account.body.email);
    console.log('   Plan:', account.body.plan[0]?.type || 'Free');
    console.log('   Crédits emails:', account.body.plan[0]?.credits || 'Illimité');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// ============================================================================
// TEST 2 : Envoyer un email de test
// ============================================================================
async function testSendEmail() {
  console.log('\n📧 Test 2 : Envoi d\'un email de test');
  console.log('─'.repeat(50));
  
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: 'MaxiMarket', email: 'noreply@maximarket.com' };
    sendSmtpEmail.to = [{ email: 'test@example.com' }];
    sendSmtpEmail.subject = 'Test MaxiMarket - Intégration Brevo';
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>Test d'intégration Brevo</h1>
          <p>Ceci est un email de test depuis MaxiMarket.</p>
          <p>Si vous recevez cet email, l'intégration fonctionne parfaitement !</p>
        </body>
      </html>
    `;

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Email envoyé avec succès !');
    console.log('   Message ID:', response.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('   Détails:', error.response.body);
    }
    return false;
  }
}

// ============================================================================
// TEST 3 : Lister les contacts
// ============================================================================
async function testListContacts() {
  console.log('\n👥 Test 3 : Liste des contacts');
  console.log('─'.repeat(50));
  
  try {
    const contacts = await contactsApi.getContacts({ limit: 10 });
    
    console.log('✅ Contacts récupérés:', contacts.body.contacts.length);
    
    if (contacts.body.contacts.length > 0) {
      console.log('\n   Premiers contacts:');
      contacts.body.contacts.slice(0, 3).forEach((contact, i) => {
        console.log(`   ${i + 1}. ${contact.email}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// ============================================================================
// TEST 4 : Lister les listes
// ============================================================================
async function testListLists() {
  console.log('\n📋 Test 4 : Listes de contacts');
  console.log('─'.repeat(50));
  
  try {
    const lists = await contactsApi.getLists({ limit: 10 });
    
    console.log('✅ Listes récupérées:', lists.body.lists.length);
    
    if (lists.body.lists.length > 0) {
      console.log('\n   Listes disponibles:');
      lists.body.lists.forEach((list, i) => {
        console.log(`   ${i + 1}. ${list.name} (${list.totalSubscribers} contacts)`);
      });
    } else {
      console.log('   ℹ️  Aucune liste créée. Créez-en une dans l\'interface Brevo.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// ============================================================================
// TEST 5 : Lister les templates
// ============================================================================
async function testListTemplates() {
  console.log('\n📝 Test 5 : Templates d\'emails');
  console.log('─'.repeat(50));
  
  try {
    const templatesApi = new brevo.TransactionalEmailsApi();
    const templates = await templatesApi.getSmtpTemplates({ limit: 10 });
    
    console.log('✅ Templates récupérés:', templates.body.templates.length);
    
    if (templates.body.templates.length > 0) {
      console.log('\n   Templates disponibles:');
      templates.body.templates.forEach((template, i) => {
        console.log(`   ${i + 1}. [ID: ${template.id}] ${template.name}`);
      });
    } else {
      console.log('   ℹ️  Aucun template créé. Créez-en un dans l\'interface Brevo.');
      console.log('   📖 Consultez: BREVO_TEMPLATES_HTML.md');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// ============================================================================
// EXÉCUTION DES TESTS
// ============================================================================
async function runTests() {
  console.log('🚀 Démarrage des tests réels Brevo\n');
  console.log('═'.repeat(50));
  
  const results = {
    account: await testAccount(),
    sendEmail: await testSendEmail(),
    listContacts: await testListContacts(),
    listLists: await testListLists(),
    listTemplates: await testListTemplates()
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
    console.log('\n🎉 Tous les tests sont passés !');
    console.log('✅ L\'intégration Brevo est opérationnelle.');
    console.log('\n📋 Prochaines étapes:');
    console.log('   1. Créer les templates dans Brevo (voir BREVO_TEMPLATES_HTML.md)');
    console.log('   2. Créer les listes de contacts');
    console.log('   3. Configurer les automations');
    console.log('   4. Tester l\'envoi depuis l\'application');
  } else {
    console.log('\n⚠️  Certains tests ont échoué.');
    console.log('📖 Consultez: GUIDE_CONFIGURATION_BREVO.md');
  }
  
  process.exit(passed === total ? 0 : 1);
}

runTests().catch(error => {
  console.error('\n💥 Erreur fatale:', error);
  process.exit(1);
});
