#!/usr/bin/env node

/**
 * Script pour créer les templates Brevo additionnels
 * Templates: Monthly Newsletter, Reengagement, Maintenance, Listing, Messages, Payments
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BREVO_API_KEY = process.env.VITE_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';

if (!BREVO_API_KEY) {
  console.error('❌ VITE_BREVO_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🚀 Création des templates Brevo additionnels\n');

// Templates additionnels à créer
const templates = [
  {
    name: 'Monthly Newsletter MaxiMarket',
    subject: '📊 Votre bilan mensuel MaxiMarket',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 10px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 2.5em;">📊 Bilan Mensuel</h1>
              <p style="margin: 10px 0 0 0; font-size: 1.2em;">{{params.MONTH}}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2>🎯 Performances du mois</h2>
              
              <table width="100%" cellpadding="10" cellspacing="0">
                <tr>
                  <td width="33%" style="padding: 10px;">
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; text-align: center;">
                      <div style="font-size: 2em; font-weight: bold; color: #1976d2;">{{params.TOTAL_LISTINGS}}</div>
                      <p style="margin: 5px 0 0 0;">Annonces</p>
                    </div>
                  </td>
                  <td width="33%" style="padding: 10px;">
                    <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; text-align: center;">
                      <div style="font-size: 2em; font-weight: bold; color: #7b1fa2;">{{params.TOTAL_USERS}}</div>
                      <p style="margin: 5px 0 0 0;">Utilisateurs</p>
                    </div>
                  </td>
                  <td width="33%" style="padding: 10px;">
                    <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; text-align: center;">
                      <div style="font-size: 2em; font-weight: bold; color: #388e3c;">{{params.TOTAL_TRANSACTIONS}}</div>
                      <p style="margin: 5px 0 0 0;">Transactions</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{params.APP_URL}}/marketplace" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">Voir le marketplace</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em;">
              <p>© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
              <p><a href="{{params.UNSUBSCRIBE_URL}}" style="color: #667eea;">Se désinscrire</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    isActive: true
  },
  {
    name: 'Reengagement MaxiMarket',
    subject: '👋 On vous a manqué sur MaxiMarket !',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 10px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 2.5em;">👋 Vous nous manquez !</h1>
              <p style="margin: 10px 0 0 0; font-size: 1.2em;">Revenez découvrir les nouveautés</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2>Bonjour {{params.FIRST_NAME}},</h2>
              <p style="font-size: 1.1em; line-height: 1.6;">Cela fait {{params.DAYS_INACTIVE}} que nous ne vous avons pas vu sur MaxiMarket. Beaucoup de choses ont changé !</p>
              
              <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin: 30px 0;">
                <h3 style="color: #1976d2; margin-top: 0;">🆕 Nouveautés depuis votre départ :</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li style="margin: 8px 0;">{{params.NEW_LISTINGS}} nouvelles annonces</li>
                  <li style="margin: 8px 0;">Interface améliorée</li>
                  <li style="margin: 8px 0;">Nouvelles catégories disponibles</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{params.RETURN_URL}}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1em;">Revenir sur MaxiMarket</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em;">
              <p>© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
              <p><a href="{{params.UNSUBSCRIBE_URL}}" style="color: #667eea;">Se désinscrire</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    isActive: true
  },
  {
    name: 'Maintenance Notification MaxiMarket',
    subject: '🔧 Maintenance programmée MaxiMarket',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 10px; overflow: hidden;">
          <tr>
            <td style="background: #ff9800; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 2em;">🔧 Maintenance Programmée</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #856404;">📅 Date : {{params.MAINTENANCE_DATE}}</h3>
                <p style="margin: 5px 0; color: #856404;"><strong>⏰ Horaire :</strong> {{params.MAINTENANCE_TIME}}</p>
                <p style="margin: 5px 0; color: #856404;"><strong>⏱️ Durée estimée :</strong> {{params.MAINTENANCE_DURATION}}</p>
              </div>
              
              <p style="font-size: 1.1em; line-height: 1.6;">Nous effectuerons une maintenance pour améliorer nos services. Le site sera temporairement indisponible pendant cette période.</p>
              
              <h3>💡 Ce qui va changer :</h3>
              <ul style="line-height: 1.8;">
                <li>Amélioration des performances</li>
                <li>Corrections de bugs</li>
                <li>Nouvelles fonctionnalités</li>
              </ul>
              
              <p style="font-size: 0.9em; color: #666; margin-top: 30px;">Merci de votre compréhension !</p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em;">
              <p>© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    isActive: true
  }
];

// Fonction pour créer un template via l'API REST
async function createTemplate(template) {
  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/templates`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'MaxiMarket', email: 'info@maxiimarket.com' },
        templateName: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        isActive: template.isActive
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Template créé: "${template.name}" (ID: ${data.id})`);
    return { success: true, id: data.id, name: template.name };
  } catch (error) {
    console.error(`❌ Erreur pour "${template.name}":`, error.message);
    return { success: false, name: template.name, error: error.message };
  }
}

// Créer tous les templates
async function createAllTemplates() {
  console.log(`📝 Création de ${templates.length} templates additionnels...\n`);
  
  const results = [];
  
  for (const template of templates) {
    const result = await createTemplate(template);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log('📊 RÉSULTATS');
  console.log('═'.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log('\n✅ Templates créés avec succès:');
    successful.forEach(r => {
      console.log(`   - ${r.name} (ID: ${r.id})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Échecs:');
    failed.forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log(`📈 Score: ${successful.length}/${templates.length} templates créés`);
  console.log('═'.repeat(50));
  
  if (successful.length > 0) {
    console.log('\n📋 IDs à mettre à jour dans brevo-templates.service.js:');
    console.log('\nMONTHLY_NEWSLETTER: ' + (successful.find(r => r.name.includes('Monthly'))?.id || 'N/A'));
    console.log('REENGAGEMENT: ' + (successful.find(r => r.name.includes('Reengagement'))?.id || 'N/A'));
    console.log('MAINTENANCE_NOTIFICATION: ' + (successful.find(r => r.name.includes('Maintenance'))?.id || 'N/A'));
  }
}

// Exécuter
createAllTemplates().catch(error => {
  console.error('\n💥 Erreur fatale:', error);
  process.exit(1);
});
