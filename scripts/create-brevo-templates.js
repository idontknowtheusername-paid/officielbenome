#!/usr/bin/env node

/**
 * Script pour créer automatiquement tous les templates Brevo via l'API REST
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BREVO_API_KEY = process.env.VITE_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';

if (!BREVO_API_KEY) {
  console.error('❌ VITE_BREVO_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🚀 Création automatique des templates Brevo\n');

// Templates à créer
const templates = [
  {
    name: 'Welcome Newsletter MaxiMarket',
    subject: '🎉 Bienvenue sur MaxiMarket !',
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
              <h1 style="margin: 0; font-size: 2.5em;">🎉 Bienvenue sur MaxiMarket !</h1>
              <p style="margin: 10px 0 0 0; font-size: 1.2em;">Votre marketplace de confiance</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2>Bonjour {{params.FIRST_NAME}} !</h2>
              <p style="font-size: 1.1em; line-height: 1.6;">Merci de vous être inscrit à notre newsletter ! Vous recevrez désormais nos dernières actualités et offres spéciales.</p>
              
              <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin: 30px 0;">
                <h3 style="color: #1976d2; margin-top: 0;">💡 Conseils pour bien commencer :</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li style="margin: 8px 0;">Complétez votre profil pour plus de visibilité</li>
                  <li style="margin: 8px 0;">Ajoutez des photos de qualité à vos annonces</li>
                  <li style="margin: 8px 0;">Répondez rapidement aux messages</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{params.MARKETPLACE_URL}}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">Explorer MaxiMarket</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 0.9em;">
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
    name: 'Password Reset MaxiMarket',
    subject: '🔐 Réinitialisation de votre mot de passe',
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
            <td style="background: #667eea; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 2em;">🔐 Réinitialisation de mot de passe</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2>Bonjour {{params.FIRST_NAME}},</h2>
              <p style="font-size: 1.1em; line-height: 1.6;">Vous avez demandé à réinitialiser votre mot de passe MaxiMarket. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{params.RESET_URL}}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1em;">Réinitialiser mon mot de passe</a>
              </div>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>⚠️ Important :</strong> Ce lien est valable pendant {{params.EXPIRY_TIME}}. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
              </div>
              
              <p style="font-size: 0.9em; color: #666; margin-top: 30px;">Si le bouton ne fonctionne pas, copiez ce lien :</p>
              <p style="font-size: 0.9em; color: #667eea; word-break: break-all;">{{params.RESET_URL}}</p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em;">
              <p>© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
              <p>Besoin d'aide ? <a href="mailto:{{params.SUPPORT_EMAIL}}" style="color: #667eea;">Contactez-nous</a></p>
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
    name: 'Weekly Newsletter MaxiMarket',
    subject: '📊 Votre résumé MaxiMarket de la semaine',
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
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 2em;">📊 Votre résumé MaxiMarket</h1>
              <p style="margin: 10px 0 0 0; font-size: 1.1em;">Semaine du {{params.WEEK_START}}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2>🚀 Activité de la semaine</h2>
              
              <table width="100%" cellpadding="10" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 10px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                      <div style="font-size: 2em; font-weight: bold; color: #667eea;">{{params.NEW_LISTINGS}}</div>
                      <p style="margin: 5px 0 0 0;">Nouvelles annonces</p>
                    </div>
                  </td>
                  <td width="50%" style="padding: 10px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                      <div style="font-size: 2em; font-weight: bold; color: #667eea;">{{params.ACTIVE_USERS}}</div>
                      <p style="margin: 5px 0 0 0;">Utilisateurs actifs</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{params.APP_URL}}/marketplace" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600;">Explorer MaxiMarket</a>
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
    name: 'Special Offer MaxiMarket',
    subject: '🎁 Offre spéciale MaxiMarket',
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
            <td style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 2.5em;">🎁 Offre spéciale !</h1>
              <p style="margin: 10px 0 0 0; font-size: 1.2em;">{{params.OFFER_TITLE}}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <div style="background: #fff3cd; border: 2px solid #ffeaa7; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <h2 style="margin: 0 0 10px 0; color: #856404;">{{params.DISCOUNT}} de réduction</h2>
                <div style="background: #667eea; color: white; padding: 10px 20px; border-radius: 5px; font-size: 1.2em; font-weight: bold; margin: 10px 0; display: inline-block;">
                  {{params.PROMO_CODE}}
                </div>
                <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #856404;">Valable jusqu'au {{params.EXPIRY_DATE}}</p>
              </div>
              
              <h3>🚀 Comment en profiter :</h3>
              <ol style="line-height: 1.8;">
                <li>Connectez-vous à votre compte MaxiMarket</li>
                <li>Choisissez un service premium</li>
                <li>Entrez le code promo lors du paiement</li>
                <li>Profitez de votre réduction !</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{params.CTA_URL}}" style="display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1em;">Profiter de l'offre</a>
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
    name: 'Account Created MaxiMarket',
    subject: '✅ Votre compte MaxiMarket a été créé',
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
            <td style="background: #28a745; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 2em;">✅ Compte créé avec succès !</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2>Bonjour {{params.FIRST_NAME}} !</h2>
              <p style="font-size: 1.1em; line-height: 1.6;">Bienvenue sur MaxiMarket ! Votre compte a été créé avec succès.</p>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Email :</strong> {{params.EMAIL}}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{params.PROFILE_URL}}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">Accéder à mon profil</a>
              </div>
              
              <h3>🚀 Prochaines étapes :</h3>
              <ul style="line-height: 1.8;">
                <li>Complétez votre profil</li>
                <li>Publiez votre première annonce</li>
                <li>Explorez le marketplace</li>
              </ul>
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
  console.log(`📝 Création de ${templates.length} templates...\n`);
  
  const results = [];
  
  for (const template of templates) {
    const result = await createTemplate(template);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500)); // Pause de 500ms entre chaque création
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
    console.log('\n📋 Prochaine étape:');
    console.log('Mettez à jour les IDs dans src/services/email/brevo-templates.service.js');
    console.log('\nIDs des templates créés:');
    successful.forEach(r => {
      const key = r.name.toUpperCase().replace(/ /g, '_').replace('MAXIMARKET', '').trim();
      console.log(`${key}: ${r.id},`);
    });
  }
}

// Exécuter
createAllTemplates().catch(error => {
  console.error('\n💥 Erreur fatale:', error);
  process.exit(1);
});
