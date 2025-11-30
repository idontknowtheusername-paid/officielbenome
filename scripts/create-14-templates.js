#!/usr/bin/env node
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const KEY = process.env.VITE_BREVO_API_KEY;
const URL = 'https://api.brevo.com/v3';

if (!KEY) {
  console.error('❌ VITE_BREVO_API_KEY not found in environment variables');
  process.exit(1);
}

const templates = [
  // 1. Listing Published
  {name:'Listing Published MaxiMarket',subject:'✅ Ton annonce est en ligne !',html:'<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto;border-radius:10px"><tr><td style="background:#28a745;color:white;padding:30px;text-align:center"><h1>✅ Annonce Publiée</h1></td></tr><tr><td style="padding:30px"><h2>Félicitations {{params.USER_NAME}} !</h2><p>Ton annonce "<b>{{params.LISTING_TITLE}}</b>" est en ligne.</p><div style="background:#e3f2fd;padding:20px;border-radius:10px;margin:20px 0"><p><b>Catégorie:</b> {{params.CATEGORY}}</p><p><b>Prix:</b> {{params.PRICE}}</p></div><div style="text-align:center"><a href="{{params.LISTING_URL}}" style="background:#667eea;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;display:inline-block">Voir mon annonce</a></div></td></tr></table></body></html>'},
  
  // 2. New Message
  {name:'New Message MaxiMarket',subject:'💬 Nouveau message',html:'<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto;border-radius:10px"><tr><td style="background:#667eea;color:white;padding:30px;text-align:center"><h1>💬 Nouveau Message</h1></td></tr><tr><td style="padding:30px"><h2>Salut {{params.RECIPIENT_NAME}} !</h2><p><b>{{params.SENDER_NAME}}</b> t'a envoyé un message.</p><div style="background:#f8f9fa;padding:20px;border-radius:10px;margin:20px 0"><p>"{{params.MESSAGE_PREVIEW}}"</p></div><div style="text-align:center"><a href="{{params.MESSAGE_URL}}" style="background:#667eea;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;display:inline-block">Répondre</a></div></td></tr></table></body></html>'},
  
  // 3. Payment Received
  {name:'Payment Received MaxiMarket',subject:'✅ Paiement reçu',html:'<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto;border-radius:10px"><tr><td style="background:#28a745;color:white;padding:30px;text-align:center"><h1>✅ Paiement Reçu</h1></td></tr><tr><td style="padding:30px"><h2>Merci {{params.USER_NAME}} !</h2><p>Ton paiement de <b>{{params.AMOUNT}} {{params.CURRENCY}}</b> a été reçu.</p><div style="background:#e3f2fd;padding:20px;border-radius:10px;margin:20px 0"><p><b>Service:</b> {{params.SERVICE}}</p><p><b>Transaction:</b> {{params.TRANSACTION_ID}}</p></div></td></tr></table></body></html>'},
  
  // 4. Boost Activated
  {name:'Boost Activated MaxiMarket',subject:'🚀 Ton boost est actif !',html:'<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto;border-radius:10px"><tr><td style="background:#ff6b6b;color:white;padding:30px;text-align:center"><h1>🚀 Boost Activé</h1></td></tr><tr><td style="padding:30px"><h2>Super {{params.USER_NAME}} !</h2><p>Ton annonce "<b>{{params.LISTING_TITLE}}</b>" est boostée pour {{params.BOOST_DURATION}}.</p><div style="text-align:center"><a href="{{params.LISTING_URL}}" style="background:#ff6b6b;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;display:inline-block">Voir mon annonce</a></div></td></tr></table></body></html>'},
  
  // 5. Email Verification
  {name:'Email Verification MaxiMarket',subject:'📧 Vérifie ton email',html:'<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto;border-radius:10px"><tr><td style="background:#667eea;color:white;padding:30px;text-align:center"><h1>📧 Vérifie ton Email</h1></td></tr><tr><td style="padding:30px"><h2>Salut {{params.USER_NAME}} !</h2><p>Clique sur le bouton pour vérifier ton email.</p><div style="text-align:center;margin:30px 0"><a href="{{params.VERIFICATION_URL}}" style="background:#667eea;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;display:inline-block">Vérifier mon email</a></div></td></tr></table></body></html>'},
  
  // 6-14: Autres templates...
  {name:'Listing Approved MaxiMarket',subject:'✅ Annonce approuvée',html:'<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#28a745;color:white;padding:30px;text-align:center"><h1>✅ Approuvée</h1></td></tr><tr><td style="padding:30px"><p>Ton annonce "<b>{{params.LISTING_TITLE}}</b>" est approuvée !</p></td></tr></table></body></html>'},
  {name:'Listing Rejected MaxiMarket',subject:'❌ Annonce rejetée',html:'<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#dc3545;color:white;padding:30px;text-align:center"><h1>❌ Rejetée</h1></td></tr><tr><td style="padding:30px"><p>Ton annonce a été rejetée. Raison: {{params.REASON}}</p></td></tr></table></body></html>'},
  {name:'Payment Failed MaxiMarket',subject:'❌ Échec paiement',html:'<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#dc3545;color:white;padding:30px;text-align:center"><h1>❌ Paiement Échoué</h1></td></tr><tr><td style="padding:30px"><p>Le paiement de {{params.AMOUNT}} a échoué.</p></td></tr></table></body></html>'},
  {name:'Message Reply MaxiMarket',subject:'💬 Réponse à ton message',html:'<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#667eea;color:white;padding:30px;text-align:center"><h1>💬 Réponse</h1></td></tr><tr><td style="padding:30px"><p><b>{{params.SENDER_NAME}}</b> a répondu: "{{params.MESSAGE_PREVIEW}}"</p><a href="{{params.MESSAGE_URL}}">Voir</a></td></tr></table></body></html>'},
  {name:'Boost Expiring Soon MaxiMarket',subject:'⏰ Ton boost expire bientôt',html:'<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#ffc107;color:white;padding:30px;text-align:center"><h1>⏰ Boost Expire</h1></td></tr><tr><td style="padding:30px"><p>Ton boost expire dans {{params.DAYS_LEFT}} jours.</p></td></tr></table></body></html>'},
  {name:'Account Warning MaxiMarket',subject:'⚠️ Avertissement compte',html:'<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#ffc107;color:white;padding:30px;text-align:center"><h1>⚠️ Avertissement</h1></td></tr><tr><td style="padding:30px"><p>Ton compte a reçu un avertissement. Raison: {{params.REASON}}</p></td></tr></table></body></html>'},
  {name:'Account Suspended MaxiMarket',subject:'🚫 Compte suspendu',html:'<!DOCTYPE html><html><body style="font-family:Arial;background:#f4f4f4;padding:20px"><table width="600" style="background:white;margin:0 auto"><tr><td style="background:#dc3545;color:white;padding:30px;text-align:center"><h1>🚫 Suspendu</h1></td></tr><tr><td style="padding:30px"><p>Ton compte est suspendu jusqu'au {{params.UNTIL_DATE}}.</p></td></tr></table></body></html>'}
];

async function create(t){
  const r=await fetch(`${URL}/smtp/templates`,{method:'POST',headers:{'api-key':KEY,'content-type':'application/json'},body:JSON.stringify({sender:{name:'MaxiMarket',email:'info@maxiimarket.com'},templateName:t.name,subject:t.subject,htmlContent:t.html,isActive:true})});
  const d=await r.json();
  console.log(r.ok?`✅ ${t.name} (ID: ${d.id})`:`❌ ${t.name}`);
  return r.ok?{ok:1,id:d.id,name:t.name}:{ok:0};
}

(async()=>{
  console.log('🚀 Création de 12 templates...\n');
  const results=[];
  for(const t of templates){results.push(await create(t));await new Promise(r=>setTimeout(r,500));}
  const ok=results.filter(r=>r.ok);
  console.log(`\n✅ ${ok.length}/${templates.length} créés`);
  if(ok.length>0){console.log('\n📋 IDs:');ok.forEach(r=>console.log(`${r.name.split(' ')[0]}: ${r.id}`));}
})();
