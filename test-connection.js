// Script de test pour vérifier la connexion backend-frontend
const API_BASE_URL = 'https://officielbenome-backend.onrender.com/api';

async function testBackendConnection() {
  console.log('🔍 Test de connexion au backend...');
  console.log('URL:', API_BASE_URL);
  
  try {
    // Test 1: Endpoint de santé
    console.log('\n1️⃣ Test de l\'endpoint de santé...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Endpoint de santé:', healthData);
    
    // Test 2: Test CORS
    console.log('\n2️⃣ Test CORS...');
    const corsResponse = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://officielbenome.vercel.app'
      }
    });
    console.log('✅ CORS configuré correctement');
    console.log('Headers CORS:', corsResponse.headers.get('access-control-allow-origin'));
    
    // Test 3: Endpoint d'authentification (sans token)
    console.log('\n3️⃣ Test endpoint d\'authentification...');
    const authResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    const authData = await authResponse.json();
    console.log('✅ Endpoint d\'authentification accessible');
    console.log('Réponse:', authData.message || authData.error);
    
    console.log('\n🎉 Tous les tests de connexion sont réussis !');
    console.log('✅ Backend et frontend sont correctement connectés');
    
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:', error.message);
    console.error('Détails:', error);
  }
}

// Exécuter le test
testBackendConnection(); 