#!/usr/bin/env node
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const KEY = process.env.VITE_BREVO_API_KEY;
const URL = 'https://api.brevo.com/v3';

if (!KEY) {
  console.error('❌ VITE_BREVO_API_KEY not found in environment variables');
  process.exit(1);
}

// Tous les templates à mettre à jour avec vouvoiement
const templates = [
  {
    id: 9,
    name: 'Listing Published',
    subject: '✅ Votre annonce est en ligne !',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0">
    <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <tr><td style="background:linear-gradient(135deg,#28a745 0%,#20c997 100%);color:white;padding:40px 30px;text-align:center">
              <h1 style="margin:0;font-size:32px">✅ Annonce Publiée</h1>
              <p style="margin:10px 0 0 0;font-size:16px;opacity:0.9">Votre annonce est maintenant visible</p>
            </td></tr>
          <tr><td style="padding:40px 30px">
              <h2 style="color:#333;margin:0 0 20px 0">Félicitations {{params.USER_NAME}} ! 🎉</h2>
              <p style="font-size:16px;line-height:1.6;color:#555;margin:0 0 25px 0">
                Votre annonce "<strong style="color:#28a745">{{params.LISTING_TITLE}}</strong>" est maintenant en ligne et visible par tous les utilisateurs de MaxiMarket.
              </p>
              <div style="background:#e3f2fd;padding:25px;border-radius:10px;margin:25px 0;border-left:4px solid #2196f3">
                <h3 style="color:#1976d2;margin:0 0 15px 0;font-size:18px">📊 Détails de votre annonce</h3>
                <p style="margin:5px 0;color:#555"><strong>📍 Catégorie:</strong> {{params.CATEGORY}}</p>
                <p style="margin:5px 0;color:#555"><strong>💰 Prix:</strong> {{params.PRICE}}</p>
                <p style="margin:5px 0;color:#555"><strong>👁️ Visibilité:</strong> Publique</p>
              </div>
              <div style="text-align:center;margin:35px 0">
                <a href="{{params.LISTING_URL}}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">
                  Voir votre annonce →
                </a>
              </div>
              <div style="background:#fff3cd;padding:20px;border-radius:10px;margin:25px 0">
                <p style="margin:0;color:#856404;font-size:14px">
                  <strong>💡 Conseil:</strong> Répondez rapidement aux messages pour augmenter vos chances de vente !
                </p>
              </div>
            </td></tr>
          <tr><td style="background:#f8f9fa;padding:30px;text-align:center;border-top:1px solid #e9ecef">
              <p style="margin:0 0 10px 0;color:#666;font-size:14px">© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
            </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`
  },
  {
    id: 10,
    name: 'New Message',
    subject: '💬 Nouveau message reçu',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0">
    <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <tr><td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:40px 30px;text-align:center">
              <h1 style="margin:0;font-size:32px">💬 Nouveau Message</h1>
              <p style="margin:10px 0 0 0;font-size:16px;opacity:0.9">Vous avez reçu un message</p>
            </td></tr>
          <tr><td style="padding:40px 30px">
              <h2 style="color:#333;margin:0 0 20px 0">Bonjour {{params.USER_NAME}},</h2>
              <p style="font-size:16px;line-height:1.6;color:#555;margin:0 0 25px 0">
                <strong style="color:#667eea">{{params.SENDER_NAME}}</strong> vous a envoyé un message concernant votre annonce.
              </p>
              <div style="background:#f8f9fa;padding:25px;border-radius:10px;margin:25px 0;border-left:4px solid #667eea">
                <p style="margin:0;color:#555;font-style:italic">"{{params.MESSAGE_PREVIEW}}"</p>
              </div>
              <div style="text-align:center;margin:35px 0">
                <a href="{{params.MESSAGE_URL}}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">
                  Répondre au message →
                </a>
              </div>
              <div style="background:#fff3cd;padding:20px;border-radius:10px;margin:25px 0">
                <p style="margin:0;color:#856404;font-size:14px">
                  <strong>⚡ Réponse rapide:</strong> Les vendeurs qui répondent dans l'heure ont 3x plus de chances de conclure une vente !
                </p>
              </div>
            </td></tr>
          <tr><td style="background:#f8f9fa;padding:30px;text-align:center;border-top:1px solid #e9ecef">
              <p style="margin:0 0 10px 0;color:#666;font-size:14px">© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
            </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`
  },
  {
    id: 12,
    name: 'Boost Activated',
    subject: '🚀 Votre boost est actif !',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0">
    <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <tr><td style="background:linear-gradient(135deg,#ff6b6b 0%,#ee5a6f 100%);color:white;padding:40px 30px;text-align:center">
              <h1 style="margin:0;font-size:32px">🚀 Boost Activé</h1>
              <p style="margin:10px 0 0 0;font-size:16px;opacity:0.9">Votre annonce est maintenant en vedette</p>
            </td></tr>
          <tr><td style="padding:40px 30px">
              <h2 style="color:#333;margin:0 0 20px 0">Excellent choix {{params.USER_NAME}} ! 🎯</h2>
              <p style="font-size:16px;line-height:1.6;color:#555;margin:0 0 25px 0">
                Votre annonce "<strong style="color:#ff6b6b">{{params.LISTING_TITLE}}</strong>" bénéficie maintenant d'une visibilité maximale !
              </p>
              <div style="background:#ffe5e5;padding:25px;border-radius:10px;margin:25px 0;border-left:4px solid #ff6b6b">
                <h3 style="color:#c92a2a;margin:0 0 15px 0;font-size:18px">⚡ Avantages de votre boost</h3>
                <ul style="color:#555;line-height:1.8;padding-left:20px;margin:0">
                  <li>Affichage prioritaire en haut des résultats</li>
                  <li>Badge "En vedette" visible</li>
                  <li>Visibilité augmentée de 500%</li>
                  <li>Durée: {{params.BOOST_DURATION}}</li>
                </ul>
              </div>
              <div style="text-align:center;margin:35px 0">
                <a href="{{params.LISTING_URL}}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">
                  Voir votre annonce boostée →
                </a>
              </div>
              <div style="background:#e3f2fd;padding:20px;border-radius:10px;margin:25px 0">
                <p style="margin:0;color:#1976d2;font-size:14px">
                  <strong>📊 Statistiques:</strong> Suivez les performances de votre boost dans votre tableau de bord
                </p>
              </div>
            </td></tr>
          <tr><td style="background:#f8f9fa;padding:30px;text-align:center;border-top:1px solid #e9ecef">
              <p style="margin:0 0 10px 0;color:#666;font-size:14px">© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
            </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`
  },
  {
    id: 13,
    name: 'Email Verification',
    subject: '📧 Vérifiez votre email',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0">
    <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <tr><td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:40px 30px;text-align:center">
              <h1 style="margin:0;font-size:32px">📧 Vérification Email</h1>
              <p style="margin:10px 0 0 0;font-size:16px;opacity:0.9">Confirmez votre adresse email</p>
            </td></tr>
          <tr><td style="padding:40px 30px">
              <h2 style="color:#333;margin:0 0 20px 0">Bienvenue {{params.USER_NAME}} ! 👋</h2>
              <p style="font-size:16px;line-height:1.6;color:#555;margin:0 0 25px 0">
                Merci de vous être inscrit sur MaxiMarket. Pour activer votre compte, veuillez vérifier votre adresse email.
              </p>
              <div style="text-align:center;margin:35px 0">
                <a href="{{params.VERIFICATION_URL}}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">
                  Vérifier mon email →
                </a>
              </div>
              <div style="background:#fff3cd;padding:20px;border-radius:10px;margin:25px 0">
                <p style="margin:0;color:#856404;font-size:14px">
                  <strong>⏰ Attention:</strong> Ce lien expire dans 24 heures
                </p>
              </div>
            </td></tr>
          <tr><td style="background:#f8f9fa;padding:30px;text-align:center;border-top:1px solid #e9ecef">
              <p style="margin:0 0 10px 0;color:#666;font-size:14px">© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
            </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`
  },
  {
    id: 14,
    name: 'Listing Approved',
    subject: '✅ Votre annonce est approuvée !',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0">
    <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <tr><td style="background:linear-gradient(135deg,#28a745 0%,#20c997 100%);color:white;padding:40px 30px;text-align:center">
              <h1 style="margin:0;font-size:32px">✅ Annonce Approuvée</h1>
              <p style="margin:10px 0 0 0;font-size:16px;opacity:0.9">Votre annonce est validée</p>
            </td></tr>
          <tr><td style="padding:40px 30px">
              <h2 style="color:#333;margin:0 0 20px 0">Félicitations {{params.USER_NAME}} ! 🎉</h2>
              <p style="font-size:16px;line-height:1.6;color:#555;margin:0 0 25px 0">
                Votre annonce "<strong style="color:#28a745">{{params.LISTING_TITLE}}</strong>" a été approuvée par notre équipe de modération et est maintenant visible par tous.
              </p>
              <div style="background:#e8f5e9;padding:25px;border-radius:10px;margin:25px 0;border-left:4px solid #4caf50">
                <h3 style="color:#2e7d32;margin:0 0 15px 0;font-size:18px">✨ Prochaines étapes</h3>
                <ul style="color:#555;line-height:1.8;padding-left:20px;margin:0">
                  <li>Votre annonce est maintenant en ligne</li>
                  <li>Les acheteurs peuvent vous contacter</li>
                  <li>Répondez rapidement aux messages</li>
                  <li>Boostez votre annonce pour plus de visibilité</li>
                </ul>
              </div>
              <div style="text-align:center;margin:35px 0">
                <a href="{{params.LISTING_URL}}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">
                  Voir votre annonce →
                </a>
              </div>
            </td></tr>
          <tr><td style="background:#f8f9fa;padding:30px;text-align:center;border-top:1px solid #e9ecef">
              <p style="margin:0 0 10px 0;color:#666;font-size:14px">© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
            </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`
  },
  {
    id: 15,
    name: 'Listing Rejected',
    subject: '❌ Votre annonce nécessite des modifications',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0">
    <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <tr><td style="background:linear-gradient(135deg,#dc3545 0%,#c82333 100%);color:white;padding:40px 30px;text-align:center">
              <h1 style="margin:0;font-size:32px">❌ Annonce Rejetée</h1>
              <p style="margin:10px 0 0 0;font-size:16px;opacity:0.9">Modifications nécessaires</p>
            </td></tr>
          <tr><td style="padding:40px 30px">
              <h2 style="color:#333;margin:0 0 20px 0">Bonjour {{params.USER_NAME}},</h2>
              <p style="font-size:16px;line-height:1.6;color:#555;margin:0 0 25px 0">
                Votre annonce "<strong>{{params.LISTING_TITLE}}</strong>" n'a pas pu être approuvée pour le moment.
              </p>
              <div style="background:#fff3cd;padding:25px;border-radius:10px;margin:25px 0;border-left:4px solid #ffc107">
                <h3 style="color:#856404;margin:0 0 15px 0;font-size:18px">⚠️ Raison du rejet</h3>
                <p style="margin:0;color:#856404">{{params.REASON}}</p>
              </div>
              <div style="background:#e3f2fd;padding:25px;border-radius:10px;margin:25px 0;border-left:4px solid #2196f3">
                <h3 style="color:#1976d2;margin:0 0 15px 0;font-size:18px">🔧 Que faire ?</h3>
                <ul style="color:#555;line-height:1.8;padding-left:20px;margin:0">
                  <li>Corrigez les points mentionnés ci-dessus</li>
                  <li>Vérifiez que votre annonce respecte nos règles</li>
                  <li>Republiez votre annonce après modifications</li>
                </ul>
              </div>
              <div style="text-align:center;margin:35px 0">
                <a href="{{params.EDIT_URL}}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">
                  Modifier mon annonce →
                </a>
              </div>
            </td></tr>
          <tr><td style="background:#f8f9fa;padding:30px;text-align:center;border-top:1px solid #e9ecef">
              <p style="margin:0 0 10px 0;color:#666;font-size:14px">© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
            </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`
  },
  {
    id: 16,
    name: 'Payment Failed',
    subject: '❌ Échec de paiement - MaxiMarket',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0">
    <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <tr><td style="background:linear-gradient(135deg,#dc3545 0%,#c82333 100%);color:white;padding:40px 30px;text-align:center">
              <h1 style="margin:0;font-size:32px">❌ Paiement Échoué</h1>
              <p style="margin:10px 0 0 0;font-size:16px;opacity:0.9">Transaction non aboutie</p>
            </td></tr>
          <tr><td style="padding:40px 30px">
              <h2 style="color:#333;margin:0 0 20px 0">Bonjour {{params.USER_NAME}},</h2>
              <p style="font-size:16px;line-height:1.6;color:#555;margin:0 0 25px 0">
                Malheureusement, votre paiement de <strong style="color:#dc3545">{{params.AMOUNT}} {{params.CURRENCY}}</strong> n'a pas pu être traité.
              </p>
              <div style="background:#fff3cd;padding:25px;border-radius:10px;margin:25px 0;border-left:4px solid #ffc107">
                <h3 style="color:#856404;margin:0 0 15px 0;font-size:18px">⚠️ Raison possible</h3>
                <ul style="color:#856404;line-height:1.8;padding-left:20px;margin:0">
                  <li>Fonds insuffisants</li>
                  <li>Carte expirée ou invalide</li>
                  <li>Problème de connexion</li>
                  <li>Limite de transaction dépassée</li>
                </ul>
              </div>
              <div style="background:#e3f2fd;padding:25px;border-radius:10px;margin:25px 0;border-left:4px solid #2196f3">
                <h3 style="color:#1976d2;margin:0 0 15px 0;font-size:18px">🔧 Que faire ?</h3>
                <ul style="color:#555;line-height:1.8;padding-left:20px;margin:0">
                  <li>Vérifiez les informations de votre carte</li>
                  <li>Assurez-vous d'avoir suffisamment de fonds</li>
                  <li>Essayez avec un autre moyen de paiement</li>
                  <li>Contactez votre banque si le problème persiste</li>
                </ul>
              </div>
              <div style="text-align:center;margin:35px 0">
                <a href="{{params.RETRY_URL}}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">
                  Réessayer le paiement →
                </a>
              </div>
              <div style="background:#f8f9fa;padding:20px;border-radius:10px;margin:25px 0">
                <p style="margin:0;color:#666;font-size:14px">
                  <strong>💡 Besoin d'aide ?</strong> Contactez notre support à support@maximarket.com
                </p>
              </div>
            </td></tr>
          <tr><td style="background:#f8f9fa;padding:30px;text-align:center;border-top:1px solid #e9ecef">
              <p style="margin:0 0 10px 0;color:#666;font-size:14px">© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
            </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`
  }
];

console.log('🔄 Mise à jour de tous les templates vers le vouvoiement...\n');

for (const template of templates) {
  try {
    const response = await fetch(`${URL}/smtp/templates/${template.id}`, {
      method: 'PUT',
      headers: {
        'api-key': KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        subject: template.subject,
        htmlContent: template.html,
        isActive: true
      })
    });

    if (response.ok) {
      console.log(`✅ Template ${template.id} (${template.name}) mis à jour`);
    } else {
      const error = await response.text();
      console.log(`❌ Erreur template ${template.id}: ${error}`);
    }
  } catch (error) {
    console.log(`❌ Erreur template ${template.id}: ${error.message}`);
  }
}

console.log('\n✅ Tous les templates ont été mis à jour avec le vouvoiement professionnel !');
