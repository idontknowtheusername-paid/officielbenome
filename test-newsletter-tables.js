#!/usr/bin/env node

/**
 * Test des tables newsletter dans Supabase
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

async function testTables() {
  console.log('🧪 Test des tables newsletter...\n');

  // Test 1: newsletter_subscribers
  console.log('1️⃣ Test table newsletter_subscribers...');
  try {
    const { data, error, count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (error) {
      console.error('❌ Erreur:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log(`✅ Table existe - ${count} abonnés trouvés`);
      if (data && data.length > 0) {
        console.log('   Premier abonné:', data[0].email);
      }
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }

  // Test 2: email_campaigns
  console.log('\n2️⃣ Test table email_campaigns...');
  try {
    const { data, error, count } = await supabase
      .from('email_campaigns')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (error) {
      console.error('❌ Erreur:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log(`✅ Table existe - ${count} campagnes trouvées`);
      if (data && data.length > 0) {
        console.log('   Première campagne:', data[0].type);
      }
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }

  // Test 3: Vérifier les colonnes de newsletter_subscribers
  console.log('\n3️⃣ Structure table newsletter_subscribers...');
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Erreur:', error.message);
    } else if (data) {
      console.log('✅ Colonnes disponibles:', Object.keys(data).join(', '));
    } else {
      console.log('⚠️  Table vide, impossible de vérifier les colonnes');
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }

  // Test 4: Vérifier les colonnes de email_campaigns
  console.log('\n4️⃣ Structure table email_campaigns...');
  try {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Erreur:', error.message);
    } else if (data) {
      console.log('✅ Colonnes disponibles:', Object.keys(data).join(', '));
    } else {
      console.log('⚠️  Table vide, impossible de vérifier les colonnes');
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests terminés');
}

testTables().catch(console.error);
