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

const templates = [
  {
    name: 'Listing Published MaxiMarket',
    subject: '✅ Ton annonce est en ligne !',
    html: '<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto;border-radius:10px"><tr><td style="background:#28a745;color:white;padding:30px;text-align:center"><h1>✅ Annonce Publiée</h1></td></tr><tr><td style="padding:30px"><h2>Félicitations!</h2><p>Ton annonce est en ligne.</p></td></tr></table></body></html>'
  },
  {
    name: 'New Message MaxiMarket',
    subject: '💬 Nouveau message',
    html: '<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto;border-radius:10px"><tr><td style="background:#667eea;color:white;padding:30px;text-align:center"><h1>💬 Nouveau Message</h1></td></tr><tr><td style="padding:30px"><p>Tu as un nouveau message.</p></td></tr></table></body></html>'
  },
  {
    name: 'Payment Received MaxiMarket',
    subject: '✅ Paiement reçu',
    html: '<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto;border-radius:10px"><tr><td style="background:#28a745;color:white;padding:30px;text-align:center"><h1>✅ Paiement Reçu</h1></td></tr><tr><td style="padding:30px"><p>Ton paiement a été reçu.</p></td></tr></table></body></html>'
  },
  {
    name: 'Boost Activated MaxiMarket',
    subject: '🚀 Ton boost est actif !',
    html: '<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto;border-radius:10px"><tr><td style="background:#ff6b6b;color:white;padding:30px;text-align:center"><h1>🚀 Boost Activé</h1></td></tr><tr><td style="padding:30px"><p>Ton annonce est boostée!</p></td></tr></table></body></html>'
  },
  {
    name: 'Email Verification MaxiMarket',
    subject: '📧 Vérifie ton email',
    html: '<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto;border-radius:10px"><tr><td style="background:#667eea;color:white;padding:30px;text-align:center"><h1>📧 Vérifie ton Email</h1></td></tr><tr><td style="padding:30px"><p>Clique pour vérifier.</p></td></tr></table></body></html>'
  },
  {
    name: 'Listing Approved MaxiMarket',
    subject: '✅ Annonce approuvée',
    html: '<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#28a745;color:white;padding:30px;text-align:center"><h1>✅ Approuvée</h1></td></tr><tr><td style="padding:30px"><p>Ton annonce est approuvée!</p></td></tr></table></body></html>'
  },
  {
    name: 'Listing Rejected MaxiMarket',
    subject: '❌ Annonce rejetée',
    html: '<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#dc3545;color:white;padding:30px;text-align:center"><h1>❌ Rejetée</h1></td></tr><tr><td style="padding:30px"><p>Ton annonce a été rejetée.</p></td></tr></table></body></html>'
  },
  {
    name: 'Payment Failed MaxiMarket',
    subject: '❌ Échec paiement',
    html: '<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#dc3545;color:white;padding:30px;text-align:center"><h1>❌ Paiement Échoué</h1></td></tr><tr><td style="padding:30px"><p>Le paiement a échoué.</p></td></tr></table></body></html>'
  },
  {
    name: 'Message Reply MaxiMarket',
    subject: '💬 Réponse à ton message',
    html: '<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#667eea;color:white;padding:30px;text-align:center"><h1>💬 Réponse</h1></td></tr><tr><td style="padding:30px"><p>Tu as une réponse.</p></td></tr></table></body></html>'
  },
  {
    name: 'Boost Expiring Soon MaxiMarket',
    subject: '⏰ Ton boost expire bientôt',
    html: '<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#ffc107;color:white;padding:30px;text-align:center"><h1>⏰ Boost Expire</h1></td></tr><tr><td style="padding:30px"><p>Ton boost expire bientôt.</p></td></tr></table></body></html>'
  },
  {
    name: 'Account Warning MaxiMarket',
    subject: '⚠️ Avertissement compte',
    html: '<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#ffc107;color:white;padding:30px;text-align:center"><h1>⚠️ Avertissement</h1></td></tr><tr><td style="padding:30px"><p>Ton compte a un avertissement.</p></td></tr></table></body></html>'
  },
  {
    name: 'Account Suspended MaxiMarket',
    subject: '🚫 Compte suspendu',
    html: '<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#dc3545;color:white;padding:30px;text-align:center"><h1>🚫 Suspendu</h1></td></tr><tr><td style="padding:30px"><p>Ton compte est suspendu.</p></td></tr></table></body></html>'
  }
];

async function create(t) {
  const r = await fetch(`${URL}/smtp/templates`, {
    method: 'POST',
    headers: { 'api-key': KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'MaxiMarket', email: 'info@maxiimarket.com' },
      templateName: t.name,
      subject: t.subject,
      htmlContent: t.html,
      isActive: true
    })
  });
  const d = await r.json();
  console.log(r.ok ? `✅ ${t.name} (ID: ${d.id})` : `❌ ${t.name}`);
  return r.ok ? { ok: 1, id: d.id, name: t.name } : { ok: 0 };
}

console.log('🚀 Création de 12 templates...\n');
const results = [];
for (const t of templates) {
  results.push(await create(t));
  await new Promise(r => setTimeout(r, 500));
}
const ok = results.filter(r => r.ok);
console.log(`\n✅ ${ok.length}/${templates.length} créés`);
if (ok.length > 0) {
  console.log('\n📋 IDs à ajouter:');
  ok.forEach(r => console.log(`${r.name.replace(' MaxiMarket', '')}: ${r.id}`));
}
