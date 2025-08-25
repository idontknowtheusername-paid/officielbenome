#!/usr/bin/env node

/**
 * Script de test pour diagnostiquer le problème de boost packages
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (utiliser les vraies valeurs)
const SUPABASE_URL = 'https://vvlpgviacinsbggfsexs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bHBndmlhY2luc2JnZ2ZzZXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzOTM5MTMsImV4cCI6MjA0ODk2OTkxM30.e7pGwmWweFWPfgXJSBFBPOdGQgfgUVgrvRwEcZfN5Es';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testBoostPackages() {
  console.log('🔍 Test de diagnostic des packages de boost\n');
  
  try {
    // Test 1: Vérifier la connexion Supabase
    console.log('1. Test de connexion Supabase...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (healthError && !healthError.message.includes('row level security')) {
      console.log('❌ Erreur de connexion:', healthError.message);
      return;
    }
    console.log('✅ Connexion Supabase OK\n');
    
    // Test 2: Vérifier si la table boost_packages existe
    console.log('2. Test d\'existence de la table boost_packages...');
    const { data: packages, error: packagesError } = await supabase
      .from('boost_packages')
      .select('*')
      .limit(1);
    
    if (packagesError) {
      console.log('❌ Erreur table boost_packages:', packagesError.message);
      console.log('   Code d\'erreur:', packagesError.code);
      console.log('   Details:', packagesError.details);
      
      if (packagesError.code === '42P01') {
        console.log('\n💡 SOLUTION: La table boost_packages n\'existe pas.');
        console.log('   Vous devez exécuter le script SQL create-boost-packages.sql');
        console.log('   dans l\'interface Supabase SQL Editor.');
      }
      return;
    }
    
    console.log('✅ Table boost_packages accessible');
    console.log(`📦 Données trouvées: ${packages ? packages.length : 0} entrées\n`);
    
    // Test 3: Compter les packages actifs
    console.log('3. Test du nombre de packages actifs...');
    const { count, error: countError } = await supabase
      .from('boost_packages')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (countError) {
      console.log('❌ Erreur comptage:', countError.message);
      return;
    }
    
    console.log(`✅ Packages actifs: ${count || 0}`);
    
    if (count === 0) {
      console.log('\n💡 SOLUTION: Aucun package actif trouvé.');
      console.log('   Vous devez insérer des données dans la table boost_packages.');
    }
    
    // Test 4: Afficher les packages existants
    if (count > 0) {
      console.log('\n4. Liste des packages disponibles:');
      const { data: allPackages, error: listError } = await supabase
        .from('boost_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (listError) {
        console.log('❌ Erreur récupération liste:', listError.message);
        return;
      }
      
      allPackages.forEach(pkg => {
        console.log(`  📦 ${pkg.name} - ${pkg.price} FCFA - ${pkg.duration_days} jours`);
      });
    }
    
    console.log('\n🎉 Diagnostic terminé !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

async function createTestPackage() {
  console.log('\n🔧 Tentative de création d\'un package de test...');
  
  try {
    const testPackage = {
      name: 'Test Boost',
      description: 'Package de test',
      duration_days: 7,
      price: 1000.00,
      features: { priority: 'medium', badge: 'test' },
      sort_order: 999,
      is_active: true
    };
    
    const { data, error } = await supabase
      .from('boost_packages')
      .insert(testPackage)
      .select()
      .single();
    
    if (error) {
      console.log('❌ Erreur création package test:', error.message);
      console.log('   Code:', error.code);
      
      if (error.code === '42P01') {
        console.log('\n💡 La table boost_packages n\'existe pas !');
        console.log('   Exécutez le script create-boost-packages.sql');
      } else if (error.code === '42501') {
        console.log('\n💡 Permissions insuffisantes.');
        console.log('   Utilisez l\'interface Supabase SQL Editor.');
      }
    } else {
      console.log('✅ Package de test créé:', data.name);
    }
    
  } catch (error) {
    console.error('❌ Erreur création test:', error.message);
  }
}

// Exécuter les tests
async function main() {
  await testBoostPackages();
  await createTestPackage();
}

if (require.main === module) {
  main();
}

module.exports = { testBoostPackages };


