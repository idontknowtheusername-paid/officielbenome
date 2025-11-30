#!/usr/bin/env node

/**
 * Test simple de l'API Brevo
 */

import * as SibApiV3Sdk from '@getbrevo/brevo';

const BREVO_API_KEY = 'xkeysib-c4acfd956bef553227031115f67a22e8e2981567732789563563aafa50370813-14FmpTuJlYK84hLSj';

console.log('🧪 Test simple de l\'API Brevo\n');

// Configuration
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = BREVO_API_KEY;

// Test 1: Vérifier le compte
async function testAccount() {
  console.log('📋 Test 1 : Vérification du compte');
  console.log('─'.repeat(50));
  
  try {
    const accountApi = new SibApiV3Sdk.AccountApi();
    const account = await accountApi.getAccount();
    
    console.log('✅ Compte vérifié:');
    console.log('   Email:', account.email);
    console.log('   Prénom:', account.firstName);
    console.log('   Nom:', account.lastName);
    console.log('   Société:', account.companyName);
    
    if (account.plan && account.plan.length > 0) {
      console.log('   Plan:', account.plan[0].type);
      console.log('   Crédits:', account.plan[0].credits);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('   Code:', error.response.status);
      console.error('   Détails:', error.response.text);
    }
    return false;
  }
}

// Test 2: Envoyer un email
async function testSendEmail() {
  console.log('\n📧 Test 2 : Envoi d\'un email de test');
  console.log('─'.repeat(50));
  
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { name: 'MaxiMarket Test', email: 'noreply@maximarket.com' };
    sendSmtpEmail.to = [{ email: 'test@example.com', name: 'Test User' }];
    sendSmtpEmail.subject = '🎉 Test MaxiMarket - Intégration Brevo';
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Test d'intégration Brevo</h1>
          </div>
          <div class="content">
            <div class="success">
              <strong>✅ Succès !</strong> L'intégration Brevo fonctionne parfaitement.
            </div>
            <p>Bonjour,</p>
            <p>Ceci est un email de test depuis <strong>MaxiMarket</strong>.</p>
            <p>Si vous recevez cet email, cela signifie que :</p>
            <ul>
              <li>✅ La clé API Brevo est correctement configurée</li>
              <li>✅ L'envoi d'emails transactionnels fonctionne</li>
              <li>✅ Le système est prêt pour la production</li>
            </ul>
            <p>Date du test : ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Email envoyé avec succès !');
    console.log('   Message ID:', response.messageId);
    console.log('   ℹ️  Note: L\'email a été envoyé à test@example.com');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('   Code:', error.response.status);
      console.error('   Détails:', error.response.text);
    }
    return false;
  }
}

// Test 3: Lister les listes
async function testLists() {
  console.log('\n📋 Test 3 : Listes de contacts');
  console.log('─'.repeat(50));
  
  try {
    const contactsApi = new SibApiV3Sdk.ContactsApi();
    const lists = await contactsApi.getLists({ limit: 10 });
    
    console.log('✅ Listes récupérées:', lists.lists.length);
    
    if (lists.lists.length > 0) {
      console.log('\n   Listes disponibles:');
      lists.lists.forEach((list, i) => {
        console.log(`   ${i + 1}. ${list.name} (${list.totalSubscribers || 0} contacts)`);
      });
    } else {
      console.log('   ℹ️  Aucune liste. Créez-en une dans Brevo.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// Test 4: Lister les templates
async function testTemplates() {
  console.log('\n📝 Test 4 : Templates d\'emails');
  console.log('─'.repeat(50));
  
  try {
    const templatesApi = new SibApiV3Sdk.TransactionalEmailsApi();
    const templates = await templatesApi.getSmtpTemplates({ limit: 10 });
    
    console.log('✅ Templates récupérés:', templates.templates.length);
    
    if (templates.templates.length > 0) {
      console.log('\n   Templates disponibles:');
      templates.templates.forEach((template, i) => {
        console.log(`   ${i + 1}. [ID: ${template.id}] ${template.name}`);
      });
    } else {
      console.log('   ℹ️  Aucun template. Créez-en un dans Brevo.');
      console.log('   📖 Voir: BREVO_TEMPLATES_HTML.md');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// Exécution
async function run() {
  console.log('🚀 Démarrage des tests Brevo\n');
  console.log('═'.repeat(50));
  
  const results = {
    account: await testAccount(),
    sendEmail: await testSendEmail(),
    lists: await testLists(),
    templates: await testTemplates()
  };
  
  console.log('\n═'.repeat(50));
  console.log('📊 RÉSULTATS');
  console.log('═'.repeat(50));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
  });
  
  console.log('\n═'.repeat(50));
  console.log(`📈 Score: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  console.log('═'.repeat(50));
  
  if (passed === total) {
    console.log('\n🎉 Tous les tests réussis !');
    console.log('✅ L\'intégration Brevo est opérationnelle.\n');
    console.log('📋 Prochaines étapes:');
    console.log('   1. Créer les templates (BREVO_TEMPLATES_HTML.md)');
    console.log('   2. Créer les listes de contacts');
    console.log('   3. Tester depuis l\'application React');
  }
  
  process.exit(passed === total ? 0 : 1);
}

run().catch(error => {
  console.error('\n💥 Erreur:', error);
  process.exit(1);
});
