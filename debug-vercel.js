// Script de diagnostic pour l'API Mistral
// Usage: node debug-vercel.js

const fetch = require('node-fetch');

async function testMistralAPI() {
  console.log('🔍 Diagnostic de l\'API Mistral...\n');

  // Test 1: Vérifier la variable d'environnement
  console.log('1. Vérification de la variable d\'environnement MISTRAL_API_KEY:');
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.log('❌ MISTRAL_API_KEY n\'est pas définie');
    console.log('💡 Solution: Ajoutez MISTRAL_API_KEY dans vos variables d\'environnement Vercel');
    return;
  }
  console.log('✅ MISTRAL_API_KEY est définie');
  console.log(`   Longueur: ${apiKey.length} caractères`);
  console.log(`   Format: ${apiKey.startsWith('r') ? 'Format Mistral détecté' : 'Format inattendu'}\n`);

  // Test 2: Tester l'API Mistral directement
  console.log('2. Test direct de l\'API Mistral:');
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'user', content: 'Bonjour, test simple' }
        ],
        max_tokens: 10
      })
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Mistral fonctionne correctement');
      console.log(`   Modèle utilisé: ${data.model}`);
      console.log(`   Tokens utilisés: ${data.usage?.total_tokens || 'N/A'}`);
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur API Mistral:');
      console.log(`   Détails: ${errorText}`);
      
      if (response.status === 401) {
        console.log('💡 Solution: Vérifiez que votre clé API Mistral est valide');
      } else if (response.status === 429) {
        console.log('💡 Solution: Limite de requêtes atteinte, attendez quelques minutes');
      } else if (response.status === 403) {
        console.log('💡 Solution: Vérifiez les permissions de votre clé API');
      }
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }

  console.log('\n3. Test de l\'endpoint local /api/chat:');
  try {
    const localResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Test local' }
        ],
        context: { path: '/test' }
      })
    });

    console.log(`   Status: ${localResponse.status} ${localResponse.statusText}`);
    
    if (localResponse.ok) {
      const data = await localResponse.json();
      console.log('✅ Endpoint local fonctionne');
      console.log(`   Réponse: ${data.content?.substring(0, 50)}...`);
    } else {
      const errorData = await localResponse.json().catch(() => ({}));
      console.log('❌ Erreur endpoint local:');
      console.log(`   Détails: ${errorData.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    console.log('❌ Impossible de tester l\'endpoint local:', error.message);
    console.log('💡 Assurez-vous que le serveur de développement est démarré');
  }

  console.log('\n📋 Résumé des actions à effectuer:');
  console.log('1. Vérifiez que MISTRAL_API_KEY est définie dans Vercel');
  console.log('2. Vérifiez que la clé API est valide et active');
  console.log('3. Vérifiez les quotas et limites de votre compte Mistral');
  console.log('4. Redéployez l\'application après avoir mis à jour les variables d\'environnement');
}

// Exécuter le diagnostic
testMistralAPI().catch(console.error); 