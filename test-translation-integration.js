// Test d'intégration du service de traduction
import { TranslationService } from './src/services/translation.service.js';

async function testTranslationIntegration() {
  console.log('🧪 Test d\'intégration du service de traduction...\n');
  
  try {
    // Créer une instance du service
    const translationService = new TranslationService();
    
    // Attendre l'initialisation
    await translationService.initialize();
    
    console.log('📊 Statut du service:');
    console.log(`- Configuré: ${translationService.isConfigured}`);
    console.log(`- API Key: ${translationService.apiKey ? '✅ Présente' : '❌ Manquante'}\n`);
    
    if (!translationService.isConfigured) {
      console.log('❌ Service non configuré. Vérifiez VITE_GOOGLE_TRANSLATE_API_KEY');
      return;
    }
    
    // Test de traduction
    const testCases = [
      { text: 'Hello world', source: 'en', target: 'fr' },
      { text: 'Good morning', source: 'en', target: 'fr' },
      { text: 'Thank you', source: 'en', target: 'fr' }
    ];
    
    console.log('🌍 Tests de traduction:');
    
    for (const testCase of testCases) {
      console.log(`\n📝 Test: "${testCase.text}" (${testCase.source} → ${testCase.target})`);
      
      try {
        const translation = await translationService.translateText(
          testCase.text, 
          testCase.target, 
          testCase.source
        );
        
        console.log(`✅ Résultat: "${translation}"`);
      } catch (error) {
        console.log(`❌ Erreur: ${error.message}`);
      }
    }
    
    // Test des statistiques de cache
    console.log('\n📊 Statistiques de cache:');
    console.log(`- Cache hits: ${translationService.cacheHits}`);
    console.log(`- Cache misses: ${translationService.cacheMisses}`);
    console.log(`- Taille du cache: ${translationService.cache.size}`);
    
    console.log('\n🎉 Test d\'intégration terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testTranslationIntegration();
