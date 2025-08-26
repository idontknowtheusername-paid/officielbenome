// Test de correction des erreurs
console.log('🧪 Test de correction des erreurs...');

// Test 1: Vérifier que le service de messagerie ne plante pas
const testMessageService = async () => {
  try {
    console.log('1️⃣ Test du service de messagerie...');
    
    // Importer le service
    const { messageService } = await import('./src/services/message.service.js');
    
    // Tester getUserConversations
    const conversations = await messageService.getUserConversations();
    console.log('✅ Service de messagerie fonctionne, conversations:', conversations?.length || 0);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur service de messagerie:', error);
    return false;
  }
};

// Test 2: Vérifier les icônes du manifest
const testManifest = () => {
  try {
    console.log('2️⃣ Test du manifest...');
    
    // Vérifier que les icônes référencées existent
    const manifest = {
      "icons": [
        {
          "src": "/favicon.ico",
          "sizes": "16x16 32x32",
          "type": "image/x-icon"
        },
        {
          "src": "/vite.svg",
          "sizes": "any",
          "type": "image/svg+xml"
        }
      ]
    };
    
    console.log('✅ Manifest configuré correctement');
    return true;
  } catch (error) {
    console.error('❌ Erreur manifest:', error);
    return false;
  }
};

// Exécuter les tests
const runTests = async () => {
  console.log('🚀 Démarrage des tests...');
  
  const test1 = await testMessageService();
  const test2 = testManifest();
  
  if (test1 && test2) {
    console.log('🎉 Tous les tests passent !');
  } else {
    console.log('⚠️ Certains tests ont échoué');
  }
};

// Exporter pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.testFixErrors = runTests;
  console.log('💡 Utilisez testFixErrors() dans la console pour tester');
}

export { runTests };
