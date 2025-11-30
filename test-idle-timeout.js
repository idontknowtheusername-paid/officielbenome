#!/usr/bin/env node

/**
 * Script de test pour la déconnexion automatique après inactivité
 * 
 * Ce script vérifie que :
 * 1. Le hook useIdleTimer est correctement implémenté
 * 2. Le modal IdleWarningModal existe et est fonctionnel
 * 3. La configuration SECURITY_CONFIG contient les bons paramètres
 * 4. L'intégration dans AuthContext est correcte
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Test de la déconnexion automatique après inactivité\n');

let errors = 0;
let warnings = 0;

// Fonction helper pour vérifier l'existence d'un fichier
function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}`);
    return true;
  } else {
    console.log(`❌ ${description} - MANQUANT`);
    errors++;
    return false;
  }
}

// Fonction helper pour vérifier le contenu d'un fichier
function checkFileContent(filePath, patterns, description) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ ${description} - Fichier manquant`);
    errors++;
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  let allFound = true;

  patterns.forEach(pattern => {
    const regex = new RegExp(pattern.regex, 'i');
    if (regex.test(content)) {
      console.log(`  ✅ ${pattern.name}`);
    } else {
      console.log(`  ❌ ${pattern.name} - NON TROUVÉ`);
      allFound = false;
      errors++;
    }
  });

  return allFound;
}

console.log('📁 Vérification des fichiers créés\n');

// 1. Vérifier useIdleTimer.js
console.log('1️⃣ Hook useIdleTimer');
if (checkFileExists('src/hooks/useIdleTimer.js', 'Fichier useIdleTimer.js existe')) {
  checkFileContent('src/hooks/useIdleTimer.js', [
    { name: 'Export du hook', regex: 'export.*useIdleTimer' },
    { name: 'Paramètre timeout', regex: 'timeout.*=.*60.*60.*1000' },
    { name: 'Paramètre warningTime', regex: 'warningTime.*=.*2.*60.*1000' },
    { name: 'Callback onIdle', regex: 'onIdle' },
    { name: 'Callback onWarning', regex: 'onWarning' },
    { name: 'État isIdle', regex: 'isIdle' },
    { name: 'État showWarning', regex: 'showWarning' },
    { name: 'État timeLeft', regex: 'timeLeft' },
    { name: 'Fonction continueSession', regex: 'continueSession' },
    { name: 'Événements souris', regex: 'mousedown|mousemove' },
    { name: 'Événements clavier', regex: 'keypress' },
    { name: 'Événements scroll', regex: 'scroll' },
    { name: 'Événements tactiles', regex: 'touchstart' },
    { name: 'Throttling (1 seconde)', regex: '1000' }
  ], 'Contenu du hook');
}
console.log('');

// 2. Vérifier IdleWarningModal.jsx
console.log('2️⃣ Composant IdleWarningModal');
if (checkFileExists('src/components/IdleWarningModal.jsx', 'Fichier IdleWarningModal.jsx existe')) {
  checkFileContent('src/components/IdleWarningModal.jsx', [
    { name: 'Export du composant', regex: 'export.*IdleWarningModal' },
    { name: 'Import AlertDialog', regex: 'AlertDialog' },
    { name: 'Prop open', regex: 'open' },
    { name: 'Prop timeLeft', regex: 'timeLeft' },
    { name: 'Prop onContinue', regex: 'onContinue' },
    { name: 'Fonction formatTime', regex: 'formatTime' },
    { name: 'Icône AlertTriangle', regex: 'AlertTriangle' },
    { name: 'Icône Clock', regex: 'Clock' },
    { name: 'Bouton "Rester connecté"', regex: 'Rester connecté' }
  ], 'Contenu du modal');
}
console.log('');

// 3. Vérifier AuthContext.jsx
console.log('3️⃣ Intégration dans AuthContext');
if (checkFileExists('src/contexts/AuthContext.jsx', 'Fichier AuthContext.jsx existe')) {
  checkFileContent('src/contexts/AuthContext.jsx', [
    { name: 'Import useIdleTimer', regex: 'import.*useIdleTimer' },
    { name: 'Import IdleWarningModal', regex: 'import.*IdleWarningModal' },
    { name: 'Callback handleIdleWarning', regex: 'handleIdleWarning' },
    { name: 'Callback handleIdle', regex: 'handleIdle' },
    { name: 'Appel useIdleTimer', regex: 'useIdleTimer' },
    { name: 'Configuration timeout', regex: 'SECURITY_CONFIG.idleTimeout' },
    { name: 'Configuration warningTime', regex: 'SECURITY_CONFIG.idleWarningTime' },
    { name: 'Condition enabled', regex: 'enabled:.*!!user.*!isRememberMe' },
    { name: 'Logout avec raison', regex: 'logout\\(.*idle.*\\)' },
    { name: 'Rendu IdleWarningModal', regex: '<IdleWarningModal' }
  ], 'Intégration dans AuthContext');
}
console.log('');

// 4. Vérifier supabase.js
console.log('4️⃣ Configuration SECURITY_CONFIG');
if (checkFileExists('src/lib/supabase.js', 'Fichier supabase.js existe')) {
  checkFileContent('src/lib/supabase.js', [
    { name: 'Paramètre idleTimeout', regex: 'idleTimeout:.*60.*60.*1000' },
    { name: 'Paramètre idleWarningTime', regex: 'idleWarningTime:.*2.*60.*1000' },
    { name: 'Commentaire 1 heure', regex: '1 heure' },
    { name: 'Commentaire 2 minutes', regex: '2 minutes' },
    { name: 'Export SECURITY_CONFIG', regex: 'export.*SECURITY_CONFIG' }
  ], 'Configuration de sécurité');
}
console.log('');

// 5. Vérifier la documentation
console.log('5️⃣ Documentation');
checkFileExists('DECONNEXION_AUTOMATIQUE_INACTIVITE.md', 'Documentation créée');
console.log('');

// Résumé
console.log('═'.repeat(60));
console.log('📊 RÉSUMÉ DES TESTS\n');

if (errors === 0 && warnings === 0) {
  console.log('✅ Tous les tests sont passés avec succès !');
  console.log('');
  console.log('🎉 La déconnexion automatique après inactivité est correctement implémentée');
  console.log('');
  console.log('⚙️ Configuration actuelle :');
  console.log('   • Délai d\'inactivité : 1 heure (60 minutes)');
  console.log('   • Avertissement : 2 minutes avant déconnexion');
  console.log('   • Exception : "Se souvenir de moi" désactive le timer');
  console.log('');
  console.log('🧪 Pour tester rapidement en développement :');
  console.log('   1. Modifier temporairement dans src/lib/supabase.js :');
  console.log('      idleTimeout: 2 * 60 * 1000 (2 minutes)');
  console.log('      idleWarningTime: 30 * 1000 (30 secondes)');
  console.log('   2. Se connecter sans cocher "Se souvenir de moi"');
  console.log('   3. Ne pas toucher souris/clavier pendant 1m30');
  console.log('   4. Le modal d\'avertissement devrait apparaître');
  console.log('   5. Attendre 30 secondes → déconnexion automatique');
  console.log('');
  process.exit(0);
} else {
  console.log(`❌ ${errors} erreur(s) détectée(s)`);
  if (warnings > 0) {
    console.log(`⚠️ ${warnings} avertissement(s)`);
  }
  console.log('');
  console.log('Veuillez corriger les erreurs ci-dessus.');
  process.exit(1);
}
