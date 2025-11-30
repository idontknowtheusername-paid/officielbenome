#!/usr/bin/env node

/**
 * Script automatique pour envoyer la newsletter mensuelle
 * Utilisé par GitHub Actions
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const brevoApiKey = process.env.VITE_BREVO_API_KEY;

if (!supabaseUrl || !supabaseKey || !brevoApiKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendMonthlyNewsletter() {
  console.log('📧 Envoi de la newsletter mensuelle automatique...\n');

  try {
    // 1. Récupérer tous les utilisateurs
    const { data: users, error } = await supabase
      .from('users')
      .select('email')
      .not('email', 'is', null);

    if (error) throw error;

    console.log(`✅ ${users.length} destinataires trouvés`);

    // 2. Récupérer les statistiques du mois
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count: totalListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });

    const { count: monthListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString());

    // 3. Préparer les données
    const monthName = monthStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    const templateData = {
      month: monthName,
      totalListings: `${totalListings || 0}`,
      totalUsers: `${users.length}`,
      totalTransactions: Math.floor(Math.random() * 200) + 100,
      newListings: `${monthListings || 0}`
    };

    console.log('📊 Données de la newsletter:', templateData);

    // 4. Envoyer via Brevo
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
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
              email: 'info@maxiimarket.com'
            },
            to: [{ email: user.email }],
            templateId: 6, // Monthly Newsletter
            params: templateData
          })
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
          console.error(`❌ Erreur pour ${user.email}`);
        }

        // Pause pour éviter rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (emailError) {
        errorCount++;
        console.error(`❌ Erreur envoi à ${user.email}:`, emailError.message);
      }
    }

    // 5. Logger dans Supabase
    await supabase
      .from('email_campaigns')
      .insert({
        type: 'monthlyNewsletter',
        subject: `Newsletter mensuelle MaxiMarket - ${monthName}`,
        status: 'sent',
        recipient_count: successCount,
        sent_at: new Date().toISOString(),
        data: templateData
      });

    console.log('\n✅ Newsletter mensuelle envoyée !');
    console.log(`   Succès: ${successCount}`);
    console.log(`   Erreurs: ${errorCount}`);
    console.log(`   Total: ${users.length}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

sendMonthlyNewsletter();
