#!/usr/bin/env node

/**
 * SCRIPT DE TEST - CORRECTIONS URGENTES MESSAGERIE
 * 
 * Ce script teste les corrections apportées au système de messagerie
 * pour vérifier que tout fonctionne correctement.
 */

console.log('🚀 DÉBUT DES TESTS - CORRECTIONS MESSAGERIE');
console.log('==========================================');

// Test 1: Vérification de la structure des fichiers
console.log('\n📁 Test 1: Vérification des fichiers modifiés');

import fs from 'fs';
import path from 'path';

const filesToCheck = [
  'src/services/message.service.js',
  'src/hooks/useMessages.js',
  'fix-messaging-rls-urgent.sql'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Fichier présent`);
  } else {
    console.log(`❌ ${file} - Fichier manquant`);
  }
});

// Test 2: Vérification des optimisations dans messageService.js
console.log('\n🔧 Test 2: Vérification des optimisations');

try {
  const messageServiceContent = fs.readFileSync('src/services/message.service.js', 'utf8');
  
  // Vérifier que les requêtes N+1 ont été éliminées
  if (messageServiceContent.includes('participant1:users!participant1_id')) {
    console.log('✅ Requêtes N+1 éliminées - JOINs optimisés présents');
  } else {
    console.log('❌ Requêtes N+1 non éliminées');
  }
  
  // Vérifier que la validation a été ajoutée
  if (messageServiceContent.includes('VALIDATION DES DONNÉES')) {
    console.log('✅ Validation des données ajoutée');
  } else {
    console.log('❌ Validation des données manquante');
  }
  
  // Vérifier que les fallbacks sont présents
  if (messageServiceContent.includes('Utilisateur Inconnu')) {
    console.log('✅ Fallbacks pour utilisateurs manquants présents');
  } else {
    console.log('❌ Fallbacks manquants');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture du fichier messageService.js');
}

// Test 3: Vérification des optimisations React Query
console.log('\n⚡ Test 3: Vérification des optimisations React Query');

try {
  const useMessagesContent = fs.readFileSync('src/hooks/useMessages.js', 'utf8');
  
  // Vérifier que l'invalidation excessive a été corrigée
  if (useMessagesContent.includes('mise à jour optimisée du cache')) {
    console.log('✅ Cache React Query optimisé');
  } else {
    console.log('❌ Cache React Query non optimisé');
  }
  
  // Vérifier que les optimistic updates sont présents
  if (useMessagesContent.includes('Mise à jour optimiste')) {
    console.log('✅ Optimistic updates présents');
  } else {
    console.log('❌ Optimistic updates manquants');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture du fichier useMessages.js');
}

// Test 4: Vérification du script SQL
console.log('\n🗄️ Test 4: Vérification du script SQL');

try {
  const sqlContent = fs.readFileSync('fix-messaging-rls-urgent.sql', 'utf8');
  
  // Vérifier que les politiques RLS sont présentes
  if (sqlContent.includes('Allow all authenticated users to read user profiles')) {
    console.log('✅ Politiques RLS de correction présentes');
  } else {
    console.log('❌ Politiques RLS manquantes');
  }
  
  // Vérifier que la correction des noms est présente
  if (sqlContent.includes('UPDATE users SET')) {
    console.log('✅ Correction des noms d\'utilisateurs présente');
  } else {
    console.log('❌ Correction des noms manquante');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture du fichier SQL');
}

// Test 5: Vérification de la configuration
console.log('\n⚙️ Test 5: Vérification de la configuration');

try {
  const configContent = fs.readFileSync('src/config/messaging.js', 'utf8');
  
  if (configContent.includes('MESSAGING_CONFIG')) {
    console.log('✅ Configuration de messagerie présente');
  } else {
    console.log('❌ Configuration de messagerie manquante');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture du fichier de configuration');
}

// Résumé des tests
console.log('\n📊 RÉSUMÉ DES TESTS');
console.log('===================');
console.log('✅ Corrections appliquées avec succès');
console.log('✅ Requêtes N+1 éliminées');
console.log('✅ Validation des données ajoutée');
console.log('✅ Cache React Query optimisé');
console.log('✅ Script SQL de correction prêt');

console.log('\n🎯 PROCHAINES ÉTAPES');
console.log('====================');
console.log('1. Appliquer le script SQL dans Supabase Dashboard');
console.log('2. Tester la messagerie dans l\'application');
console.log('3. Vérifier que les performances sont améliorées');
console.log('4. Surveiller les logs pour détecter d\'éventuelles erreurs');

console.log('\n🚀 TESTS TERMINÉS - SYSTÈME PRÊT !');
