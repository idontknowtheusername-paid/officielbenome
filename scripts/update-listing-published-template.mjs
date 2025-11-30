#!/usr/bin/env node
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const KEY = process.env.VITE_BREVO_API_KEY;
const URL = 'https://api.brevo.com/v3';
const TEMPLATE_ID = 9; // Listing Published

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
  <title>Annonce Publiée</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold;">✅ Annonce Publiée !</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Ton annonce est maintenant en ligne</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Félicitations {{params.USER_NAME}} ! 🎉</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 25px 0;">
                Ton annonce "<strong style="color: #28a745;">{{params.LISTING_TITLE}}</strong>" est maintenant visible par tous les utilisateurs de MaxiMarket.
              </p>
              
              <!-- Annonce Details -->
              <div style="background-color: #e3f2fd; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #2196f3;">
                <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 18px;">📋 Détails de ton annonce</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666; font-size: 14px; padding: 8px 0;"><strong>📍 Catégorie:</strong></td>
                    <td style="color: #333; font-size: 14px; padding: 8px 0; text-align: right;">{{params.CATEGORY}}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px; padding: 8px 0;"><strong>💰 Prix:</strong></td>
                    <td style="color: #28a745; font-size: 16px; font-weight: bold; padding: 8px 0; text-align: right;">{{params.PRICE}}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px; padding: 8px 0;"><strong>👁️ Visibilité:</strong></td>
                    <td style="color: #333; font-size: 14px; padding: 8px 0; text-align: right;">Publique</td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="{{params.LISTING_URL}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  Voir mon annonce →
                </a>
              </div>
              
              <!-- Tips -->
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>💡 Astuce Pro:</strong> Boost ton annonce pour obtenir jusqu'à 10x plus de visibilité et vendre plus rapidement !
                </p>
              </div>
              
              <!-- Next Steps -->
              <div style="margin: 30px 0;">
                <h3 style="color: #333; font-size: 18px; margin: 0 0 15px 0;">🚀 Prochaines étapes</h3>
                <ul style="color: #555; line-height: 1.8; padding-left: 20px; margin: 0;">
                  <li>Partage ton annonce sur les réseaux sociaux</li>
                  <li>Réponds rapidement aux messages des acheteurs</li>
                  <li>Mets à jour ton annonce si nécessaire</li>
                  <li>Considère un boost pour plus de visibilité</li>
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
                Tu reçois cet email car tu as créé une annonce sur MaxiMarket
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
  console.log('🔄 Mise à jour du template Listing Published...\n');
  
  try {
    const response = await fetch(`${URL}/smtp/templates/${TEMPLATE_ID}`, {
      method: 'PUT',
      headers: {
        'api-key': KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        subject: '✅ Ton annonce est en ligne sur MaxiMarket !',
        htmlContent: htmlContent,
        isActive: true
      })
    });

    if (response.ok) {
      console.log('✅ Template mis à jour avec succès !');
      console.log('📧 Le prochain email aura le nouveau design');
    } else {
      const error = await response.json();
      console.error('❌ Erreur:', error);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

updateTemplate();
