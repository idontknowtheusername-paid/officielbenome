#!/usr/bin/env node

/**
 * Test de chargement de la page admin newsletter
 * Vérifie que tous les services s'importent correctement
 */

console.log('🧪 Test d\'import des services newsletter...\n');

try {
  console.log('1️⃣ Test import brevo-campaigns.service...');
  const { brevoCampaignsService } = await import('./src/services/email/brevo-campaigns.service.js');
  console.log('✅ brevoCampaignsService importé');
  console.log('   Méthodes:', Object.keys(brevoCampaignsService).join(', '));

  console.log('\n2️⃣ Test import newsletter.service...');
  const { newsletterService } = await import('./src/services/newsletter.service.js');
  console.log('✅ newsletterService importé');
  console.log('   Méthodes:', Object.keys(newsletterService).join(', '));

  console.log('\n3️⃣ Test import campaign.service...');
  const { campaignService } = await import('./src/services/campaign.service.js');
  console.log('✅ campaignService importé');
  console.log('   Méthodes:', Object.keys(campaignService).join(', '));

  console.log('\n4️⃣ Test import email-provider.service...');
  const { emailProviderService } = await import('./src/services/email/email-provider.service.js');
  console.log('✅ emailProviderService importé');
  console.log('   Méthodes:', Object.keys(emailProviderService).join(', '));

  console.log('\n✅ Tous les services s\'importent correctement !');
  console.log('\n💡 La page admin newsletter devrait maintenant se charger sans erreur.');

} catch (error) {
  console.error('\n❌ Erreur d\'import:', error.message);
  console.error('\nStack:', error.stack);
  process.exit(1);
}
