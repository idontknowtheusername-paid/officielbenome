#!/usr/bin/env node
// ============================================================================
// VÉRIFIER LES COLONNES SUPABASE POUR LYGOS
// ============================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('\n🔍 Vérification des colonnes de la table listing_boosts...\n');

async function checkColumns() {
  try {
    // Récupérer un boost pour voir les colonnes disponibles
    const { data, error } = await supabase
      .from('listing_boosts')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }

    const columnsNeeded = [
      'payment_reference',
      'payment_amount',
      'payment_currency',
      'payment_method',
      'payment_status',
      'refund_reference',
      'refunded_at',
      'metadata'
    ];

    console.log('📊 Colonnes existantes dans listing_boosts:');
    
    if (data && data.length > 0) {
      const existingColumns = Object.keys(data[0]);
      console.log('   ', existingColumns.join(', '));
      console.log('');
      
      console.log('✅ Colonnes nécessaires pour Lygos:');
      columnsNeeded.forEach(col => {
        const exists = existingColumns.includes(col);
        console.log(`   ${exists ? '✅' : '❌'} ${col}`);
      });
    } else {
      console.log('⚠️  Aucun boost trouvé dans la table');
      console.log('   Impossible de vérifier les colonnes');
      console.log('');
      console.log('📝 Action requise:');
      console.log('   Exécuter: supabase-update-boost-for-lygos.sql');
    }

    console.log('');
    
    // Vérifier les packages
    const { data: packages, error: pkgError } = await supabase
      .from('boost_packages')
      .select('*')
      .eq('is_active', true);

    if (pkgError) {
      console.error('❌ Erreur packages:', pkgError.message);
    } else {
      console.log(`📦 Packages de boost actifs: ${packages?.length || 0}`);
      if (packages && packages.length > 0) {
        packages.forEach(pkg => {
          console.log(`   • ${pkg.name} - ${pkg.price} XOF - ${pkg.duration_days} jours`);
        });
      } else {
        console.log('⚠️  Aucun package actif trouvé');
        console.log('');
        console.log('📝 Action requise:');
        console.log('   Exécuter: supabase-boost-packages-lygos.sql');
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkColumns();
