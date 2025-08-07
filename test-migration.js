#!/usr/bin/env node

/**
 * Script de test pour vérifier la migration vers Supabase
 * Usage: node test-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Test de la migration vers Supabase...\n');

// Tests à effectuer
const tests = [
  {
    name: 'Connexion à Supabase',
    test: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return '✅ Connexion réussie';
    }
  },
  {
    name: 'Vérification de la table users',
    test: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      return `✅ Table users accessible (${data.length} enregistrements)`;
    }
  },
  {
    name: 'Vérification de la table listings',
    test: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      return `✅ Table listings accessible (${data.length} enregistrements)`;
    }
  },
  {
    name: 'Vérification de la table categories',
    test: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      return `✅ Table categories accessible (${data.length} enregistrements)`;
    }
  },
  {
    name: 'Vérification de la table transactions',
    test: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('⚠️  Table transactions non trouvée - à créer avec supabase-missing-tables.sql');
        return '⚠️  Table transactions manquante';
      }
      return `✅ Table transactions accessible (${data.length} enregistrements)`;
    }
  },
  {
    name: 'Vérification de la table reports',
    test: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('⚠️  Table reports non trouvée - à créer avec supabase-missing-tables.sql');
        return '⚠️  Table reports manquante';
      }
      return `✅ Table reports accessible (${data.length} enregistrements)`;
    }
  },
  {
    name: 'Test des politiques RLS',
    test: async () => {
      // Tester l'accès anonyme (devrait être limité)
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        return '✅ Politiques RLS actives (accès anonyme bloqué)';
      } else if (error) {
        throw error;
      } else {
        return '⚠️  Politiques RLS potentiellement désactivées';
      }
    }
  },
  {
    name: 'Test du storage',
    test: async () => {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) throw error;
      
      const hasImagesBucket = data.some(bucket => bucket.name === 'images');
      if (hasImagesBucket) {
        return '✅ Bucket images trouvé';
      } else {
        return '⚠️  Bucket images manquant';
      }
    }
  }
];

// Exécuter les tests
async function runTests() {
  let passed = 0;
  let failed = 0;
  let warnings = 0;

  for (const test of tests) {
    try {
      console.log(`🔍 ${test.name}...`);
      const result = await test.test();
      console.log(`   ${result}\n`);
      
      if (result.includes('✅')) {
        passed++;
      } else if (result.includes('⚠️')) {
        warnings++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Échec: ${error.message}\n`);
      failed++;
    }
  }

  // Résumé
  console.log('📊 Résumé des tests:');
  console.log(`   ✅ Réussis: ${passed}`);
  console.log(`   ⚠️  Avertissements: ${warnings}`);
  console.log(`   ❌ Échecs: ${failed}`);
  console.log(`   📈 Total: ${passed + warnings + failed}\n`);

  if (failed === 0) {
    console.log('🎉 Migration vers Supabase réussie !');
    if (warnings > 0) {
      console.log('💡 Consultez les avertissements ci-dessus pour les améliorations.');
    }
  } else {
    console.log('❌ Certains tests ont échoué. Vérifiez la configuration.');
    process.exit(1);
  }
}

// Tests supplémentaires pour les services
async function testServices() {
  console.log('🔧 Test des services Supabase...\n');

  try {
    // Test du service de catégories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (catError) throw catError;
    console.log(`✅ Service categories: ${categories.length} catégories trouvées`);

    // Test du service de listings
    const { data: listings, error: listError } = await supabase
      .from('listings')
      .select('*, categories(*)')
      .limit(5);
    
    if (listError) throw listError;
    console.log(`✅ Service listings: ${listings.length} annonces trouvées`);

    // Test des relations
    if (listings.length > 0 && listings[0].categories) {
      console.log('✅ Relations entre tables fonctionnelles');
    }

  } catch (error) {
    console.log(`❌ Erreur lors du test des services: ${error.message}`);
  }
}

// Exécuter tous les tests
async function main() {
  await runTests();
  await testServices();
  
  console.log('\n📋 Prochaines étapes recommandées:');
  console.log('   1. Exécuter supabase-missing-tables.sql si des tables manquent');
  console.log('   2. Vérifier les politiques RLS');
  console.log('   3. Tester l\'authentification');
  console.log('   4. Vérifier les permissions de storage');
  console.log('   5. Lancer l\'application et tester les fonctionnalités');
}

main().catch(console.error); 