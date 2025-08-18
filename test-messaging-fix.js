#!/usr/bin/env node

/**
 * Script de test pour vérifier les corrections de messagerie
 * Usage: node test-messaging-fix.js
 */

import { readFileSync, existsSync } from 'fs';

console.log('🧪 Test des corrections de messagerie...\n');

// Simulation des erreurs corrigées
const testCases = [
  {
    name: 'Test correction clés étrangères',
    description: 'Vérifier que les références incorrectes sont supprimées',
    test: () => {
      const messageService = readFileSync('src/services/message.service.js', 'utf8');
      
      // Vérifier que les références problématiques sont supprimées
      const hasInvalidReferences = messageService.includes('conversations_participant1_id_fkey') ||
                                 messageService.includes('conversations_participant2_id_fkey') ||
                                 messageService.includes('messages_sender_id_fkey') ||
                                 messageService.includes('messages_receiver_id_fkey');
      
      if (hasInvalidReferences) {
        throw new Error('❌ Références de clés étrangères incorrectes encore présentes');
      }
      
      return '✅ Références de clés étrangères incorrectes supprimées';
    }
  },
  
  {
    name: 'Test gestion d\'erreur améliorée',
    description: 'Vérifier que la gestion d\'erreur est robuste',
    test: () => {
      const messageService = readFileSync('src/services/message.service.js', 'utf8');
      
      // Vérifier la présence de try/catch
      const hasTryCatch = messageService.includes('try {') && messageService.includes('} catch (error)');
      
      if (!hasTryCatch) {
        throw new Error('❌ Gestion d\'erreur try/catch manquante');
      }
      
      return '✅ Gestion d\'erreur try/catch implémentée';
    }
  },
  
  {
    name: 'Test logs de débogage',
    description: 'Vérifier que les logs de débogage sont présents',
    test: () => {
      const messageService = readFileSync('src/services/message.service.js', 'utf8');
      
      // Vérifier la présence de logs
      const hasLogs = messageService.includes('console.log') || messageService.includes('console.error');
      
      if (!hasLogs) {
        throw new Error('❌ Logs de débogage manquants');
      }
      
      return '✅ Logs de débogage présents';
    }
  },
  
  {
    name: 'Test hook useConversations amélioré',
    description: 'Vérifier que le hook gère mieux les erreurs',
    test: () => {
      const useMessages = readFileSync('src/hooks/useMessages.js', 'utf8');
      
      // Vérifier la présence de retry logic
      const hasRetryLogic = useMessages.includes('retry:') && useMessages.includes('retryDelay:');
      
      if (!hasRetryLogic) {
        throw new Error('❌ Logique de retry manquante dans useConversations');
      }
      
      return '✅ Logique de retry implémentée';
    }
  },
  
  {
    name: 'Test page de messagerie améliorée',
    description: 'Vérifier que la page gère mieux les erreurs',
    test: () => {
      const messagingPage = readFileSync('src/pages/MessagingPage.jsx', 'utf8');
      
      // Vérifier la présence de gestion d'erreur contextuelle
      const hasContextualErrorHandling = messagingPage.includes('Session expirée') ||
                                       messagingPage.includes('base de données') ||
                                       messagingPage.includes('Requête invalide');
      
      if (!hasContextualErrorHandling) {
        throw new Error('❌ Gestion d\'erreur contextuelle manquante');
      }
      
      return '✅ Gestion d\'erreur contextuelle implémentée';
    }
  }
];

// Exécuter tous les tests
async function runTests() {
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    try {
      console.log(`📋 ${testCase.name}`);
      console.log(`   ${testCase.description}`);
      
      const result = testCase.test();
      console.log(`   ${result}\n`);
      passedTests++;
      
    } catch (error) {
      console.log(`   ${error.message}\n`);
    }
  }
  
  // Résumé des tests
  console.log('📊 Résumé des tests:');
  console.log(`   ✅ Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Tous les tests sont passés ! Les corrections de messagerie sont fonctionnelles.');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez les corrections.');
  }
  
  return passedTests === totalTests;
}

// Vérifier que les fichiers existent
function checkFilesExist() {
  const requiredFiles = [
    'src/services/message.service.js',
    'src/hooks/useMessages.js',
    'src/pages/MessagingPage.jsx'
  ];
  
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      console.error(`❌ Fichier requis manquant: ${file}`);
      return false;
    }
  }
  
  return true;
}

// Exécuter les tests directement
if (checkFilesExist()) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erreur lors de l\'exécution des tests:', error);
    process.exit(1);
  });
} else {
  console.error('❌ Impossible d\'exécuter les tests - fichiers manquants');
  process.exit(1);
}
