#!/usr/bin/env node
// ============================================================================
// SCRIPT DE VÉRIFICATION DE L'INTÉGRATION LYGOS
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { lygosService } from './src/services/payment/lygos.service.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                          ║');
console.log('║           🔍 VÉRIFICATION DE L\'INTÉGRATION LYGOS                        ║');
console.log('║                                                                          ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

let allChecks = [];

// Fonction pour afficher un résultat de vérification
function check(name, passed, details = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
  allChecks.push({ name, passed, details });
}

// 1. Vérifier les variables d'environnement
console.log('1️⃣  Variables d\'environnement\n');
check('VITE_LYGOS_API_KEY', !!process.env.VITE_LYGOS_API_KEY, 
  process.env.VITE_LYGOS_API_KEY ? 'Configurée' : 'MANQUANTE - Ajouter dans .env.local');
check('VITE_SUPABASE_URL', !!SUPABASE_URL, 
  SUPABASE_URL || 'MANQUANTE');
check('VITE_SUPABASE_ANON_KEY', !!SUPABASE_KEY, 
  SUPABASE_KEY ? 'Configurée' : 'MANQUANTE');
console.log('');

// 2. Vérifier la configuration Lygos
console.log('2️⃣  Configuration Lygos\n');
const lygosConfigured = lygosService.isConfigured();
check('Service Lygos', lygosConfigured, 
  lygosConfigured ? 'Configuré et prêt' : 'Non configuré');
console.log('');

// 3. Vérifier les tables Supabase
console.log('3️⃣  Tables Supabase\n');
if (SUPABASE_URL && SUPABASE_KEY) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  try {
    // Vérifier boost_packages
    const { data: packages, error: packagesError } = await supabase
      .from('boost_packages')
      .select('count')
      .limit(1);
    
    check('Table boost_packages', !packagesError, 
      packagesError ? packagesError.message : 'Table accessible');
    
    // Vérifier listing_boosts
    const { data: boosts, error: boostsError } = await supabase
      .from('listing_boosts')
      .select('count')
      .limit(1);
    
    check('Table listing_boosts', !boostsError, 
      boostsError ? boostsError.message : 'Table accessible');
    
    // Vérifier boost_history
    const { data: history, error: historyError } = await supabase
      .from('boost_history')
      .select('count')
      .limit(1);
    
    check('Table boost_history', !historyError, 
      historyError ? historyError.message : 'Table accessible');
    
    // Compter les packages actifs
    const { data: activePackages, error: countError } = await supabase
      .from('boost_packages')
      .select('*')
      .eq('is_active', true);
    
    check('Packages de boost', !countError && activePackages?.length > 0, 
      countError ? countError.message : `${activePackages?.length || 0} package(s) actif(s)`);
    
  } catch (error) {
    check('Connexion Supabase', false, error.message);
  }
} else {
  check('Connexion Supabase', false, 'Variables d\'environnement manquantes');
}
console.log('');

// 4. Vérifier les fichiers créés
console.log('4️⃣  Fichiers de l\'intégration\n');
import { existsSync } from 'fs';

const files = [
  'src/services/payment/lygos.service.js',
  'src/services/payment/index.js',
  'src/pages/payment/BoostPaymentPage.jsx',
  'src/pages/admin/payments/PaymentsPage.jsx',
  'api/webhooks/lygos.js',
  'test-lygos-integration.js',
  'supabase-update-boost-for-lygos.sql',
  'INTEGRATION_LYGOS_COMPLETE.md',
  'GUIDE_CONFIGURATION_LYGOS.md',
  'LYGOS_QUICK_START.md'
];

files.forEach(file => {
  check(file, existsSync(file), existsSync(file) ? 'Existe' : 'MANQUANT');
});
console.log('');

// 5. Test de connexion Lygos (si configuré)
if (lygosConfigured) {
  console.log('5️⃣  Test de connexion Lygos\n');
  try {
    const accountInfo = await lygosService.getAccountInfo();
    check('Connexion API Lygos', accountInfo.success, 
      accountInfo.success ? 'Connexion réussie' : accountInfo.message);
    
    const paymentMethods = await lygosService.getPaymentMethods();
    check('Méthodes de paiement', paymentMethods.success, 
      paymentMethods.success ? `${paymentMethods.data?.length || 0} méthode(s) disponible(s)` : paymentMethods.message);
  } catch (error) {
    check('Test API Lygos', false, error.message);
  }
  console.log('');
}

// Résumé final
console.log('═══════════════════════════════════════════════════════════════════════════');
const passed = allChecks.filter(c => c.passed).length;
const total = allChecks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`\n📊 Résultat: ${passed}/${total} vérifications réussies (${percentage}%)\n`);

if (percentage === 100) {
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                          ║');
  console.log('║                  ✅ INTÉGRATION LYGOS COMPLÈTE ✅                        ║');
  console.log('║                                                                          ║');
  console.log('║              Tous les composants sont correctement configurés           ║');
  console.log('║                                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log('🚀 Prochaines étapes:');
  console.log('   1. Exécuter: npm run dev');
  console.log('   2. Tester: http://localhost:5173/boost');
  console.log('   3. Configurer le webhook en production');
  console.log('   4. Déployer sur Vercel\n');
} else if (percentage >= 80) {
  console.log('⚠️  L\'intégration est presque complète');
  console.log('   Vérifiez les éléments marqués ❌ ci-dessus\n');
} else {
  console.log('❌ L\'intégration nécessite des corrections');
  console.log('   Consultez GUIDE_CONFIGURATION_LYGOS.md pour plus d\'aide\n');
}

// Afficher les problèmes
const failed = allChecks.filter(c => !c.passed);
if (failed.length > 0) {
  console.log('🔧 Problèmes à résoudre:\n');
  failed.forEach((check, index) => {
    console.log(`   ${index + 1}. ${check.name}`);
    if (check.details) {
      console.log(`      → ${check.details}`);
    }
  });
  console.log('');
}

process.exit(percentage === 100 ? 0 : 1);
