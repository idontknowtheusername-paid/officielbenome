#!/usr/bin/env node

/**
 * Test d'envoi de campagne newsletter via Brevo
 * Usage: node test-newsletter-campaign.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const brevoApiKey = process.env.VITE_BREVO_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

if (!brevoApiKey) {
  console.error('❌ Clé API Brevo manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// FONCTIONS DE TEST
// ============================================================================

async function getActiveSubscribers() {
  console.log('\n📋 Récupération des abonnés actifs...');
  
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('email, subscribed_at')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Erreur:', error);
    return [];
  }

  console.log(`✅ ${data.length} abonnés actifs trouvés`);
  return data;
}

async function sendTestWeeklyNewsletter(testEmail) {
  console.log('\n📧 Test envoi newsletter hebdomadaire...');
  
  const templateData = {
    weekStart: new Date().toLocaleDateString('fr-FR'),
    newListings: '150+',
    activeUsers: '2.5k',
    transactions: 89,
    newUsers: 450,
    featuredListings: [
      { title: 'Appartement moderne', price: '150,000 €', location: 'Dakar' },
      { title: 'Voiture d\'occasion', price: '25,000 €', location: 'Abidjan' }
    ]
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'MaxiMarket',
          email: 'noreply@maximarket.com'
        },
        to: [{ email: testEmail }],
        templateId: 2, // Weekly Newsletter
        params: templateData
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Newsletter hebdomadaire envoyée avec succès');
      console.log('📬 Message ID:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Erreur Brevo:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ Erreur envoi:', error);
    return { success: false, error: error.message };
  }
}

async function sendTestMonthlyNewsletter(testEmail) {
  console.log('\n📧 Test envoi newsletter mensuelle...');
  
  const templateData = {
    month: 'Novembre 2024',
    totalListings: '1,250+',
    totalUsers: '5.2k',
    totalTransactions: 342,
    topCategories: [
      { name: 'Immobilier', count: 450 },
      { name: 'Automobile', count: 380 },
      { name: 'Électronique', count: 220 }
    ]
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'MaxiMarket',
          email: 'noreply@maximarket.com'
        },
        to: [{ email: testEmail }],
        templateId: 3, // Monthly Newsletter
        params: templateData
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Newsletter mensuelle envoyée avec succès');
      console.log('📬 Message ID:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Erreur Brevo:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ Erreur envoi:', error);
    return { success: false, error: error.message };
  }
}

async function sendTestSpecialOffer(testEmail) {
  console.log('\n📧 Test envoi offre spéciale...');
  
  const templateData = {
    discount: '20%',
    code: 'NEWSLETTER20',
    description: 'Sur tous les services premium',
    expiryDate: '31 décembre 2024'
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'MaxiMarket',
          email: 'noreply@maximarket.com'
        },
        to: [{ email: testEmail }],
        templateId: 4, // Special Offer
        params: templateData
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Offre spéciale envoyée avec succès');
      console.log('📬 Message ID:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Erreur Brevo:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ Erreur envoi:', error);
    return { success: false, error: error.message };
  }
}

async function getCampaignStats() {
  console.log('\n📊 Récupération des statistiques Brevo...');
  
  try {
    const response = await fetch('https://api.brevo.com/v3/emailCampaigns?limit=50&status=sent', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey
      }
    });

    const result = await response.json();
    
    if (response.ok && result.campaigns) {
      console.log(`✅ ${result.campaigns.length} campagnes trouvées`);
      
      let totalSent = 0;
      let totalDelivered = 0;
      let totalOpened = 0;
      let totalClicked = 0;
      
      result.campaigns.forEach(campaign => {
        totalSent += campaign.statistics?.globalStats?.sent || 0;
        totalDelivered += campaign.statistics?.globalStats?.delivered || 0;
        totalOpened += campaign.statistics?.globalStats?.uniqueOpens || 0;
        totalClicked += campaign.statistics?.globalStats?.uniqueClicks || 0;
      });
      
      const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
      
      console.log('\n📈 Statistiques globales:');
      console.log(`   Campagnes: ${result.campaigns.length}`);
      console.log(`   Envoyés: ${totalSent}`);
      console.log(`   Délivrés: ${totalDelivered}`);
      console.log(`   Ouverts: ${totalOpened}`);
      console.log(`   Cliqués: ${totalClicked}`);
      console.log(`   Taux d'ouverture: ${avgOpenRate.toFixed(2)}%`);
      console.log(`   Taux de clic: ${avgClickRate.toFixed(2)}%`);
      
      return {
        success: true,
        stats: {
          totalCampaigns: result.campaigns.length,
          totalSent,
          totalDelivered,
          totalOpened,
          totalClicked,
          avgOpenRate,
          avgClickRate
        }
      };
    } else {
      console.error('❌ Erreur Brevo:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ Erreur récupération stats:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 Test des campagnes newsletter Brevo\n');
  console.log('='.repeat(60));

  // 1. Récupérer les abonnés
  const subscribers = await getActiveSubscribers();
  
  if (subscribers.length === 0) {
    console.log('\n⚠️  Aucun abonné actif. Créez d\'abord des abonnés de test.');
    return;
  }

  // Utiliser le premier abonné pour les tests
  const testEmail = subscribers[0].email;
  console.log(`\n🎯 Email de test: ${testEmail}`);

  // 2. Tester l'envoi de newsletters
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Newsletter Hebdomadaire');
  console.log('='.repeat(60));
  await sendTestWeeklyNewsletter(testEmail);

  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Newsletter Mensuelle');
  console.log('='.repeat(60));
  await sendTestMonthlyNewsletter(testEmail);

  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Offre Spéciale');
  console.log('='.repeat(60));
  await sendTestSpecialOffer(testEmail);

  // 3. Récupérer les statistiques
  console.log('\n' + '='.repeat(60));
  console.log('STATISTIQUES BREVO');
  console.log('='.repeat(60));
  await getCampaignStats();

  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests terminés !');
  console.log('='.repeat(60));
  console.log('\n💡 Vérifiez votre boîte email:', testEmail);
  console.log('💡 Consultez le dashboard Brevo pour les statistiques détaillées');
}

main().catch(console.error);
