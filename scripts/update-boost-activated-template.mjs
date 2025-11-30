#!/usr/bin/env node
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const KEY = process.env.VITE_BREVO_API_KEY;
const URL = 'https://api.brevo.com/v3';
const TEMPLATE_ID = 12; // Boost Activated

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
  <title>Boost Activé</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🚀 Boost Activé !</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Ton annonce est maintenant boostée</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Super {{params.USER_NAME}} ! 🎉</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 25px 0;">
                Ton annonce "<strong style="color: #ff6b6b;">{{params.LISTING_TITLE}}</strong>" est maintenant boostée et bénéficie d'une visibilité maximale !
              </p>
              
              <!-- Boost Details -->
              <div style="background-color: #fff3e0; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #ff9800;">
                <h3 style="color: #e65100; margin: 0 0 15px 0; font-size: 18px;">⚡ Détails du boost</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666; font-size: 14px; padding: 8px 0;"><strong>📦 Type:</strong></td>
                    <td style="color: #333; font-size: 14px; padding: 8px 0; text-align: right;">{{params.BOOST_TYPE}}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px; padding: 8px 0;"><strong>⏱️ Durée:</strong></td>
                    <td style="color: #ff6b6b; font-size: 16px; font-weight: bold; padding: 8px 0; text-align: right;">{{params.BOOST_DURATION}}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px; padding: 8px 0;"><strong>📈 Visibilité:</strong></td>
                    <td style="color: #333; font-size: 14px; padding: 8px 0; text-align: right;">10x plus élevée</td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="{{params.LISTING_URL}}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);">
                  Voir mon annonce boostée →
                </a>
              </div>
              
              <!-- Benefits -->
              <div style="background-color: #e8f5e9; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #4caf50;">
                <h3 style="color: #2e7d32; margin: 0 0 10px 0; font-size: 16px;">✨ Avantages du boost</h3>
                <ul style="color: #555; line-height: 1.8; padding-left: 20px; margin: 10px 0 0 0;">
                  <li>Apparaît en haut des résultats de recherche</li>
                  <li>Badge "Boost" visible sur ton annonce</li>
                  <li>10x plus de vues en moyenne</li>
                  <li>Vente 3x plus rapide</li>
                </ul>
              </div>
              
              <!-- Tips -->
              <div style="margin: 30px 0;">
                <h3 style="color: #333; font-size: 18px; margin: 0 0 15px 0;">💡 Maximise ton boost</h3>
                <ul style="color: #555; line-height: 1.8; padding-left: 20px; margin: 0;">
                  <li>Réponds rapidement aux messages</li>
                  <li>Ajoute des photos de qualité</li>
                  <li>Mets à jour ta description si besoin</li>
                  <li>Partage sur les réseaux sociaux</li>
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
                Tu reçois cet email car tu as activé un boost sur MaxiMarket
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
  console.log('🔄 Mise à jour du template Boost Activated...\n');
  
  try {
    const response = await fetch(`${URL}/smtp/templates/${TEMPLATE_ID}`, {
      method: 'PUT',
      headers: {
        'api-key': KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        subject: '🚀 Ton boost est actif sur MaxiMarket !',
        htmlContent: htmlContent,
        isActive: true
      })
    });

    if (response.ok) {
      console.log('✅ Template Boost Activated mis à jour avec succès !');
    } else {
      const error = await response.json();
      console.error('❌ Erreur:', error);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

updateTemplate();
