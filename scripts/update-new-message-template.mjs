#!/usr/bin/env node
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const KEY = process.env.VITE_BREVO_API_KEY;
const URL = 'https://api.brevo.com/v3';
const TEMPLATE_ID = 10; // New Message

if (!KEY) {
  console.error('❌ VITE_BREVO_API_KEY not found in environment variables');
  process.exit(1);
}

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau Message</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold;">💬 Nouveau Message</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu as reçu un message</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Salut {{params.RECIPIENT_NAME}} ! 👋</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 25px 0;">
                <strong style="color: #667eea;">{{params.SENDER_NAME}}</strong> t'a envoyé un message concernant ton annonce "<strong>{{params.LISTING_TITLE}}</strong>".
              </p>
              
              <!-- Message Preview -->
              <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #333; font-size: 15px; font-style: italic; line-height: 1.6;">
                  "{{params.MESSAGE_PREVIEW}}"
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="{{params.MESSAGE_URL}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  Répondre au message →
                </a>
              </div>
              
              <!-- Tips -->
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>💡 Conseil:</strong> Réponds rapidement pour augmenter tes chances de vente !
                </p>
              </div>
              
              <!-- Quick Actions -->
              <div style="margin: 30px 0;">
                <h3 style="color: #333; font-size: 18px; margin: 0 0 15px 0;">⚡ Actions rapides</h3>
                <ul style="color: #555; line-height: 1.8; padding-left: 20px; margin: 0;">
                  <li>Réponds dans les 24h pour un meilleur taux de conversion</li>
                  <li>Sois courtois et professionnel</li>
                  <li>Propose un rendez-vous si nécessaire</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                © {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                Tu reçois cet email car quelqu'un t'a contacté sur MaxiMarket
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

async function updateTemplate() {
  console.log('🔄 Mise à jour du template New Message...\n');
  
  try {
    const response = await fetch(`${URL}/smtp/templates/${TEMPLATE_ID}`, {
      method: 'PUT',
      headers: {
        'api-key': KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        subject: '💬 Nouveau message sur MaxiMarket',
        htmlContent: htmlContent,
        isActive: true
      })
    });

    if (response.ok) {
      console.log('✅ Template New Message mis à jour avec succès !');
    } else {
      const error = await response.json();
      console.error('❌ Erreur:', error);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

updateTemplate();
