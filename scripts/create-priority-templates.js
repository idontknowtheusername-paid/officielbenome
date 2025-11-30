#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const BREVO_API_KEY = process.env.VITE_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';

if (!BREVO_API_KEY) {
  console.error('❌ VITE_BREVO_API_KEY not found in environment variables');
  process.exit(1);
}

const templates = [
  {
    name: 'Listing Published MaxiMarket',
    subject: '✅ Ton annonce est en ligne !',
    htmlContent: `<!DOCTYPE html><html><body style="font-family:Arial;margin:0;padding:20px;background:#f4f4f4"><table width="600" style="background:white;margin:0 auto;border-radius:10px"><tr><td style="background:#28a745;color:white;padding:30px;text-align:center"><h1 style="margin:0">✅ Annonce Publiée !</h1></td></tr><tr><td style="padding:30px"><h2>Félicitations {{params.USER_NAME}} !</h2><p>Ton annonce "<strong>{{params.LISTING_TITLE}}</strong>" est maintenant en ligne.</p><div style="background:#e3f2fd;padding:20px;border-radius:10px;margin:20px 0"><p><strong>📍 Catégorie:</strong> {{params.CATEGORY}}</p><p><strong>💰 Prix:</strong> {{params.PRICE}}</p><p><strong>👁️ Visibilité:</strong> Publique</p></div><div style="text-align:center;margin:30px 0"><a href="{{params.LISTING_URL}}" style="background:#667eea;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;display:inline-block">Voir mon annonce</a></div><p>💡 <strong>Astuce:</strong> Boost ton annonce pour plus de visibilité !</p></td></tr><tr><td style="background:#f8f9fa;padding:20px;text-align:center;color:#666;font-size:0.9em"><p>© {{params.CURRENT_YEAR}} MaxiMarket</p></td></tr></table></body></html>`
  },
  {
    name: 'New Message MaxiMarket',
    subject: '💬 Nouveau message sur MaxiMarket',
    htmlContent: `<!DOCTYPE html><html><body style="font-family:Arial;margin:0;padding:20px;background:#f4f4f4"><table width="600" style="background:white;margin:0 auto;border-radius:10px"><tr><td style="background:#667eea;color:white;padding:30px;text-align:center"><h1 style="margin:0">💬 Nouveau Message</h1></td></tr><tr><td style="padding:30px"><h2>Salut {{params.RECIPIENT_NAME}} !</h2><p><strong>{{params.SENDER_NAME}}</strong> t'a envoyé un message concernant "<strong>{{params.LISTING_TITLE}}</strong>"</p><div style="background:#f8f9fa;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #667eea"><p style="margin:0;font-style:italic">"{{params.MESSAGE_PREVIEW}}"</p></div><div style="text-align:center;margin:30px 0"><a href="{{params.MESSAGE_URL}}" style="background:#667eea;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;display:inline-block">Répondre au message</a></div></td></tr><tr><td style="background:#f8f9fa;padding:20px;text-align:center;color:#666;font-size:0.9em"><p>© {{params.CURRENT_YEAR}} MaxiMarket</p></td></tr></table></body></html>`
  }
];

async function createTemplate(t) {
  const res = await fetch(`${BREVO_API_URL}/smtp/templates`, {
    method: 'POST',
    headers: {'accept':'application/json','api-key':BREVO_API_KEY,'content-type':'application/json'},
    body: JSON.stringify({sender:{name:'MaxiMarket',email:'info@maxiimarket.com'},templateName:t.name,subject:t.subject,htmlContent:t.htmlContent,isActive:true})
  });
  const data = await res.json();
  console.log(res.ok ? `✅ ${t.name} (ID: ${data.id})` : `❌ ${t.name}`);
  return res.ok ? {success:true,id:data.id,name:t.name} : {success:false};
}

(async()=>{
  for(const t of templates){await createTemplate(t);await new Promise(r=>setTimeout(r,500));}
})();
