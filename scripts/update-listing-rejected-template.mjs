#!/usr/bin/env node
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const KEY = process.env.VITE_BREVO_API_KEY;
const URL = 'https://api.brevo.com/v3';
const TEMPLATE_ID = 15;

if (!KEY) {
  console.error('❌ VITE_BREVO_API_KEY not found in environment variables');
  process.exit(1);
}

const htmlContent = `
<!DOCTYPE html>
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
                Ton annonce "<strong>{{params.LISTING_TITLE}}</strong>" n'a pas pu être approuvée pour le moment.
              </p>
              <div style="background:#fff3cd;padding:25px;border-radius:10px;margin:25px 0;border-left:4px solid #ffc107">
                <h3 style="color:#856404;margin:0 0 15px 0;font-size:18px">⚠️ Raison du rejet</h3>
                <p style="margin:0;color:#856404;font-size:15px;line-height:1.6">{{params.REASON}}</p>
              </div>
              <div style="background:#e3f2fd;padding:25px;border-radius:10px;margin:25px 0;border-left:4px solid #2196f3">
                <h3 style="color:#1976d2;margin:0 0 15px 0;font-size:18px">🔧 Que faire ?</h3>
                <ul style="color:#555;line-height:1.8;padding-left:20px;margin:0">
                  <li>Corrige les points mentionnés ci-dessus</li>
                  <li>Vérifie que ton annonce respecte nos règles</li>
                  <li>Republie ton annonce après modifications</li>
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
</html>
`;

const response = await fetch(`${URL}/smtp/templates/${TEMPLATE_ID}`, {
  method: 'PUT',
  headers: {'api-key': KEY, 'content-type': 'application/json'},
  body: JSON.stringify({subject: '❌ Ton annonce nécessite des modifications', htmlContent, isActive: true})
});
console.log(response.ok ? '✅ Listing Rejected mis à jour' : '❌ Erreur');
