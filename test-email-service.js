// ============================================================================
// TEST DU SERVICE D'ENVOI D'EMAILS
// ============================================================================

import { emailService } from './src/services/email.service.js';

// Test de configuration
console.log('🔧 Test de configuration du service email...');
const config = emailService.checkConfiguration();
console.log('Configuration:', config);

// Test d'envoi d'email simple
async function testSimpleEmail() {
  console.log('\n📧 Test d\'envoi d\'email simple...');
  try {
    const result = await emailService.sendEmail(
      'test@example.com',
      'Test MaxiMarket Email Service',
      'Ceci est un test du service d\'envoi d\'emails de MaxiMarket.',
      false
    );
    console.log('✅ Résultat:', result);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Test d'envoi d'email de bienvenue
async function testWelcomeEmail() {
  console.log('\n🎉 Test d\'envoi d\'email de bienvenue...');
  try {
    const result = await emailService.sendWelcomeEmail('test@example.com', 'John');
    console.log('✅ Résultat:', result);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Test d'envoi de newsletter
async function testNewsletter() {
  console.log('\n📰 Test d\'envoi de newsletter...');
  try {
    const subscribers = [
      { email: 'test1@example.com' },
      { email: 'test2@example.com' }
    ];
    
    const result = await emailService.sendNewsletter(
      subscribers,
      'Test Newsletter MaxiMarket',
      '<h1>Test Newsletter</h1><p>Ceci est un test de newsletter.</p>',
      true
    );
    console.log('✅ Résultat:', result);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests du service email...\n');
  
  await testSimpleEmail();
  await testWelcomeEmail();
  await testNewsletter();
  
  console.log('\n✅ Tous les tests terminés !');
}

// Exécuter si ce fichier est lancé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { testSimpleEmail, testWelcomeEmail, testNewsletter, runAllTests };
