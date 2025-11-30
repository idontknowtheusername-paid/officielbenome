#!/usr/bin/env node
/**
 * Création de tous les templates manquants pour MaxiMarket
 * 14 templates: Annonces, Messages, Transactions, Modération
 */

require('dotenv').config({ path: '.env.local' });

const BREVO_API_KEY = process.env.VITE_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';

if (!BREVO_API_KEY) {
  console.error('❌ VITE_BREVO_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🚀 Création de 14 templates MaxiMarket\n');

// Import des templates depuis des fichiers séparés
import { listingTemplates } from './templates/listing-templates.js';
import { messagingTemplates } from './templates/messaging-templates.js';
import { transactionTemplates } from './templates/transaction-templates.js';
import { moderationTemplates } from './templates/moderation-templates.js';

const allTemplates = [
  ...listingTemplates,
  ...messagingTemplates,
  ...transactionTemplates,
  ...moderationTemplates
];

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
        isActive: true
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ ${template.name} (ID: ${data.id})`);
      return { success: true, id: data.id, name: template.name };
    } else {
      console.error(`❌ ${template.name}: ${data.message}`);
      return { success: false, name: template.name, error: data.message };
    }
  } catch (error) {
    console.error(`❌ ${template.name}: ${error.message}`);
    return { success: false, name: template.name, error: error.message };
  }
}

async function main() {
  console.log(`📝 ${allTemplates.length} templates à créer...\n`);
  
  const results = [];
  for (const template of allTemplates) {
    const result = await createTemplate(template);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const successful = results.filter(r => r.success);
  console.log(`\n✅ ${successful.length}/${allTemplates.length} templates créés`);
  
  if (successful.length > 0) {
    console.log('\n📋 IDs à ajouter dans brevo-templates.service.js:');
    successful.forEach(r => console.log(`${r.name}: ${r.id}`));
  }
}

main().catch(console.error);
