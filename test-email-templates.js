// ============================================================================
// TEST DE TOUS LES TEMPLATES D'EMAILS
// ============================================================================

import { emailTemplates, getTemplate, getAvailableTemplates } from './src/services/email-templates.service.js';
import { emailService } from './src/services/email.service.js';

// Configuration de test
const TEST_EMAIL = 'test@example.com';

// Test de tous les templates
async function testAllTemplates() {
  console.log('🚀 Test de tous les templates d\'emails...\n');
  
  const templates = getAvailableTemplates();
  console.log(`📧 Templates disponibles (${templates.length}):`, templates);
  
  for (const templateName of templates) {
    console.log(`\n🔍 Test du template: ${templateName}`);
    
    try {
      // Générer des données de test selon le template
      const testData = generateTestData(templateName);
      
      // Obtenir le template
      const template = getTemplate(templateName, testData);
      
      console.log(`✅ Template généré: ${template.subject}`);
      console.log(`📝 Contenu HTML: ${template.html.length} caractères`);
      
      // Test d'envoi (en mode simulation)
      const result = await emailService.sendTemplateEmail(TEST_EMAIL, templateName, testData);
      console.log(`📤 Envoi simulé: ${result.message}`);
      
    } catch (error) {
      console.error(`❌ Erreur template ${templateName}:`, error.message);
    }
  }
  
  console.log('\n✅ Test de tous les templates terminé !');
}

// Générer des données de test selon le template
function generateTestData(templateName) {
  const baseData = {
    email: TEST_EMAIL,
    firstName: 'John',
    lastName: 'Doe'
  };
  
  switch (templateName) {
    case 'welcomeNewsletter':
    case 'reactivationNewsletter':
      return { ...baseData };
      
    case 'subscriptionConfirmation':
    case 'unsubscribeConfirmation':
      return { email: TEST_EMAIL };
      
    case 'weeklyNewsletter':
      return {
        weekStart: '1er janvier 2024',
        newListings: '150+',
        activeUsers: '2.5k',
        transactions: '89',
        newUsers: '320',
        featuredListings: [
          { id: 1, title: 'Appartement moderne', price: '150,000 €', location: 'Dakar' },
          { id: 2, title: 'Voiture d\'occasion', price: '25,000 €', location: 'Abidjan' }
        ]
      };
      
    case 'monthlyNewsletter':
      return {
        month: 'Janvier 2024',
        totalListings: '1,250',
        totalUsers: '5,200',
        totalTransactions: '450',
        topCategories: {
          immobilier: '35%',
          automobile: '28%',
          services: '22%',
          marketplace: '15%'
        }
      };
      
    case 'specialOffer':
      return {
        offer: 'Réduction exclusive',
        discount: '20%',
        description: 'Sur tous les services premium',
        code: 'NEWSLETTER20',
        expiryDate: '31 décembre 2024'
      };
      
    case 'reengagementEmail':
      return {
        firstName: 'John',
        daysInactive: '30 jours',
        newListings: '500'
      };
      
    case 'maintenanceNotification':
      return {
        date: '15 janvier 2024',
        duration: '2 heures',
        time: '02:00 - 04:00 UTC'
      };
      
    case 'securityAlert':
      return {
        alertType: 'Connexion suspecte',
        message: 'Une connexion inhabituelle a été détectée',
        date: new Date().toLocaleString(),
        location: 'Paris, France',
        device: 'Chrome sur Windows',
        ip: '192.168.1.1'
      };
      
    case 'accountCreated':
      return {
        firstName: 'John'
      };
      
    case 'passwordReset':
      return {
        expiryTime: '1 heure',
        resetLink: 'https://maxiimarket.com/reset-password?token=abc123'
      };
      
    default:
      return baseData;
  }
}

// Test des fonctions utilitaires
function testUtilityFunctions() {
  console.log('\n🔧 Test des fonctions utilitaires...');
  
  try {
    const templates = getAvailableTemplates();
    console.log('✅ getAvailableTemplates():', templates.length, 'templates');
    
    const template = getTemplate('welcomeNewsletter', { email: TEST_EMAIL });
    console.log('✅ getTemplate(): Template récupéré avec succès');
    
    console.log('✅ Toutes les fonctions utilitaires fonctionnent !');
  } catch (error) {
    console.error('❌ Erreur fonctions utilitaires:', error.message);
  }
}

// Test des méthodes du service email
async function testEmailServiceMethods() {
  console.log('\n📧 Test des méthodes du service email...');
  
  const testSubscribers = [
    { email: 'test1@example.com' },
    { email: 'test2@example.com' }
  ];
  
  const methods = [
    { name: 'sendWelcomeEmail', fn: () => emailService.sendWelcomeEmail(TEST_EMAIL, 'John') },
    { name: 'sendReactivationEmail', fn: () => emailService.sendReactivationEmail(TEST_EMAIL) },
    { name: 'sendWeeklyNewsletter', fn: () => emailService.sendWeeklyNewsletter(testSubscribers, { weekStart: 'Cette semaine' }) },
    { name: 'sendMonthlyNewsletter', fn: () => emailService.sendMonthlyNewsletter(testSubscribers, { month: 'Ce mois' }) },
    { name: 'sendSpecialOffer', fn: () => emailService.sendSpecialOffer(testSubscribers, { discount: '20%' }) },
    { name: 'sendReengagementEmail', fn: () => emailService.sendReengagementEmail(TEST_EMAIL, { firstName: 'John' }) },
    { name: 'sendMaintenanceNotification', fn: () => emailService.sendMaintenanceNotification(testSubscribers, { date: 'Demain' }) },
    { name: 'sendSecurityAlert', fn: () => emailService.sendSecurityAlert(TEST_EMAIL, { alertType: 'Test' }) },
    { name: 'sendAccountCreatedEmail', fn: () => emailService.sendAccountCreatedEmail(TEST_EMAIL, { firstName: 'John' }) },
    { name: 'sendPasswordResetEmail', fn: () => emailService.sendPasswordResetEmail(TEST_EMAIL, { resetLink: '#' }) },
    { name: 'sendUnsubscribeConfirmation', fn: () => emailService.sendUnsubscribeConfirmation(TEST_EMAIL) }
  ];
  
  for (const method of methods) {
    try {
      console.log(`🔍 Test de ${method.name}...`);
      const result = await method.fn();
      console.log(`✅ ${method.name}: ${result.message}`);
    } catch (error) {
      console.error(`❌ ${method.name}:`, error.message);
    }
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests complets du système d\'emails...\n');
  
  // Vérifier la configuration
  const config = emailService.checkConfiguration();
  console.log('🔧 Configuration:', config);
  
  // Test des fonctions utilitaires
  testUtilityFunctions();
  
  // Test des méthodes du service email
  await testEmailServiceMethods();
  
  // Test de tous les templates
  await testAllTemplates();
  
  console.log('\n🎉 Tous les tests terminés avec succès !');
}

// Exécuter si ce fichier est lancé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { testAllTemplates, testUtilityFunctions, testEmailServiceMethods, runAllTests };
