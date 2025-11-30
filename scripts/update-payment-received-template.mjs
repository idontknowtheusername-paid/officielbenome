#!/usr/bin/env node
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const KEY = process.env.VITE_BREVO_API_KEY;
const URL = 'https://api.brevo.com/v3';
const TEMPLATE_ID = 11;

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
          <tr><td style="background:linear-gradient(135deg,#28a745 0%,#20c997 100%);color:white;padding:40px 30px;text-align:center">
              <h1 style="margin:0;font-size:32px">✅ Paiement Reçu</h1>
              <p style="margin:10px 0 0 0;font-size:16px;opacity:0.9">Transaction confirmée</p>
            </td></tr>
          <tr><td style="padding:40px 30px">
              <h2 style="color:#333;margin:0 0 20px 0">Merci {{params.USER_NAME}} ! 🎉</h2>
              <p style="font-size:16px;line-height:1.6;color:#555;margin:0 0 25px 0">
                Ton paiement a été reçu et confirmé avec succès.
              </p>
              <div style="background:#e3f2fd;padding:25px;border-radius:10px;margin:25px 0;border-left:4px solid #2196f3">
                <h3 style="color:#1976d2;margin:0 0 15px 0;font-size:18px">💳 Détails de la transaction</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color:#666;font-size:14px;padding:8px 0"><strong>Service:</strong></td>
                    <td style="color:#333;font-size:14px;padding:8px 0;text-align:right">{{params.SERVICE}}</td>
                  </tr>
                  <tr>
                    <td style="color:#666;font-size:14px;padding:8px 0"><strong>Montant:</strong></td>
                    <td style="color:#28a745;font-size:18px;font-weight:bold;padding:8px 0;text-align:right">{{params.AMOUNT}} {{params.CURRENCY}}</td>
                  </tr>
                  <tr>
                    <td style="color:#666;font-size:14px;padding:8px 0"><strong>Transaction ID:</strong></td>
                    <td style="color:#333;font-size:12px;padding:8px 0;text-align:right">{{params.TRANSACTION_ID}}</td>
                  </tr>
                </table>
              </div>
              <div style="text-align:center;margin:35px 0">
                <a href="{{params.RECEIPT_URL}}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">
                  Télécharger le reçu →
                </a>
              </div>
              <div style="background:#e8f5e9;padding:20px;border-radius:10px;margin:25px 0;border-left:4px solid #4caf50">
                <p style="margin:0;color:#2e7d32;font-size:14px">
                  <strong>✅ Confirmation:</strong> Un reçu détaillé a été envoyé à ton email.
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
</html>
`;

const response = await fetch(`${URL}/smtp/templates/${TEMPLATE_ID}`, {
  method: 'PUT',
  headers: {'api-key': KEY, 'content-type': 'application/json'},
  body: JSON.stringify({subject: '✅ Paiement confirmé - MaxiMarket', htmlContent, isActive: true})
});
console.log(response.ok ? '✅ Payment Received mis à jour' : '❌ Erreur');
