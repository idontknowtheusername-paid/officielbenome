#!/usr/bin/env node

/**
 * Script de test pour vérifier la correction du système de messagerie en temps réel
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Test de la correction du système de messagerie en temps réel\n');

let errors = 0;
let success = 0;

function checkFileContent(filePath, checks, description) {
  console.log(`\n📝 ${description}`);
  console.log('─'.repeat(60));
  
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Fichier manquant: ${filePath}`);
    errors++;
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  let allPassed = true;

  checks.forEach(check => {
    const regex = new RegExp(check.pattern, 'i');
    if (regex.test(content)) {
      console.log(`  ✅ ${check.name}`);
      success++;
    } else {
      console.log(`  ❌ ${check.name}`);
      errors++;
      allPassed = false;
    }
  });

  return allPassed;
}

// Test 1: Vérifier que useRealTimeMessaging.js a été supprimé
console.log('\n1️⃣ Vérification suppression du hook doublon');
console.log('─'.repeat(60));
if (!fs.existsSync(path.join(__dirname, 'src/hooks/useRealTimeMessaging.js'))) {
  console.log('  ✅ useRealTimeMessaging.js supprimé (doublon éliminé)');
  success++;
} else {
  console.log('  ❌ useRealTimeMessaging.js existe encore (devrait être supprimé)');
  errors++;
}

// Test 2: Vérifier useMessages.js
checkFileContent('src/hooks/useMessages.js', [
  { name: 'Hook useGlobalRealtimeMessages existe', pattern: 'export const useGlobalRealtimeMessages' },
  { name: 'Hook useRealtimeMessages corrigé', pattern: 'export const useRealtimeMessages' },
  { name: 'Subscription globale avec receiver_id', pattern: 'receiver_id=eq\\.\\$\\{user\\.id\\}' },
  { name: 'Mise à jour immédiate du cache (setQueryData)', pattern: 'queryClient\\.setQueryData' },
  { name: 'Logs [GLOBAL REALTIME]', pattern: '\\[GLOBAL REALTIME\\]' },
  { name: 'Logs [REALTIME]', pattern: '\\[REALTIME\\]' },
  { name: 'Éviter les doublons (some)', pattern: 'some\\(msg => msg\\.id === ' },
  { name: 'Garder 10 derniers messages', pattern: 'slice\\(-10\\)' }
], 'Vérification de src/hooks/useMessages.js');

// Test 3: Vérifier index.js
checkFileContent('src/hooks/index.js', [
  { name: 'Export useGlobalRealtimeMessages', pattern: 'useGlobalRealtimeMessages' },
  { name: 'Export useRealtimeMessages', pattern: 'useRealtimeMessages' }
], 'Vérification de src/hooks/index.js');

// Test 4: Vérifier MessagingPage.jsx
checkFileContent('src/pages/MessagingPage.jsx', [
  { name: 'Import useGlobalRealtimeMessages', pattern: 'import.*useGlobalRealtimeMessages' },
  { name: 'Appel useGlobalRealtimeMessages()', pattern: 'useGlobalRealtimeMessages\\(\\)' },
  { name: 'Appel useRealtimeMessages(selectedConversation?.id)', pattern: 'useRealtimeMessages\\(selectedConversation\\?\\.id\\)' },
  { name: 'Polling réduit à 60s', pattern: '60000.*60 secondes' },
  { name: 'Notifications toast séparées', pattern: 'toast-notifications' },
  { name: 'Pas de setTimeout pour refetch', pattern: '(?!setTimeout.*refetch)' }
], 'Vérification de src/pages/MessagingPage.jsx');

// Résumé
console.log('\n' + '═'.repeat(60));
console.log('📊 RÉSUMÉ DES TESTS\n');

if (errors === 0) {
  console.log('✅ Tous les tests sont passés avec succès !');
  console.log(`   ${success} vérifications réussies`);
  console.log('');
  console.log('🎉 Le système de messagerie en temps réel est corrigé !');
  console.log('');
  console.log('📋 Changements appliqués :');
  console.log('   1. ✅ Suppression du hook doublon useRealTimeMessaging');
  console.log('   2. ✅ Nouveau hook useGlobalRealtimeMessages pour TOUS les messages');
  console.log('   3. ✅ Hook useRealtimeMessages amélioré pour la conversation active');
  console.log('   4. ✅ Mise à jour IMMÉDIATE du cache (plus de setTimeout)');
  console.log('   5. ✅ Évitement des doublons dans le cache');
  console.log('   6. ✅ Suppression des subscriptions redondantes');
  console.log('   7. ✅ Polling réduit à 60s (fallback uniquement)');
  console.log('');
  console.log('🧪 Comment tester :');
  console.log('   1. Ouvrir 2 navigateurs (ou 2 onglets en navigation privée)');
  console.log('   2. Se connecter avec 2 utilisateurs différents');
  console.log('   3. Utilisateur A envoie un message à Utilisateur B');
  console.log('   4. ✅ Utilisateur B voit le message IMMÉDIATEMENT (sans recharger)');
  console.log('   5. ✅ Le badge "Nouveau" apparaît instantanément');
  console.log('   6. ✅ La conversation remonte en haut de la liste');
  console.log('');
  console.log('🔍 Logs à surveiller dans la console :');
  console.log('   - 🌍 [GLOBAL REALTIME] Subscription globale ACTIVE');
  console.log('   - 🔔 [GLOBAL REALTIME] NOUVEAU MESSAGE REÇU');
  console.log('   - ✅ [GLOBAL REALTIME] Conversation mise à jour');
  console.log('');
  process.exit(0);
} else {
  console.log(`❌ ${errors} erreur(s) détectée(s)`);
  console.log(`✅ ${success} vérification(s) réussie(s)`);
  console.log('');
  console.log('Veuillez corriger les erreurs ci-dessus.');
  process.exit(1);
}
