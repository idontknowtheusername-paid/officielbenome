// Test du système d'intelligence avancée d'AIDA
import { aidaIntelligenceService } from './src/services/aidaIntelligence.service.js';

// Simulation des données de test
const mockUserContext = {
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  },
  preferences: {
    favoriteCategories: ['Immobilier', 'Automobile'],
    preferredLocations: ['Dakar', 'Thiès'],
    budgetRange: '500k-2M'
  },
  behavior: {
    categories: { 'Immobilier': 5, 'Automobile': 3, 'Services': 2 },
    locations: { 'Dakar': 8, 'Thiès': 2 },
    frequency: 10
  },
  currentPage: {
    type: 'listing_detail',
    context: {
      listingId: 'listing-123',
      action: 'viewing_listing'
    }
  },
  marketInsights: {
    trendingCategories: ['Immobilier', 'Automobile', 'Services'],
    newListings: 15
  }
};

// Test des fonctionnalités principales
async function testAIDAIntelligence() {
  console.log('🧠 Test du système d\'intelligence avancée AIDA\n');

  // Test 1: Génération d'étapes de thinking
  console.log('📋 Test 1: Génération d\'étapes de thinking');
  const thinkingSteps = aidaIntelligenceService.getAdvancedThinkingSteps(mockUserContext, 'Je cherche un appartement à Dakar avec un budget de 1M');
  console.log('Étapes générées:', thinkingSteps.length);
  thinkingSteps.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step.title} (${step.duration}ms)`);
  });
  console.log('');

  // Test 2: Recommandations immédiates
  console.log('🎯 Test 2: Recommandations immédiates');
  const immediateRecs = await aidaIntelligenceService.getImmediateRecommendations('Je cherche une voiture d\'occasion');
  console.log('Recommandations immédiates:', immediateRecs.length);
  immediateRecs.forEach(rec => {
    console.log(`  ${rec.icon} ${rec.value}`);
  });
  console.log('');

  // Test 3: Recommandations contextuelles
  console.log('🔍 Test 3: Recommandations contextuelles');
  const contextualRecs = await aidaIntelligenceService.getContextualRecommendations(mockUserContext.currentPage);
  console.log('Recommandations contextuelles:', contextualRecs.length);
  contextualRecs.forEach(rec => {
    console.log(`  ${rec.icon} ${rec.value}`);
  });
  console.log('');

  // Test 4: Recommandations tendance
  console.log('📈 Test 4: Recommandations tendance');
  const trendingRecs = aidaIntelligenceService.getTrendingRecommendations(mockUserContext.marketInsights);
  console.log('Recommandations tendance:', trendingRecs.length);
  trendingRecs.forEach(rec => {
    console.log(`  ${rec.icon} ${rec.value}`);
  });
  console.log('');

  // Test 5: Recommandations personnalisées
  console.log('⭐ Test 5: Recommandations personnalisées');
  const personalizedRecs = await aidaIntelligenceService.getPersonalizedRecommendations(mockUserContext.preferences);
  console.log('Recommandations personnalisées:', personalizedRecs.length);
  personalizedRecs.forEach(rec => {
    console.log(`  ${rec.icon} ${rec.value}`);
  });
  console.log('');

  // Test 6: Génération complète de recommandations
  console.log('🚀 Test 6: Génération complète de recommandations');
  const allRecommendations = await aidaIntelligenceService.generateRecommendations(mockUserContext, 'Je cherche un appartement à Dakar');
  console.log('Total des recommandations générées:');
  Object.entries(allRecommendations).forEach(([category, recs]) => {
    console.log(`  ${category}: ${recs.length} recommandations`);
  });
  console.log('');

  console.log('✅ Tous les tests terminés avec succès !');
}

// Test des scénarios d'utilisation
async function testUseCases() {
  console.log('🎭 Test des scénarios d\'utilisation\n');

  const scenarios = [
    {
      name: 'Recherche immobilier',
      query: 'Je cherche un appartement 2 chambres à Dakar avec un budget de 1.5M',
      context: { ...mockUserContext, currentPage: { type: 'marketplace' } }
    },
    {
      name: 'Analyse de marché',
      query: 'Quelles sont les tendances du marché immobilier à Dakar ?',
      context: { ...mockUserContext, currentPage: { type: 'real_estate' } }
    },
    {
      name: 'Recommandations personnalisées',
      query: 'Que me recommandes-tu ?',
      context: mockUserContext
    }
  ];

  for (const scenario of scenarios) {
    console.log(`📝 Scénario: ${scenario.name}`);
    console.log(`   Requête: "${scenario.query}"`);
    
    const steps = aidaIntelligenceService.getAdvancedThinkingSteps(scenario.context, scenario.query);
    console.log(`   Étapes de thinking: ${steps.length}`);
    
    const recommendations = await aidaIntelligenceService.generateRecommendations(scenario.context, scenario.query);
    const totalRecs = Object.values(recommendations).flat().length;
    console.log(`   Recommandations générées: ${totalRecs}`);
    console.log('');
  }
}

// Exécution des tests
if (typeof window !== 'undefined') {
  // Dans le navigateur
  window.testAIDAIntelligence = testAIDAIntelligence;
  window.testUseCases = testUseCases;
  console.log('🧪 Tests AIDA disponibles: testAIDAIntelligence() et testUseCases()');
} else {
  // Dans Node.js
  testAIDAIntelligence().catch(console.error);
  testUseCases().catch(console.error);
}

export { testAIDAIntelligence, testUseCases };
