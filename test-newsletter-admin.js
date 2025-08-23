// ============================================================================
// TEST DU SYSTÈME ADMIN NEWSLETTER
// ============================================================================

import { newsletterService } from './src/services/newsletter.service.js';
import { emailService } from './src/services/email.service.js';
import { campaignService } from './src/services/campaign.service.js';

// Test complet du système admin newsletter
async function testNewsletterAdminSystem() {
  console.log('🚀 Test du système admin newsletter...\n');

  try {
    // 1. Test des statistiques newsletter
    console.log('📊 1. Test des statistiques newsletter...');
    const newsletterStats = await newsletterService.getStats();
    console.log('✅ Statistiques newsletter:', newsletterStats);

    // 2. Test des statistiques campagnes
    console.log('\n📈 2. Test des statistiques campagnes...');
    const campaignStats = await campaignService.getCampaignStats();
    console.log('✅ Statistiques campagnes:', campaignStats);

    // 3. Test de récupération des campagnes
    console.log('\n📧 3. Test de récupération des campagnes...');
    const campaigns = await campaignService.getAllCampaigns();
    console.log('✅ Campagnes récupérées:', campaigns.length);

    // 4. Test de création d'une campagne
    console.log('\n➕ 4. Test de création d\'une campagne...');
    const newCampaign = await campaignService.createCampaign({
      type: 'weeklyNewsletter',
      subject: 'Test Newsletter Hebdomadaire',
      data: {
        weekStart: '1er janvier 2024',
        newListings: '150+',
        activeUsers: '2.5k',
        transactions: '89',
        newUsers: '320'
      },
      createdBy: 'test-user-id'
    });
    console.log('✅ Campagne créée:', newCampaign.id);

    // 5. Test d'envoi de newsletter hebdomadaire
    console.log('\n📤 5. Test d\'envoi newsletter hebdomadaire...');
    const weeklyResult = await newsletterService.sendWeeklyNewsletter({
      weekStart: '1er janvier 2024',
      newListings: '150+',
      activeUsers: '2.5k',
      transactions: '89',
      newUsers: '320'
    });
    console.log('✅ Newsletter hebdomadaire:', weeklyResult.message);

    // 6. Test d'envoi d'offre spéciale
    console.log('\n🎁 6. Test d\'envoi offre spéciale...');
    const offerResult = await newsletterService.sendSpecialOffer({
      discount: '25%',
      code: 'TEST25',
      description: 'Offre de test',
      expiryDate: '31 décembre 2024'
    });
    console.log('✅ Offre spéciale:', offerResult.message);

    // 7. Test de campagne de réengagement
    console.log('\n🔄 7. Test de campagne de réengagement...');
    const reengagementResult = await newsletterService.sendReengagementCampaign({
      firstName: 'John',
      daysInactive: '30 jours',
      newListings: '500'
    });
    console.log('✅ Campagne de réengagement:', reengagementResult.message);

    // 8. Test de notification de maintenance
    console.log('\n🔧 8. Test de notification de maintenance...');
    const maintenanceResult = await newsletterService.sendMaintenanceNotification({
      date: '15 janvier 2024',
      duration: '2 heures',
      time: '02:00 - 04:00 UTC'
    });
    console.log('✅ Notification de maintenance:', maintenanceResult.message);

    // 9. Test de mise à jour de campagne
    console.log('\n✏️ 9. Test de mise à jour de campagne...');
    const updatedCampaign = await campaignService.updateCampaign(newCampaign.id, {
      subject: 'Newsletter Hebdomadaire - Mise à jour',
      status: 'sent'
    });
    console.log('✅ Campagne mise à jour:', updatedCampaign.subject);

    // 10. Test de suppression de campagne
    console.log('\n🗑️ 10. Test de suppression de campagne...');
    const deleteResult = await campaignService.deleteCampaign(newCampaign.id);
    console.log('✅ Campagne supprimée:', deleteResult.success);

    // 11. Test des templates d'emails
    console.log('\n📝 11. Test des templates d\'emails...');
    const templates = [
      'welcomeNewsletter',
      'weeklyNewsletter',
      'specialOffer',
      'reengagementEmail',
      'maintenanceNotification'
    ];

    for (const templateName of templates) {
      try {
        const result = await emailService.sendTemplateEmail('test@example.com', templateName, {
          email: 'test@example.com',
          firstName: 'John',
          weekStart: '1er janvier 2024',
          discount: '20%',
          code: 'TEST20'
        });
        console.log(`✅ Template ${templateName}: ${result.message}`);
      } catch (error) {
        console.log(`⚠️ Template ${templateName}: ${error.message}`);
      }
    }

    console.log('\n🎉 Tous les tests terminés avec succès !');
    console.log('\n📋 Résumé:');
    console.log(`- Statistiques newsletter: ${newsletterStats.total} abonnés`);
    console.log(`- Campagnes: ${campaignStats.total} total, ${campaignStats.sent} envoyées`);
    console.log(`- Templates testés: ${templates.length}`);

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Test des fonctions individuelles
async function testIndividualFunctions() {
  console.log('\n🔧 Test des fonctions individuelles...\n');

  // Test configuration email
  const emailConfig = emailService.checkConfiguration();
  console.log('📧 Configuration email:', emailConfig);

  // Test des templates disponibles
  const availableTemplates = await import('./src/services/email-templates.service.js');
  console.log('📝 Templates disponibles:', availableTemplates.getAvailableTemplates());

  // Test de création de données de test
  const testData = {
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
  console.log('📊 Données de test générées:', testData);
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests complets du système admin newsletter...\n');
  
  await testIndividualFunctions();
  await testNewsletterAdminSystem();
  
  console.log('\n✅ Tous les tests terminés !');
}

// Exécuter si ce fichier est lancé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { testNewsletterAdminSystem, testIndividualFunctions, runAllTests };
