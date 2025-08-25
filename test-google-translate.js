// Test simple de l'API Google Translate
const API_KEY = 'AIzaSyBMyapIVE6bovgq8G-xnH0bddhXeckIfL0';

async function testGoogleTranslate() {
  console.log('🧪 Test de l\'API Google Translate...\n');
  
  const testText = 'Hello, how are you?';
  const targetLanguage = 'fr';
  
  try {
    console.log(`📝 Texte à traduire: "${testText}"`);
    console.log(`🎯 Langue cible: ${targetLanguage}\n`);
    
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: testText,
        source: 'en',
        target: targetLanguage,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.data && data.data.translations && data.data.translations[0]) {
      const translation = data.data.translations[0].translatedText;
      console.log('✅ SUCCÈS !');
      console.log(`🌍 Traduction: "${testText}" → "${translation}"`);
      console.log('\n🎉 L\'API Google Translate fonctionne parfaitement !');
    } else {
      console.log('❌ Réponse invalide:', data);
    }
    
  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    console.log('\n🔍 Détails de l\'erreur:');
    console.log('- Vérifiez que la clé API est correcte');
    console.log('- Vérifiez que l\'API Cloud Translation est activée');
    console.log('- Vérifiez les restrictions de la clé API');
  }
}

// Exécuter le test
testGoogleTranslate();
