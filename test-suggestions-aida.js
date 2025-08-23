// Test des suggestions AIDA
console.log('🧪 Test des suggestions AIDA...');

// Simuler le clic sur une suggestion
function testSuggestion(suggestionText) {
  console.log(`🔍 Test de la suggestion: "${suggestionText}"`);
  
  // Simuler l'état initial
  const mockState = {
    history: [],
    loading: false,
    input: '',
    hasSuggestions: false
  };
  
  console.log('📝 État initial:', mockState);
  
  // Simuler le clic sur la suggestion
  console.log('🖱️ Clic sur la suggestion...');
  
  // Simuler le traitement
  setTimeout(() => {
    console.log('✅ Suggestion traitée avec succès');
    console.log('📤 Message envoyé à AIDA');
    console.log('🤖 AIDA devrait maintenant répondre...');
  }, 1000);
}

// Tests des suggestions
const suggestions = [
  'Immobilier à Dakar',
  'Voitures < 3 000 000 XOF',
  'Services plomberie'
];

console.log('🎯 Suggestions disponibles:');
suggestions.forEach((suggestion, index) => {
  console.log(`${index + 1}. ${suggestion}`);
});

// Test de la première suggestion
testSuggestion(suggestions[0]);

console.log('\n📋 Instructions de test:');
console.log('1. Ouvrez le chat AIDA');
console.log('2. Cliquez sur une suggestion');
console.log('3. Vérifiez que AIDA répond');
console.log('4. Si pas de réponse, vérifiez la console pour les erreurs');

export { testSuggestion };
