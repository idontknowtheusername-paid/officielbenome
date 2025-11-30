#!/usr/bin/env node

/**
 * Test pour comparer abonnés newsletter vs tous les utilisateurs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function compareRecipients() {
  console.log('📊 Comparaison des destinataires potentiels\n');
  console.log('='.repeat(60));

  // 1. Abonnés newsletter
  console.log('\n1️⃣ Abonnés Newsletter');
  console.log('-'.repeat(60));
  
  const { data: subscribers, error: subsError } = await supabase
    .from('newsletter_subscribers')
    .select('email, subscribed_at, source')
    .eq('is_active', true);

  if (subsError) {
    console.error('❌ Erreur:', subsError.message);
  } else {
    console.log(`✅ ${subscribers.length} abonnés newsletter actifs`);
    if (subscribers.length > 0) {
      console.log('\nExemples:');
      subscribers.slice(0, 3).forEach((sub, i) => {
        console.log(`   ${i + 1}. ${sub.email} (${sub.source || 'N/A'})`);
      });
      if (subscribers.length > 3) {
        console.log(`   ... et ${subscribers.length - 3} autres`);
      }
    }
  }

  // 2. Tous les utilisateurs
  console.log('\n2️⃣ Tous les Utilisateurs de la Plateforme');
  console.log('-'.repeat(60));
  
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('email, created_at, role')
    .not('email', 'is', null);

  if (usersError) {
    console.error('❌ Erreur:', usersError.message);
  } else {
    console.log(`✅ ${users.length} utilisateurs avec email`);
    if (users.length > 0) {
      console.log('\nExemples:');
      users.slice(0, 5).forEach((user, i) => {
        console.log(`   ${i + 1}. ${user.email} (${user.role || 'user'})`);
      });
      if (users.length > 5) {
        console.log(`   ... et ${users.length - 5} autres`);
      }
    }
  }

  // 3. Comparaison
  console.log('\n📈 COMPARAISON');
  console.log('='.repeat(60));
  
  if (!subsError && !usersError) {
    const difference = users.length - subscribers.length;
    const percentage = subscribers.length > 0 
      ? ((subscribers.length / users.length) * 100).toFixed(1)
      : 0;

    console.log(`Abonnés newsletter:     ${subscribers.length}`);
    console.log(`Tous les utilisateurs:  ${users.length}`);
    console.log(`Différence:             ${difference} utilisateurs supplémentaires`);
    console.log(`Taux d'abonnement:      ${percentage}%`);

    // 4. Recommandation
    console.log('\n💡 RECOMMANDATION');
    console.log('='.repeat(60));
    
    if (difference > 0) {
      console.log(`✅ Envoyer aux TOUS les utilisateurs (${users.length} destinataires)`);
      console.log(`   → ${difference} utilisateurs supplémentaires seront touchés`);
      console.log(`   → Meilleure portée pour newsletters et offres spéciales`);
    } else {
      console.log(`ℹ️  Tous les utilisateurs sont déjà abonnés à la newsletter`);
    }

    // 5. Simulation d'envoi
    console.log('\n📧 SIMULATION D\'ENVOI');
    console.log('='.repeat(60));
    
    console.log('\nOption 1: Abonnés newsletter uniquement');
    console.log(`   → ${subscribers.length} emails envoyés`);
    console.log(`   → Utilisateurs ayant explicitement demandé la newsletter`);
    
    console.log('\nOption 2: Tous les utilisateurs (RECOMMANDÉ)');
    console.log(`   → ${users.length} emails envoyés`);
    console.log(`   → Portée maximale pour newsletters et offres`);
    console.log(`   → ${difference} utilisateurs supplémentaires touchés`);

    // 6. Répartition par rôle
    console.log('\n👥 RÉPARTITION PAR RÔLE');
    console.log('='.repeat(60));
    
    const roles = {};
    users.forEach(user => {
      const role = user.role || 'user';
      roles[role] = (roles[role] || 0) + 1;
    });

    Object.entries(roles).forEach(([role, count]) => {
      const percentage = ((count / users.length) * 100).toFixed(1);
      console.log(`${role}: ${count} (${percentage}%)`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Analyse terminée');
  console.log('='.repeat(60));
}

compareRecipients().catch(console.error);
