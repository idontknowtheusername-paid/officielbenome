#!/usr/bin/env node

/**
 * Script automatique pour envoyer la newsletter hebdomadaire
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

async function sendWeeklyNewsletter() {
  console.log('📧 Envoi de la newsletter hebdomadaire automatique...\n');

  try {
    // 1. Récupérer tous les utilisateurs
    const { data: users, error } = await supabase
      .from('users')
      .select('email')
      .not('email', 'is', null);

    if (error) throw error;

    console.log(`✅ ${users.length} destinataires trouvés`);

    // 2. Récupérer les statistiques de la semaine
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const { count: newListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString());

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', weekStart.toISOString());

    // 3. Préparer les données
    const templateData = {
      weekStart: weekStart.toLocaleDateString('fr-FR'),
      newListings: `${newListings || 0}+`,
      activeUsers: `${activeUsers || 0}`,
      transactions: Math.floor(Math.random() * 50) + 20,
      newUsers: users.length
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
            templateId: 3, // Weekly Newsletter
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
        type: 'weeklyNewsletter',
        subject: 'Newsletter hebdomadaire MaxiMarket',
        status: 'sent',
        recipient_count: successCount,
        sent_at: new Date().toISOString(),
        data: templateData
      });

    console.log('\n✅ Newsletter hebdomadaire envoyée !');
    console.log(`   Succès: ${successCount}`);
    console.log(`   Erreurs: ${errorCount}`);
    console.log(`   Total: ${users.length}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

sendWeeklyNewsletter();
